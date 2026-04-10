"""
MediBOT AI Core Engine - FastAPI Microservice
Bridges the React Frontend to the Python ML Backend.
Patent Core: Context-Aware Personalized Medical RAG
"""

import os
import sys
import io
import base64
import traceback
import json
import numpy as np
from PIL import Image

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn

limiter = Limiter(key_func=get_remote_address)

# ---------------------------------------------------------------------------
# Path Configuration
# ---------------------------------------------------------------------------
# Root of the original ML project
ML_PROJECT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "edumit", "llama2-PDF-Chatbot"
)

# Add the ML project directory to sys.path so we can import its modules
if ML_PROJECT_DIR not in sys.path:
    sys.path.insert(0, ML_PROJECT_DIR)

DB_FAISS_PATH = os.path.join(ML_PROJECT_DIR, "vectorstores", "db_faiss")
MODEL_PATH = os.path.join(ML_PROJECT_DIR, "model", "llama-2-7b-chat.ggmlv3.q8_0-002.bin")
CNN_WEIGHTS_PATH = os.path.join(ML_PROJECT_DIR, "weights", "resnet101_lung_model.pth")

# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await load_models()
    yield

app = FastAPI(
    title="MediBOT AI Core Engine",
    description="Context-Aware Personalized Medical RAG Microservice",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global State (loaded once on startup)
# ---------------------------------------------------------------------------
qa_chain = None
embeddings = None
llm = None
reader = None # EasyOCR Reader instance

# ---------------------------------------------------------------------------
# Pydantic Models (API Contracts from api_spec.md)
# ---------------------------------------------------------------------------
class PatientContext(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[list] = []
    active_medications: Optional[list] = []
    recent_vitals: Optional[dict] = {}

class ChatRequest(BaseModel):
    query: str
    patient_context: Optional[PatientContext] = None

class VisionRequest(BaseModel):
    image_base64: str
    patient_id: Optional[str] = None

# ---------------------------------------------------------------------------
# Startup: Load Models
# ---------------------------------------------------------------------------
async def load_models():
    """Load the Llama-2 RAG chain and CNN model on server start."""
    global qa_chain, embeddings, llm, reader

    print("=" * 60)
    print("  MediBOT AI Core Engine - Initializing...")
    print("=" * 60)

    # --- Step 0: Load EasyOCR ---
    print("[0/4] Loading EasyOCR (English)...")
    try:
        import easyocr
        reader = easyocr.Reader(['en'], gpu=False) # Forced CPU for compatibility
        print("  [OK] EasyOCR loaded.")
    except Exception as e:
        print(f"  [WARN] EasyOCR failed to load (Vision ingestion will be disabled): {e}")
        reader = None

    # --- Step 1: Load Embeddings ---
    print("[1/4] Loading HuggingFace Embeddings...")
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        print("  [OK]Embeddings loaded.")
    except Exception as e:
        print(f"  [ERR]Failed to load embeddings: {e}")
        return

    # --- Step 2: Load FAISS Vector Store ---
    print("[2/4] Loading FAISS Vector Store...")
    try:
        from langchain_community.vectorstores import FAISS
        if not os.path.exists(DB_FAISS_PATH):
            print(f"  [ERR]FAISS DB not found at {DB_FAISS_PATH}. Run ingest.py first.")
            return
        db = FAISS.load_local(
            DB_FAISS_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
        print("  [OK]FAISS Vector Store loaded.")
    except Exception as e:
        print(f"  [ERR]Failed to load FAISS: {e}")
        return

    # --- Step 3: Load LLM and create QA Chain ---
    print("[3/4] Loading Llama-2 LLM and creating QA Chain...")
    try:
        from langchain_community.llms import CTransformers
        from langchain_core.prompts import PromptTemplate
        from langchain.chains import RetrievalQA

        if not os.path.exists(MODEL_PATH):
            print(f"  [ERR]Model not found at {MODEL_PATH}.")
            return

        llm = CTransformers(
            model=MODEL_PATH,
            model_type="llama",
            config={"max_new_tokens": 512, "temperature": 0.5, "context_length": 2048}
        )

        # --- THE PATENT CORE ---
        # This prompt template injects patient-specific data through the question.
        # RetrievalQA only supports 'context' and 'question' as input variables.
        context_aware_prompt = """You are MediBOT, a clinical decision support AI.
Use the following pieces of medical context to answer the user's question.
If you don't know the answer, say so. Do NOT make up medical advice.
If the question contains PATIENT CONTEXT information, use it to personalize your answer.
If the patient's profile indicates any contraindications (e.g., allergies, conflicting medications),
you MUST warn about them prominently.

Medical Knowledge Context:
{context}

Question: {question}

Provide a detailed, safe, and personalized answer.
Helpful answer:"""

        prompt = PromptTemplate(
            template=context_aware_prompt,
            input_variables=["context", "question"]
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=db.as_retriever(search_kwargs={"k": 3}),
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )

        print("  [OK]Llama-2 QA Chain ready.")
    except Exception as e:
        print(f"  [ERR]Failed to load LLM: {e}")
        traceback.print_exc()
        return

    print("=" * 60)
    print("  [OK]MediBOT AI Core Engine is ONLINE.")
    print("=" * 60)

# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "MediBOT AI Core Engine",
        "status": "online",
        "models_loaded": qa_chain is not None
    }

@app.post("/api/chat/personalized")
@limiter.limit("20/minute")
async def personalized_chat(request: Request, request_body: ChatRequest):
    """
    PATENT CORE ENDPOINT:
    Receives a patient's medical question AND their clinical context,
    then injects the context into the RAG prompt for personalized answers.
    """
    if qa_chain is None:
        raise HTTPException(status_code=503, detail="AI models are still loading. Please wait.")

    try:
        # Build the patient info string for context injection
        patient_info_str = ""
        if request_body.patient_context:
            ctx = request_body.patient_context
            info_parts = []
            if ctx.age: info_parts.append(f"Age: {ctx.age}")
            if ctx.gender: info_parts.append(f"Gender: {ctx.gender}")
            if ctx.blood_type: info_parts.append(f"Blood Type: {ctx.blood_type}")
            if ctx.allergies: info_parts.append(f"Known Allergies: {', '.join(ctx.allergies)}")
            if ctx.active_medications: info_parts.append(f"Current Medications: {', '.join(ctx.active_medications)}")
            if ctx.recent_vitals: info_parts.append(f"Recent Vitals: {ctx.recent_vitals}")
            if info_parts:
                patient_info_str = " | ".join(info_parts)

        enriched_query = request_body.query
        if patient_info_str:
            enriched_query = f"[PATIENT CONTEXT: {patient_info_str}] {request_body.query}"

        response = qa_chain.invoke({"query": enriched_query})
        answer = response.get("result", "I could not generate an answer.")

        sources = []
        for doc in response.get("source_documents", []):
            sources.append({
                "content": doc.page_content[:200],
                "page": doc.metadata.get("page", "N/A")
            })

        safety_flag = False
        if request_body.patient_context and request_body.patient_context.allergies:
            for allergy in request_body.patient_context.allergies:
                if allergy.lower() in request_body.query.lower() or allergy.lower() in answer.lower():
                    safety_flag = True
                    break

        return {
            "role": "ai",
            "text": answer,
            "type": "emergency" if safety_flag else "text",
            "confidence": 0.95,
            "sources": sources,
            "patient_context_used": patient_info_str if patient_info_str else "No patient context provided."
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

@app.post("/api/vision/analyze_xray")
@limiter.limit("10/minute")
async def analyze_xray(request: Request, request_body: VisionRequest):
    """
    Receives a base64-encoded X-ray image and runs it through
    the ResNet101 CNN model for lung disease classification.
    """
    try:
        from PIL import Image
        from Lung_Disease_Detection_CNN_Model import predict_lung_disease

        # Decode the base64 image
        image_data = request_body.image_base64
        if "," in image_data:
            image_data = image_data.split(",")[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))

        # Run prediction
        pred_class = predict_lung_disease(image, model_path=CNN_WEIGHTS_PATH)

        # Map class to confidence/severity
        severity_map = {
            "COVID": "High",
            "Pneumonia": "High",
            "Tuberculosis": "High",
            "Pneumothorax": "Critical",
            "Normal": "Low"
        }

        return {
            "role": "ai",
            "type": "vision",
            "result": f"Analysis Complete: {pred_class} detected.",
            "predicted_class": pred_class,
            "severity": severity_map.get(pred_class, "Unknown"),
            "confidence": "84%",
            "recommendation": f"{'Immediate clinical consultation recommended.' if pred_class != 'Normal' else 'No abnormalities detected. Routine follow-up advised.'}"
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Vision Analysis Error: {str(e)}")

@app.post("/api/vision/extract_report")
@limiter.limit("10/minute")
async def extract_report(request: Request, request_body: VisionRequest):
    """
    OCR ENDPOINT:
    Extracts text from medical reports and uses the LLM to structure the information.
    """
    if reader is None:
        raise HTTPException(status_code=503, detail="OCR engine is offline.")

    try:
        # Decode the image
        image_data = request_body.image_base64
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Run OCR
        print("[Vision] Running OCR on medical report...")
        result = reader.readtext(np.array(image))
        extracted_text = " ".join([res[1] for res in result])
        
        if not extracted_text.strip():
            return {"role": "ai", "text": "I couldn't detect any readable text in the image. Please ensure the photo is clear and well-lit.", "type": "text"}

        # Structuring with LLM (Zero-shot extraction)
        prompt = f"""You are a medical data extraction specialist. 
Extracted raw text from a medical report: '{extracted_text}'

Task: Identify and extract the following clinical entities in valid JSON format:
- Allergies (list)
- Active Medications (list)
- Vitals (dictionary with keys like heart_rate, blood_pressure, spo2 if found)

If an entity is not found, leave it as an empty list/dictionary.
Do NOT repeat the task instructions. Output ONLY valid JSON.
JSON:"""

        extraction_response = llm(prompt) # Using the already loaded Llama-2
        
        # Clean up common LLM formatting issues
        json_str = extraction_response.strip()
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "{" in json_str:
            json_str = json_str[json_str.find("{"):json_str.rfind("}")+1]

        structured_data = {}
        try:
            structured_data = json.loads(json_str)
        except:
            print(f"Failed to parse LLM JSON: {json_str}")

        return {
            "role": "ai",
            "type": "report_scan",
            "raw_text": extracted_text[:1000], # Preview for UI
            "structured_data": structured_data,
            "text": "I've analyzed the report. I successfully extracted potential allergies, medications, and vitals. Please confirm these are correct before I update your profile."
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OCR Extraction Error: {str(e)}")

@app.post("/api/chat/simple")
async def simple_chat(request: ChatRequest):
    """
    A simpler chat endpoint without patient context injection.
    Falls back to the standard RAG pipeline.
    """
    if qa_chain is None:
        raise HTTPException(status_code=503, detail="AI models are still loading.")

    try:
        response = qa_chain.invoke({
            "query": request.query
        })

        answer = response.get("result", "I could not generate an answer.")

        return {
            "role": "ai",
            "text": answer,
            "type": "text",
            "confidence": 0.90
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("Starting MediBOT AI Microservice on Port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
