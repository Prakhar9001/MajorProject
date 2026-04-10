# MediBOT — Implementation Roadmap
> Generated from full codebase audit · April 2026  
> Two-developer team · Ship-fast priority · Production target

---

## 1. What This Product Actually Is

MediBOT is a **dual-role AI-powered clinical intelligence platform**:

- **Patients** get: personalized medical Q&A (RAG + Llama-2), lung X-ray analysis (ResNet101 CNN), medical report OCR, prescription management, health vitals tracking, and an offline-first experience.
- **Doctors** get: a patient monitoring console with live vitals, AI-generated summaries, and triage prioritization.

The core AI engine is done. The gap is **data wiring** — the frontend has beautiful UI with hardcoded dummy data. The job is to replace every hardcoded value with real data and connect the frontend to the backend.

---

## 2. Current State: Honest Audit

### What Works ✅
| Component | Status | Notes |
|-----------|--------|-------|
| Firebase Auth (email + Google OAuth) | ✅ Working | Login, signup, session persistence |
| Role routing (patient/doctor) | ✅ Working | Stored in Firestore `users/{uid}` |
| FastAPI AI backend (`api_bridge.py`) | ✅ Working | Port 8000, models loaded |
| Llama-2 RAG chat | ✅ Working | `/api/chat/personalized` |
| ResNet101 X-ray CNN | ✅ Working | `/api/vision/analyze_xray` |
| OCR report extraction | ✅ Working | `/api/vision/extract_report` |
| Dexie.js offline schema | ✅ Implemented | chatHistory, vitals, diagnostics |
| AI Diagnostic Lab UI | ✅ UI done | Calls API — **wrong URL** (relative vs absolute) |

### What Is Dummy/Broken ❌
| Component | Problem |
|-----------|---------|
| Health vitals (72 bpm, 98% SpO2, 4500 steps) | Hardcoded static numbers |
| Activity chart | Hardcoded percentages array |
| Health Score (84%) | Hardcoded |
| Medical Timeline events | Hardcoded array (appendectomy, COVID booster) |
| "Sync New Data" button | Fake progress animation, uploads nothing |
| Prescription Manager | Hardcoded meds array (Warfarin, Lisinopril, etc.) |
| "Save to Profile" buttons | No-op — saves nothing |
| Doctor patient list | `mockPatients` with `Math.random()` fake vitals |
| Doctor patient charts | Recharts with random data |
| AI Chat panel | Not wired to `api_bridge.py` |
| Patient ID | Hardcoded `#MB-99281-X` everywhere |
| API calls in Diagnostic Lab | Calls relative `/api/...` — fails across ports |

### The Core Integration Gap
```
Frontend (port 3000) calls: fetch('/api/vision/analyze_xray')
                                      ↑
                              This resolves to port 3000.
                              Backend is on port 8000.
                              All AI calls silently fail.

Fix: VITE_API_URL=http://localhost:8000 + update all fetch() calls
```

---

## 3. Tech Stack (Keep What Works, Add What's Missing)

### Keep — Already in Codebase
| Layer | Tech | Why Keep |
|-------|------|----------|
| Frontend Framework | React 18 + TypeScript + Vite | Already working, fast |
| Styling | Tailwind CSS | Already in use, consistent |
| Animations | Framer Motion (`motion/react`) | Already working well |
| Icons | Lucide React | Already in use |
| Charts | Recharts | Already used in DoctorDashboard |
| Auth | Firebase Authentication | Live project `medibot-ai-2519c`, working |
| Primary DB | Firestore | Already configured, extend it |
| Offline DB | Dexie.js (IndexedDB) | Schema defined, wire it up |
| AI Backend | FastAPI + Llama-2 + ResNet101 | Core feature, working |
| State (local) | React `useState` + `useEffect` | Fine for current scale |

### Add — Missing Pieces
| Layer | Add | Why |
|-------|-----|-----|
| Global state | Zustand | Replace prop-drilling; patient profile needs to be global |
| API client | Axios with base URL from env | Replace raw `fetch()` calls; centralized error handling |
| Forms | React Hook Form + Zod | Profile edit, prescription forms need validation |
| Notifications | React Hot Toast | User feedback on save/error actions |
| File handling | Browser native FileReader | Already partially used; formalize it |
| QR codes | `qrcode.react` | Prescription QR is in the UI, needs implementation |
| Date handling | `date-fns` | Timeline, prescriptions need date formatting |
| Environment config | `.env` files (`VITE_API_URL`) | Needed to switch dev/prod API URL |

