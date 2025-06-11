import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
}

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "appId"]
  const missing = requiredFields.filter((field) => !firebaseConfig[field])

  if (missing.length > 0) {
    console.error("Missing Firebase configuration:", missing)
    throw new Error(`Missing Firebase configuration: ${missing.join(", ")}`)
  }

  console.log("Firebase configuration validated:", {
    apiKey: firebaseConfig.apiKey ? "✓" : "✗",
    authDomain: firebaseConfig.authDomain ? "✓" : "✗",
    projectId: firebaseConfig.projectId ? "✓" : "✗",
    appId: firebaseConfig.appId ? "✓" : "✗",
  })
}

// Validate configuration before initializing
validateConfig()

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Enable emulators in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099")
    connectFirestoreEmulator(db, "localhost", 8080)
    console.log("Connected to Firebase emulators")
  } catch (error) {
    console.log("Emulators already connected or not available")
  }
}

console.log("Firebase initialized successfully")

export default app
