import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged as firebaseAuthStateChanged,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../config/firebase"

// Register with email and password
export const register = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    await updateProfile(user, { displayName })

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.email.split("@")[0],
      createdAt: serverTimestamp(),
    })

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Sign in with email and password
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    const user = userCredential.user

    // Check if user document exists, if not create it
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )

    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Sign out
export const logout = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Auth state observer
export const onAuthStateChanged = (callback) => {
  return firebaseAuthStateChanged(auth, callback)
}
