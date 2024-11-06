import { authService } from '../services/auth.service.js';
import { AuthForm } from './AuthForm.js';

export class AuthUI {
  constructor() {
    this.modal = document.getElementById('authModal');
    this.authForm = new AuthForm('authForm', this.handleAuth.bind(this));
    this.setupEventListeners();
    this.setupAuthStateListener();
  }

  setupEventListeners() {
    window.showAuthModal = (mode) => {
      this.currentMode = mode;
      document.getElementById('authTitle').textContent = mode === 'login' ? 'Login' : 'Sign Up';
      this.modal.style.display = 'block';
    };

    const cancelButton = this.modal.querySelector('.cancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.modal.style.display = 'none';
        this.authForm.reset();
      });
    }
  }

  setupAuthStateListener() {
    authService.onAuthStateChange((user) => {
      this.updateUIState(!!user);
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    });
  }

  async handleAuth(email, password) {
    try {
      if (this.currentMode === 'login') {
        await authService.signIn(email, password);
      } else {
        await authService.signUp(email, password);
      }
      this.modal.style.display = 'none';
    } catch (error) {
      throw error;
    }
  }

  updateUIState(isAuthenticated) {
    const authRequired = document.querySelectorAll('.auth-required');
    const nonAuthRequired = document.querySelectorAll('.non-auth-required');
    
    authRequired.forEach(el => {
      el.style.display = isAuthenticated ? 'block' : 'none';
    });
    
    nonAuthRequired.forEach(el => {
      el.style.display = isAuthenticated ? 'none' : 'block';
    });
  }
}