import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkQYnTJtKG_W2rjCNlYoshD8sbT26qmgw",
  authDomain: "medibot-ai-2519c.firebaseapp.com",
  projectId: "medibot-ai-2519c",
  storageBucket: "medibot-ai-2519c.firebasestorage.app",
  messagingSenderId: "53925341582",
  appId: "1:53925341582:web:a06988035d45fd9af31cdf",
  measurementId: "G-VRGWMW3KKE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
