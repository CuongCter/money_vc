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
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Configure Google Auth Provider with detailed settings
const createGoogleProvider = () => {
  const provider = new GoogleAuthProvider();

  // Add required scopes
  provider.addScope("email");
  provider.addScope("profile");

  // Set custom parameters
  provider.setCustomParameters({
    prompt: "select_account",
    access_type: "offline",
  });

  console.log("Google provider configured:", provider);
  return provider;
};

// Register with email and password
export const register = async (email, password, displayName) => {
  try {
    console.log("Starting registration for:", email);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User created:", user.uid);

    // Update profile with display name
    if (displayName) {
      await updateProfile(user, { displayName });
      console.log("Profile updated with displayName:", displayName);
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
    });
    console.log("User document created in Firestore");

    return { user, error: null, isNewUser: true };
  } catch (error) {
    console.error("Register error:", error);
    return { user: null, error: getErrorMessage(error.code), isNewUser: false };
  }
};

// Sign in with email and password
export const login = async (email, password) => {
  try {
    console.log("Starting login for:", email);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Login successful:", user.uid);

    // Update last login time
    await updateUserLastLogin(user.uid);

    return { user, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return { user: null, error: getErrorMessage(error.code) };
  }
};

// Sign in with Google (Popup method)
export const signInWithGoogle = async () => {
  try {
    console.log("=== Starting Google Sign-In ===");

    // Check if auth is properly initialized
    if (!auth) {
      console.error("Firebase auth not initialized");
      return { user: null, error: "Firebase chưa được khởi tạo đúng cách" };
    }

    // Create fresh provider instance
    const googleProvider = createGoogleProvider();

    const userCredential = await signInWithPopup(auth, googleProvider);

    console.log("=== Popup sign-in successful ===");
    console.log("UserCredential:", userCredential);

    const user = userCredential.user;

    if (!user) {
      console.error("No user object returned from Google sign-in");
      return {
        user: null,
        error: "Không nhận được thông tin người dùng từ Google",
      };
    }

    // Check if this is a new user
    let isNewUser = false;
    try {
      console.log("Checking if user exists in Firestore...");
      const userDoc = await getDoc(doc(db, "users", user.uid));
      isNewUser = !userDoc.exists();
      console.log("Is new user:", isNewUser);

      if (userDoc.exists()) {
        console.log("Existing user data:", userDoc.data());
      }
    } catch (firestoreError) {
      console.warn("Error checking user document:", firestoreError);
      // Continue with the flow even if Firestore check fails
    }

    // Create or update user document in Firestore
    try {
      console.log("Creating/updating user document in Firestore...");

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL || null,
        provider: "google",
        lastLoginAt: serverTimestamp(),
        ...(isNewUser && { createdAt: serverTimestamp() }),
      };

      console.log("User data to save:", userData);

      await setDoc(doc(db, "users", user.uid), userData, { merge: true });
      console.log("User document saved successfully");
    } catch (firestoreError) {
      console.error("Error creating/updating user document:", firestoreError);
      // Don't fail the entire flow if Firestore fails
      console.log("Continuing despite Firestore error...");
    }

    console.log("=== Google Sign-In Complete ===");
    return { user, error: null, isNewUser };
  } catch (error) {
    console.error("=== Google Sign-In Error ===");
    console.error("Error object:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle specific Google sign-in errors
    if (error.code === "auth/popup-closed-by-user") {
      return { user: null, error: "Đăng nhập bị hủy bởi người dùng" };
    }
    if (error.code === "auth/popup-blocked") {
      return {
        user: null,
        error: "Popup bị chặn. Vui lòng cho phép popup và thử lại.",
      };
    }
    if (error.code === "auth/cancelled-popup-request") {
      return { user: null, error: "Yêu cầu đăng nhập bị hủy" };
    }
    if (error.code === "auth/unauthorized-domain") {
      return {
        user: null,
        error: "Domain này chưa được ủy quyền cho Google Sign-In",
      };
    }
    if (error.code === "auth/operation-not-allowed") {
      return {
        user: null,
        error: "Google Sign-In chưa được kích hoạt trong Firebase",
      };
    }

    return { user: null, error: getErrorMessage(error.code) };
  }
};

// Sign in with Google (Redirect method - for mobile or when popup is blocked)
export const signInWithGoogleRedirect = async () => {
  try {
    console.log("Starting Google redirect sign-in...");
    const googleProvider = createGoogleProvider();
    await signInWithRedirect(auth, googleProvider);
    // The result will be handled by getGoogleRedirectResult
    return { user: null, error: null, isRedirect: true };
  } catch (error) {
    console.error("Google redirect sign-in error:", error);
    return {
      user: null,
      error: getErrorMessage(error.code),
      isRedirect: false,
    };
  }
};

// Handle Google redirect result
export const getGoogleRedirectResult = async () => {
  try {
    console.log("Checking Google redirect result...");
    const result = await getRedirectResult(auth);

    if (result) {
      console.log("Google redirect result:", result);
      const user = result.user;

      // Check if this is a new user
      let isNewUser = false;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        isNewUser = !userDoc.exists();
      } catch (firestoreError) {
        console.warn("Error checking user document:", firestoreError);
      }

      // Create or update user document in Firestore
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            email: user.email,
            displayName:
              user.displayName || user.email?.split("@")[0] || "User",
            photoURL: user.photoURL || null,
            provider: "google",
            lastLoginAt: serverTimestamp(),
            ...(isNewUser && { createdAt: serverTimestamp() }),
          },
          { merge: true }
        );
      } catch (firestoreError) {
        console.error("Error creating/updating user document:", firestoreError);
      }

      return { user, error: null, isNewUser };
    }

    console.log("No redirect result found");
    return { user: null, error: null, isNewUser: false };
  } catch (error) {
    console.error("Google redirect result error:", error);
    return { user: null, error: getErrorMessage(error.code), isNewUser: false };
  }
};

