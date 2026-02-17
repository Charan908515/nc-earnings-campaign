const API_URL = '/api';

let isLoginMode = false;

// DOM Elements
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const alertContainer = document.getElementById('alertContainer');

// Check URL parameters for mode
function initializeMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if (mode === 'login') {
        isLoginMode = true;
        switchToLoginMode();
    } else if (mode === 'register') {
        isLoginMode = false;
        switchToRegisterMode();
    }
}

// Switch to login mode
function switchToLoginMode() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Login to access your wallet';
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Register';
}

// Switch to register mode
function switchToRegisterMode() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Join and start earning today';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Login';
}

// Initialize mode on page load
initializeMode();

// Toggle between login and register
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        switchToLoginMode();
    } else {
        switchToRegisterMode();
    }
});

// Show alert
function showAlert(message, type = 'error') {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    alertContainer.innerHTML = `
    <div class="alert ${alertClass}">
      ${message}
    </div>
  `;

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const upiId = document.getElementById('regMobile').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Validate UPI ID format
    if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
        showAlert('Please enter a valid UPI ID (e.g., 9876543210@paytm)');
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        return;
    }

    // Validate password length
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long');
        return;
    }

    const registerBtn = document.getElementById('registerBtn');
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<div class="spinner"></div><span>Creating Account...</span>';

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies
            body: JSON.stringify({ upiId, password })
        });

        const data = await response.json();

        if (data.success) {
            // Cookie set automatically by server
            showAlert('Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/wallet';
            }, 1500);
        } else {
            showAlert(data.message || 'Registration failed');
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<span>Create Account</span>';
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Network error. Please try again.');
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<span>Create Account</span>';
    }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const upiId = document.getElementById('loginMobile').value;
    const password = document.getElementById('loginPassword').value;

    // Validate UPI ID format
    if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
        showAlert('Please enter a valid UPI ID');
        return;
    }

    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<div class="spinner"></div><span>Logging in...</span>';

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies
            body: JSON.stringify({ upiId, password })
        });

        const data = await response.json();

        if (data.success) {
            // Cookie set automatically by server
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/wallet';
            }, 1500);
        } else {
            showAlert(data.message || 'Login failed');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Login</span>';
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please try again.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Login</span>';
    }
});

// Toggle Password Visibility
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent form submission if button is inside form

            // Find input in the same parent wrapper
            const input = this.parentElement.querySelector('input');

            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '🔒'; // Icon when visible (click to hide)
                } else {
                    input.type = 'password';
                    this.innerHTML = '👁️'; // Icon when hidden (click to show)
                }
            }
        });
    });
});