### Do Not Add (Yet)
- Redux — overkill for 2 devs
- GraphQL — REST is fine
- Next.js — Vite works, migration = waste of time
- WebSockets — not needed until real-time vitals from hardware

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER                           │
│                                                     │
│  React App (Vite, port 3000)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ LoginGateway│  │PatientDashbrd│  │DoctorDashb│  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                │                │         │
│  ┌──────▼────────────────▼────────────────▼──────┐  │
│  │           Zustand Store (global state)        │  │
│  │  currentUser, patientProfile, chatHistory     │  │
│  └──────────────────────┬────────────────────────┘  │
│                         │                           │
│  ┌──────────────────────▼────────────────────────┐  │
│  │         Axios API Client (apiClient.ts)       │  │
│  │  baseURL = VITE_API_URL || VITE_FIREBASE_URL  │  │
│  └──────┬───────────────────────────┬────────────┘  │
│         │                           │               │
│  ┌──────▼──────┐           ┌────────▼────────┐      │
│  │  Dexie.js   │           │  Firebase SDK   │      │
│  │ (IndexedDB) │           │  Auth+Firestore │      │
│  │ offline data│           │  cloud data     │      │
│  └─────────────┘           └─────────────────┘      │
└──────────────────────────┬──────────────────────────┘
                           │ HTTP (port 8000)
                           │ VITE_API_URL
┌──────────────────────────▼──────────────────────────┐
│           FastAPI AI Backend (api_bridge.py)        │
│                                                     │
│  POST /api/chat/personalized   ← Llama-2 RAG        │
│  POST /api/vision/analyze_xray ← ResNet101 CNN      │
│  POST /api/vision/extract_report ← EasyOCR + LLM   │
│  GET  /                        ← health check       │
│                                                     │
│  edumit/llama2-PDF-Chatbot/                         │
│  ├── model/llama-2-7b-chat.ggmlv3.q8_0-002.bin     │
│  ├── weights/resnet101_lung_model.pth               │
│  └── vectorstores/db_faiss/                         │
└─────────────────────────────────────────────────────┘
```

### Data Flow: Chat Message
```
User types → Zustand updates draft
→ Send click → apiClient.post('/api/chat/personalized', { query, patient_context })
→ patient_context injected from Zustand store (age, allergies, meds, vitals)
→ FastAPI → Llama-2 RAG → answer
→ Response saved to: Dexie (offline) + Firestore (cloud sync)
→ UI renders response, sources, safety flags
```

---

## 5. Firestore Schema (Extend, Don't Replace)

```
users/{uid}                     ← ALREADY EXISTS
  email: string
  role: 'patient' | 'doctor'
  createdAt: string

patients/{uid}                  ← ADD THIS
  name: string
  age: number
  gender: string
  bloodType: string
  allergies: string[]
  activeMedications: string[]
  recentVitals: {
    heartRate: number
    spo2: number
    steps: number
    updatedAt: timestamp
  }
  doctorUid?: string            ← links patient to doctor

chatHistory/{uid}/messages/{id} ← ADD THIS (subcollection)
  role: 'user' | 'ai'
  text: string
  type: 'text' | 'emergency' | 'vision'
  patientContext?: object
  timestamp: timestamp
  synced: boolean

diagnostics/{uid}/results/{id}  ← ADD THIS (subcollection)
  imageHash: string
  predictedClass: string
  severity: string
  confidence: string
  recommendation: string
  timestamp: timestamp

prescriptions/{uid}/meds/{id}   ← ADD THIS (subcollection)
  name: string
  dosage: string
  frequency: string
  type: string
  status: 'active' | 'completed'
  remainingDays: number
  prescribedBy: string
  startDate: timestamp

medicalEvents/{uid}/events/{id} ← ADD THIS (subcollection)
  date: string
  title: string
  description: string
  doctor: string
  type: 'surgery' | 'checkup' | 'med' | 'birth'

