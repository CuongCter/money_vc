import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  onAuthStateChanged as firebaseAuthStateChanged,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../config/firebase"

// Export auth for direct access
export { auth }

// Configure Google Auth Provider with production-friendly settings
const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider()

  // Add required scopes
  provider.addScope("email")
  provider.addScope("profile")

  // Set custom parameters for better compatibility
  provider.setCustomParameters({
    prompt: "select_account",
    access_type: "offline",
  })

  return provider
}

// Register with email and password
export const register = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update profile with display name
    if (displayName) {
      await updateProfile(user, { displayName })
    }

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.email.split("@")[0],
      photoURL: user.photoURL || null,
      provider: "email",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    })

    return { user, error: null, isNewUser: true }
  } catch (error) {
    return { user: null, error: getErrorMessage(error.code), isNewUser: false }
  }
}

// Sign in with email and password
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update last login time
    await updateUserLastLogin(user.uid)

    return { user, error: null }
  } catch (error) {
    return { user: null, error: getErrorMessage(error.code) }
  }
}

// Sign in with Google (Popup method - for development)
export const signInWithGoogle = async () => {
  try {
    const googleProvider = createGoogleProvider()
    const userCredential = await signInWithPopup(auth, googleProvider)
    const user = userCredential.user

    if (!user) {
      return { user: null, error: "Không nhận được thông tin người dùng từ Google" }
    }

    // Check if this is a new user
    let isNewUser = false
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      isNewUser = !userDoc.exists()
    } catch (firestoreError) {
      console.warn("Error checking if user exists:", firestoreError)
    }

    // Create or update user document in Firestore
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "User",
          photoURL: user.photoURL || null,
          provider: "google",
          lastLoginAt: serverTimestamp(),
          ...(isNewUser && { createdAt: serverTimestamp() }),
        },
        { merge: true },
      )
    } catch (firestoreError) {
      console.warn("Error saving user to Firestore:", firestoreError)
    }

    return { user, error: null, isNewUser }
  } catch (error) {
    // Handle specific Google sign-in errors
    if (error.code === "auth/popup-closed-by-user") {
      return { user: null, error: "Đăng nhập bị hủy bởi người dùng" }
    }
    if (error.code === "auth/popup-blocked") {
      return { user: null, error: "Popup bị chặn. Vui lòng thử phương thức khác." }
    }
    if (error.code === "auth/cancelled-popup-request") {
      return { user: null, error: "Yêu cầu đăng nhập bị hủy" }
    }
    if (error.code === "auth/unauthorized-domain") {
      return { user: null, error: "Domain chưa được ủy quyền. Vui lòng liên hệ quản trị viên." }
    }
    if (error.code === "auth/operation-not-allowed") {
      return { user: null, error: "Google Sign-In chưa được kích hoạt" }
    }

    return { user: null, error: getErrorMessage(error.code) }
  }
}

// Sign in with Google (Redirect method - for production/mobile)
export const signInWithGoogleRedirect = async () => {
  try {
    const googleProvider = createGoogleProvider()
    await signInWithRedirect(auth, googleProvider)
    return { user: null, error: null, isRedirect: true }
  } catch (error) {
    console.error("Error during Google redirect:", error)
    return { user: null, error: getErrorMessage(error.code), isRedirect: false }
  }
}

// Handle Google redirect result - IMPROVED VERSION
export const getGoogleRedirectResult = async () => {
  try {
    console.log("Checking for redirect result...")
    const result = await getRedirectResult(auth)
    console.log("Redirect result:", result ? "Found" : "Not found")

    if (result && result.user) {
      const user = result.user
      console.log("User from redirect:", user.email)

      // Check if this is a new user
      let isNewUser = false
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        isNewUser = !userDoc.exists()
      } catch (firestoreError) {
        console.warn("Could not check if user is new:", firestoreError)
      }

      // Create or update user document in Firestore
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split("@")[0] || "User",
            photoURL: user.photoURL || null,
            provider: "google",
            lastLoginAt: serverTimestamp(),
            ...(isNewUser && { createdAt: serverTimestamp() }),
          },
          { merge: true },
        )
      } catch (firestoreError) {
        console.warn("Could not save user to Firestore:", firestoreError)
      }

      return { user, error: null, isNewUser }
    }

    return { user: null, error: null, isNewUser: false }
  } catch (error) {
    console.error("Error getting redirect result:", error)
    return { user: null, error: getErrorMessage(error.code), isNewUser: false }
  }
}

// Update user's last login time
const updateUserLastLogin = async (uid) => {
  try {
    await setDoc(
      doc(db, "users", uid),
      {
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (error) {
    console.warn("Could not update last login time:", error)
  }
}

// Sign out
export const logout = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    return { error: getErrorMessage(error.code) }
  }
}

// Auth state observer - IMPROVED VERSION
export const onAuthStateChanged = (callback) => {
  console.log("Setting up auth state listener")
  return firebaseAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user ? `User: ${user.email}` : "No user")
    callback(user)
  })
}

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "Không tìm thấy tài khoản với email này."
    case "auth/wrong-password":
      return "Mật khẩu không chính xác."
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng cho tài khoản khác."
    case "auth/weak-password":
      return "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn."
    case "auth/invalid-email":
      return "Địa chỉ email không hợp lệ."
    case "auth/user-disabled":
      return "Tài khoản này đã bị vô hiệu hóa."
    case "auth/too-many-requests":
      return "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau."
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet."
    case "auth/invalid-credential":
      return "Thông tin đăng nhập không hợp lệ."
    case "auth/account-exists-with-different-credential":
      return "Tài khoản đã tồn tại với phương thức đăng nhập khác."
    case "auth/operation-not-allowed":
      return "Phương thức đăng nhập này chưa được kích hoạt."
    case "auth/unauthorized-domain":
      return "Domain chưa được ủy quyền cho Google Sign-In."
    case "auth/invalid-verification-code":
      return "Mã xác thực không hợp lệ."
    case "auth/invalid-verification-id":
      return "ID xác thực không hợp lệ."
    default:
      return `Lỗi không xác định (${errorCode}). Vui lòng thử lại.`
  }
}

// Check if user is signed in with Google
export const isGoogleUser = (user) => {
  return user?.providerData?.some((provider) => provider.providerId === "google.com")
}

// Get user provider info
export const getUserProviders = (user) => {
  return user?.providerData?.map((provider) => provider.providerId) || []
}
