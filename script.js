// script.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Configuration Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBGzdXerQK4AM52SWE_QUlG1XIrwwO2yPY',
  authDomain: 'trading-book-3a687.firebaseapp.com',
  projectId: 'trading-book-3a687',
  storageBucket: 'trading-book-3a687.firebasestorage.app',
  messagingSenderId: '950163170201',
  appId: '1:950163170201:web:67ed759db2e89b2453a908',
  measurementId: 'G-Y4ZJK5KYRK',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

import { Auth } from './src/components/Auth.js';
import { TradingJournal } from './src/components/TradingJournal.js';

let journal;

document.addEventListener('DOMContentLoaded', () => {
  const authInstance = new Auth();
  window.auth = authInstance;

  // Setup auth modal handlers
  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  let authMode = 'login';

  window.showAuthModal = (mode) => {
    authMode = mode;
    document.getElementById('authTitle').textContent =
      mode === 'login' ? 'Login' : 'Sign Up';
    authModal.style.display = 'block';
  };

  const cancelButton = authModal.querySelector('.cancel');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      authModal.style.display = 'none';
      authForm.reset();
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(authForm);
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        if (authMode === 'login') {
          await authInstance.signIn(email, password);
        } else {
          await authInstance.signUp(email, password);
        }
        authModal.style.display = 'none';
        authForm.reset();
        journal = new TradingJournal();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // Initialize journal if user is already authenticated
  auth.onAuthStateChanged((user) => {
    if (user) {
      journal = new TradingJournal();
    }
  });
});

// Export functions for global use
window.editTrade = async function (tradeId) {
  console.log('Editing trade:', tradeId);
};

window.deleteTrade = async function (tradeId) {
  try {
    await deleteDoc(doc(db, 'trades', tradeId));
    if (journal) {
      journal.loadUserTrades();
    }
  } catch (error) {
    console.error('Error deleting:', error);
  }
};