doctorPatients/{doctorUid}      ← ADD THIS
  patientUids: string[]         ← doctor's patient list
```

---

## 6. Feature Breakdown — What to Build, Exactly

### Feature 1: API Client + Environment Config
**What:** Central Axios instance, env vars, Vite proxy  
**Why first:** Everything else depends on this. Currently all AI features silently fail.

```typescript
// src/lib/apiClient.ts
import axios from 'axios';
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 120000, // 2 min — Llama-2 is slow
});
export default apiClient;
```

```env
# .env.development
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_PROJECT=medibot-ai-2519c
```

Files to create: `src/lib/apiClient.ts`, `.env.development`, `.env.production`  
Files to update: `AIDiagnosticLab` (2 fetch calls → apiClient), `ClinicalChat`

---

### Feature 2: Patient Profile (Firestore ↔ Zustand)
**What:** Load real patient data on login, store globally, use everywhere  
**Kills:** Every hardcoded "Patient ID: #MB-99281-X", static vitals, empty patient name

```typescript
// src/store/usePatientStore.ts (Zustand)
interface PatientStore {
  profile: PatientRecord | null;
  setProfile: (p: PatientRecord) => void;
  updateVitals: (v: Partial<VitalsSnapshot>) => void;
}
```

**On login:** `getDoc(doc(db, 'patients', uid))` → populate Zustand  
**On first login:** Show profile setup wizard (name, age, allergies, meds)

Frontend components: `ProfileSetupModal.tsx`, update `Header` to use real name  
Firestore writes: `setDoc(doc(db, 'patients', uid), profileData)`

---

### Feature 3: Wire Chat to AI Backend
**What:** ClinicalChat calls `POST /api/chat/personalized` with real patient context  
**Kills:** The chat tab being completely non-functional

```typescript
// In ClinicalChat component
const sendMessage = async (text: string) => {
  const patientContext = usePatientStore.getState().profile;
  const response = await apiClient.post('/api/chat/personalized', {
    query: text,
    patient_context: {
      age: patientContext.age,
      allergies: patientContext.allergies,
      active_medications: patientContext.activeMedications,
      recent_vitals: patientContext.recentVitals,
    }
  });
  // Save to Dexie (offline) + Firestore (cloud)
  await saveChatMessage(uid, 'ai', response.data.text, response.data.type);
};
```

Also: load chat history from Dexie on mount with `getChatHistory(uid)`

---

### Feature 4: Fix AI Diagnostic Lab URL + Save Results
**What:** Two-line URL fix + wire "Save to Profile" button  
**Kills:** The only already-wired feature that currently silently fails

```typescript
// Change relative to absolute:
const response = await apiClient.post(`/api/vision/${mode === 'imaging' ? 'analyze_xray' : 'extract_report'}`, {...});

// Wire "Save to Profile":
await saveDiagnosticResult(uid, result);
await addDoc(collection(db, 'diagnostics', uid, 'results'), { ...result, timestamp: serverTimestamp() });
```

---

### Feature 5: Real Health Vitals
**What:** Replace the 4 hardcoded metric cards with real Firestore data  
**Options (pick one):**
- **Manual entry** (MVP): Patient inputs vitals → saves to Firestore → displays
- **Smartwatch** (Phase 2): Web Bluetooth API or Apple Health export

For MVP — add a "Update Vitals" modal:
```typescript
// Vitals update → Firestore
await updateDoc(doc(db, 'patients', uid), {
  'recentVitals.heartRate': heartRate,
  'recentVitals.spo2': spo2,
  'recentVitals.steps': steps,
  'recentVitals.updatedAt': serverTimestamp(),
});
// Also save snapshot to vitals subcollection for history
await addDoc(collection(db, 'patients', uid, 'vitalsHistory'), {...});
```

Charts: Pull last 7 days of `vitalsHistory` snapshots → replace hardcoded bar chart data

---

### Feature 6: Medical Timeline → Firestore
**What:** Replace hardcoded events array with real Firestore subcollection  
**Kills:** The "Sync New Data" fake animation

```typescript
// Load events
const events = await getDocs(collection(db, 'medicalEvents', uid, 'events'));

