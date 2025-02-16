// firebase/auth/signin.js

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebase_app from "../config";

const auth = getAuth(firebase_app);

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user };
  } catch (error) {
    console.log(error);
    let errorMessage;
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No user found with this email";
        break;
      case "auth/wrong-password":
        errorMessage = "Invalid password";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email format";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled";
        break;
      default:
        errorMessage = "Failed to sign in. Please try again.";
    }
    throw new Error(errorMessage);
  }
};

export default signIn;
