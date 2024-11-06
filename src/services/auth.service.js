import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';

class AuthService {
  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.user = null;
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.user = userCredential.user;
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      this.user = userCredential.user;
      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
      this.user = null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}

export const authService = new AuthService();