// Add event (doctor can add, patient can add self-reported)
await addDoc(collection(db, 'medicalEvents', uid, 'events'), {
  date: selectedDate,
  title, description, doctor, type,
  createdAt: serverTimestamp(),
});
```

Wire the "Sync New Data" button to open an `AddEventModal.tsx`

---

### Feature 7: Prescription Manager → Firestore
**What:** Replace hardcoded meds array with Firestore subcollection  
**Keep:** The Aspirin+Warfarin interaction warning logic (it's good, generalize it)

```typescript
// Load prescriptions
const meds = await getDocs(collection(db, 'prescriptions', uid, 'meds'));

// Add prescription (+ basic drug interaction check)
const interactions = checkInteractions(newMed, existingMeds); // local logic
if (interactions.length) showWarning(interactions);
else await addDoc(collection(db, 'prescriptions', uid, 'meds'), medData);
```

Also wire: QR code generation using `qrcode.react` → encodes patient allergies + active meds as emergency data

---

### Feature 8: Doctor Dashboard → Real Patient Data
**What:** Replace `mockPatients` with real Firestore patient data linked to doctor  
**Schema:** `doctorPatients/{doctorUid}` stores array of patient UIDs

```typescript
// Load doctor's patients
const docRef = doc(db, 'doctorPatients', doctorUid);
const patientUids = (await getDoc(docRef)).data()?.patientUids || [];
const patients = await Promise.all(
  patientUids.map(uid => getDoc(doc(db, 'patients', uid)))
);
```

For the live vitals charts — replace `Math.random()` with real vitalsHistory snapshots from each patient's subcollection.

---

## 7. Execution Plan

### Phase 1 — Wire Everything That Exists (Week 1-2)
**Goal:** Zero hardcoded data. Everything that's built actually works.

| Order | Task | Hours | Who |
|-------|------|-------|-----|
| 1 | Create `apiClient.ts` + `.env` files | 1h | Dev 1 |
| 2 | Fix Diagnostic Lab URL (2-line fix) | 0.5h | Dev 1 |
| 3 | Install Zustand, create `usePatientStore` | 2h | Dev 1 |
| 4 | Patient profile: Firestore read on login | 3h | Dev 1 |
| 5 | Profile setup wizard (first login) | 4h | Dev 2 |
| 6 | Wire chat to `/api/chat/personalized` | 3h | Dev 2 |
| 7 | Chat history: Dexie load + Firestore sync | 2h | Dev 2 |
| 8 | Vitals: manual entry modal + Firestore save | 3h | Dev 1 |
| 9 | Vitals: display real data in metric cards | 1h | Dev 1 |
| 10 | Timeline: Firestore load + AddEvent modal | 4h | Dev 2 |
| 11 | Prescriptions: Firestore CRUD | 4h | Dev 1 |
| 12 | Save Diagnostic results to Firestore | 1h | Dev 2 |

**Phase 1 Exit Criteria:**
- [ ] Can log in, see real name in header
- [ ] Can send a chat message, get real AI response
- [ ] Can upload X-ray, get real CNN result, save it
- [ ] Can add/view prescriptions from Firestore
- [ ] Vitals show the value you entered, not 72/98/4500

---

### Phase 2 — Doctor Dashboard + Data Linking (Week 3)
**Goal:** Doctors see real patients. Doctor-patient relationship works.

| Order | Task | Hours |
|-------|------|-------|
| 1 | `doctorPatients` Firestore collection setup | 1h |
| 2 | Patient invite/link flow (doctor adds patient by email) | 4h |
| 3 | Doctor dashboard: load real patients from Firestore | 3h |
| 4 | Patient vitals charts: real data via Recharts | 3h |
| 5 | Doctor can view patient chat history (read-only) | 2h |
| 6 | Doctor can add medical events to patient timeline | 2h |
| 7 | Triage priority: auto-assign based on latest vitals thresholds | 3h |

---

### Phase 3 — Polish + Production Hardening (Week 4)
**Goal:** Stable, deployable, no crashes.

| Task | Notes |
|------|-------|
| Error boundaries on all panels | Don't let one crash kill the whole app |
| Loading skeletons | Replace blank states with skeleton UI |
| Offline detection banner | Show when IndexedDB is primary source |
| Delta sync: Dexie → Firestore | Flush `synced: false` records on reconnect |
| QR code for prescription emergency card | `qrcode.react`, encodes allergies + meds |
| Input validation (React Hook Form + Zod) | Profile form, add prescription, add event |
| Firebase Security Rules | Lock down Firestore — patients can only read own data |
| Rate limiting on AI endpoints | `slowapi` on FastAPI — prevent abuse |
| Toast notifications | React Hot Toast for save/error feedback |
| Mobile responsiveness audit | Already responsive but test on real devices |

---

### Phase 4 — Deployment (Week 5)
See Section 9.

---

## 8. Folder Structure

```
Medibot-UIiiiiiiiiiii/
├── src/
│   ├── lib/
│   │   ├── firebase.ts          ← exists, keep
│   │   ├── db.ts                ← exists, keep
│   │   └── apiClient.ts         ← ADD: Axios instance with baseURL
│   │
│   ├── store/
│   │   ├── usePatientStore.ts   ← ADD: Zustand — patient profile + vitals
│   │   └── useAuthStore.ts      ← ADD: Zustand — auth state
│   │
│   ├── hooks/
│   │   ├── usePatientData.ts    ← ADD: Firestore subscription hook
│   │   └── useChatHistory.ts    ← ADD: Dexie + Firestore chat history hook
│   │
│   ├── components/
│   │   ├── LoginGateway.tsx     ← exists, keep
│   │   ├── PatientDashboard.tsx ← exists, wire up
│   │   ├── DoctorDashboard.tsx  ← exists, wire up
│   │   │
│   │   ├── modals/
│   │   │   ├── ProfileSetupModal.tsx    ← ADD
│   │   │   ├── AddVitalsModal.tsx       ← ADD
│   │   │   ├── AddEventModal.tsx        ← ADD
│   │   │   └── AddPrescriptionModal.tsx ← ADD
│   │   │
│   │   └── shared/
│   │       ├── LoadingSkeleton.tsx ← ADD
│   │       └── ErrorBoundary.tsx   ← ADD
│   │
│   ├── App.tsx                  ← exists, minor update
│   ├── main.tsx                 ← exists, keep
│   └── index.css                ← exists, keep
│
├── .env.development             ← ADD
├── .env.production              ← ADD
├── vite.config.ts               ← UPDATE: add proxy for /api
└── package.json

