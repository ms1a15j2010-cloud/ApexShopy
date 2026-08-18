function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');

  // Create container lazily on first call
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.setProperty('--delay', `${duration / 1000}s`);
  toast.textContent = message;

  container.appendChild(toast);

  // Clean up DOM after toast animation finishes
  setTimeout(() => {
    toast.remove();
  }, duration + 300);
}