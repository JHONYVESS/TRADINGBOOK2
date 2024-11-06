import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

export class Auth {
    constructor() {
        this.auth = window.initFirebase();
        this.setupAuthListener();
    }

    setupAuthListener() {
        onAuthStateChanged(this.auth, (user) => {
            this.updateUIState(!!user);
            // Dispatch auth state change event
            window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
        });
    }

    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async signOut() {
        try {
            await signOut(this.auth);
            // Clear any user-specific data from memory
            window.dispatchEvent(new CustomEvent('userSignedOut'));
        } catch (error) {
            throw new Error(error.message);
        }
    }

    updateUIState(isAuthenticated) {
        const authElements = document.querySelectorAll('.auth-required');
        const nonAuthElements = document.querySelectorAll('.non-auth-required');
        
        authElements.forEach(el => {
            el.style.display = isAuthenticated ? 'block' : 'none';
        });
        
        nonAuthElements.forEach(el => {
            el.style.display = isAuthenticated ? 'none' : 'block';
        });
    }

    getCurrentUser() {
        return this.auth.currentUser;
    }
}