AI Backend (repo root):
├── api_bridge.py                ← working, keep
└── edumit/llama2-PDF-Chatbot/
    ├── model/                   ← gitignored, use download_model.py
    ├── weights/                 ← LFS tracked
    └── vectorstores/            ← LFS tracked
```

---

## 9. Deployment Plan

### Frontend → Firebase Hosting (free tier is fine)
```bash
npm run build              # Vite builds to dist/
firebase deploy --only hosting
```
Firebase Hosting is already set up (`firebase.json` exists). Just run it.

### AI Backend → The hard part
The 7GB model cannot run on standard hosting. Options:

| Option | Cost | Effort | Recommended |
|--------|------|--------|-------------|
| **RunPod / Vast.ai GPU** | ~$0.3/hr on-demand | Low | ✅ Yes for demo/testing |
| **Google Cloud Run + GPU** | Pay per request | Medium | ✅ Yes for production |
| **Railway.app (CPU only)** | $5/mo | Minimal | ⚠️ Slow (no GPU, Llama-2 on CPU = 60s/response) |
| **Keep local, ngrok tunnel** | Free | Zero | ✅ Yes for team demo now |
| **Render.com** | Free tier has no GPU | — | ❌ Too slow |

**Immediate (now):** Use ngrok to expose local backend for team testing:
```bash
ngrok http 8000
# Copy the HTTPS URL → put in .env.production as VITE_API_URL
```

**Production:** Package backend in Docker, deploy to RunPod or GCP with GPU.

```dockerfile
# Dockerfile for api_bridge
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "api_bridge.py"]
```

### Environment Variables
```env
# .env.development
VITE_API_URL=http://localhost:8000