// Update user's last login time
const updateUserLastLogin = async (uid) => {
  try {
    await setDoc(
      doc(db, "users", uid),
      {
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating last login:", error);
  }
};

// Sign out
export const logout = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: getErrorMessage(error.code) };
  }
};

// Auth state observer
export const onAuthStateChanged = (callback) => {
  return firebaseAuthStateChanged(auth, callback);
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  console.log("Getting error message for code:", errorCode);

  switch (errorCode) {
    case "auth/user-not-found":
      return "Không tìm thấy tài khoản với email này.";
    case "auth/wrong-password":
      return "Mật khẩu không chính xác.";
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng cho tài khoản khác.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.";
    case "auth/invalid-email":
      return "Địa chỉ email không hợp lệ.";
    case "auth/user-disabled":
      return "Tài khoản này đã bị vô hiệu hóa.";
    case "auth/too-many-requests":
      return "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
    case "auth/invalid-credential":
      return "Thông tin đăng nhập không hợp lệ.";
    case "auth/account-exists-with-different-credential":
      return "Tài khoản đã tồn tại với phương thức đăng nhập khác.";
    case "auth/operation-not-allowed":
      return "Google Sign-In chưa được kích hoạt trong Firebase Console.";
    case "auth/unauthorized-domain":
      return "Domain này chưa được ủy quyền cho Google Sign-In.";
    case "auth/invalid-verification-code":
      return "Mã xác thực không hợp lệ.";
    case "auth/invalid-verification-id":
      return "ID xác thực không hợp lệ.";
    default:
      console.error("Unknown error code:", errorCode);
      return `Lỗi không xác định (${errorCode}). Vui lòng thử lại.`;
  }
};

// Check if user is signed in with Google
export const isGoogleUser = (user) => {
  return user?.providerData?.some(
    (provider) => provider.providerId === "google.com"
  );
};

// Get user provider info
export const getUserProviders = (user) => {
  return user?.providerData?.map((provider) => provider.providerId) || [];
};
