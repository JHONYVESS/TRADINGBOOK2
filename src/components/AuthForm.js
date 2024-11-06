export class AuthForm {
  constructor(formId, onSubmit) {
    this.form = document.getElementById(formId);
    this.setupForm(onSubmit);
  }

  setupForm(onSubmit) {
    if (!this.form) return;

    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(this.form);
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        await onSubmit(email, password);
        this.form.reset();
      } catch (error) {
        this.showError(error.message);
      }
    });
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const existingError = this.form.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    this.form.insertBefore(errorDiv, this.form.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  reset() {
    this.form.reset();
  }
}