# .env.production  
VITE_API_URL=https://your-backend-url.runpod.io

# Backend (.env in api_bridge dir)
# No new vars needed — all paths are relative
```

### Firebase Security Rules (add before going live)
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /patients/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /patients/{uid}/{collection}/{docId} {
      allow read, write: if request.auth.uid == uid;
    }
    match /doctorPatients/{doctorUid} {
      allow read: if request.auth.uid == doctorUid;
      allow write: if request.auth.uid == doctorUid;
    }
  }
}
```

---

## 10. Git Strategy

```
main              ← always deployable
develop           ← integration branch
feature/phase-1-api-client
feature/phase-1-patient-profile
feature/phase-1-chat-wiring
feature/phase-1-vitals
feature/phase-2-doctor-dashboard
```

**PR rule:** No direct pushes to `main`. PR → `develop` → merge → deploy.  
**Commit style:** lowercase, describe what changed, e.g. `wire chat panel to api_bridge endpoint`

---

## 11. Development Workflow (Cursor + Claude CLI)

```bash
# Terminal 1 — AI backend
cd edumit-20250414T165044Z-001
python api_bridge.py

# Terminal 2 — Frontend  
cd Medibot-UIiiiiiiiiiii
npm run dev

# Verify connection
curl http://localhost:8000/
# Should return: {"service":"MediBOT AI Core Engine","status":"online","models_loaded":true}
```

**Cursor tips:**
- Use `Ctrl+K` on a component → "wire this to apiClient.post('/api/...')"
- Use Claude CLI for file-wide refactors (e.g. replacing all hardcoded patient data)
- Keep `api_bridge.py` open in a split — when you add a frontend call, verify the endpoint exists

---

## 12. Critical Mistakes to Avoid

| Mistake | Why It Kills You |
|---------|-----------------|
| Building new UI before wiring existing UI | You'll have 2x the dummy data to fix later |
| Committing `model/` to git | 7GB file will break GitHub permanently |
| Not setting VITE_API_URL | Every AI feature silently returns "Connection failed" |
| Calling Firestore on every render | Bills explode, app freezes. Use Zustand as cache. |
| Putting Firebase keys in `.env` without gitignore | Keys are public on GitHub — Firebase will bill you |
| Adding WebSockets before Phase 3 | Premature optimization, adds infra complexity |
| Making patient data readable by all doctors | HIPAA/privacy issue. Lock rules to doctor-patient linkage. |
| Running Llama-2 on CPU in production | 60s response time. Users will think it's broken. |

---

## 13. Scaling Considerations (Don't Build Yet, But Know the Plan)

- **Real-time vitals from smartwatch:** Web Bluetooth API → no backend needed, browser reads directly
- **Multi-tenant doctor practice:** Add `practiceId` to user schema, scope all queries
- **Notification system:** Firebase Cloud Messaging for drug reminders, abnormal vitals alerts
- **ABDM integration (India):** Ayushman Bharat Digital Mission API for real health records
- **LLM upgrade path:** Swap `llama-2-7b-chat.ggmlv3.q8_0-002.bin` → Mistral or Llama-3 GGUF by changing `MODEL_PATH` and `model_type` in `api_bridge.py`

---

## 14. The Two-Week Sprint: Exact Order of Execution

```
Day 1   apiClient.ts + .env + fix Diagnostic Lab URL
Day 2   Zustand store + patient profile Firestore read
Day 3   Profile setup wizard (first-time login)
Day 4   Wire chat panel → /api/chat/personalized
Day 5   Chat history: Dexie load on mount + Firestore sync
Day 6   Vitals: AddVitalsModal + Firestore save + display real data
Day 7   Medical Timeline: Firestore CRUD + AddEventModal
Day 8   Prescription Manager: Firestore CRUD (replace meds array)
Day 9   Save diagnostic results + wire "Save to Profile" buttons
Day 10  Doctor dashboard: real patient data from Firestore
Day 11  Patient-doctor linking flow
Day 12  Error boundaries + loading skeletons + toast notifications
Day 13  Firebase Security Rules + input validation
Day 14  ngrok tunnel + team demo + deploy frontend to Firebase Hosting
```

After Day 14: the app is real. Every button does what it says.
