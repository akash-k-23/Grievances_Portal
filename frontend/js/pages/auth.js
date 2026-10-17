/**
 * Grievances Portal — Authentication Page Module (Login & Register)
 */

import { getIcon } from '../icons.js';
import { saveSession, showToast, createLocalAccount, authenticateLocalAccount, escapeHtml } from '../state.js';

let loginRole = 'user'; // 'user' or 'officer'
let loginForm = { email: '', password: '' };
let loginError = '';
let loginBusy = false;

let registerRole = 'user'; // 'user' or 'officer'
let registerForm = { name: '', email: '', password: '', confirmPassword: '', phone: '', address: '', department: '' };
let registerErrors = {};
let registerBusy = false;

export function renderLoginPage() {
  return `
    <main class="login-page login-page-centered">
      <section class="login-card login-card-centered">
        <div class="login-card-head">
          <span class="eyebrow">WELCOME TO YOUR PORTAL</span>
          <h2>Welcome back</h2>
          <p>Choose your sign-in type to continue. Accounts and grievances are stored in this browser only.</p>
        </div>
        <div class="login-toggle" role="tablist" aria-label="Login type">
          <button role="tab" aria-selected="${loginRole === 'user'}" class="${loginRole === 'user' ? 'selected' : ''}" id="btn-toggle-user">
            ${getIcon('user-round')} User Login
          </button>
          <button role="tab" aria-selected="${loginRole === 'officer'}" class="${loginRole === 'officer' ? 'selected' : ''}" id="btn-toggle-officer">
            ${getIcon('shield-check')} Officer / Admin
          </button>
        </div>
        <form id="form-login" novalidate>
          <div class="field">
            <label class="field-label" for="login-email">Email <span class="required">*</span></label>
            <div class="field-input-wrap">
              <input id="login-email" type="email" autocomplete="username" placeholder="you@example.com" value="${escapeHtml(loginForm.email)}">
            </div>
          </div>
          <div class="field" style="margin-top: 10px;">
            <label class="field-label" for="login-password">Password <span class="required">*</span></label>
            <input id="login-password" type="password" autocomplete="current-password" placeholder="Enter your password" value="${escapeHtml(loginForm.password)}">
          </div>
          ${loginError ? `<div class="form-alert" role="alert">${getIcon('circle-alert')} ${escapeHtml(loginError)}</div>` : ''}
          <button class="button button-primary login-submit" type="submit" ${loginBusy ? 'disabled' : ''}>
            ${loginBusy ? '<span class="spinner"></span> Logging in...' : `Login ${getIcon('arrow-right')}`}
          </button>
        </form>
        ${loginRole === 'user' ? `
          <button class="register-inline-link" type="button" id="btn-goto-register">
            New to here? <strong>Register</strong>
          </button>
        ` : `
          <button class="register-inline-link" type="button" id="btn-goto-register">
            New officer? <strong>Register</strong>
          </button>
        `}
      </section>
    </main>
  `;
}

export function renderRegisterPage() {
  return `
    <main class="login-page login-page-centered register-page-centered">
      <section class="login-card register-card register-card-centered">
        <div class="login-card-head">
          <span class="eyebrow">${registerRole === 'user' ? 'USER REGISTRATION' : 'OFFICER REGISTRATION'}</span>
          <h2>Register your account</h2>
          <p>Fill in your details below. Your demo account is stored in this browser only.</p>
        </div>
        <div class="register-role-choices compact-role-choices" role="group" aria-label="Choose account type">
          <button type="button" class="register-role-choice ${registerRole === 'user' ? 'selected' : ''}" id="btn-reg-role-user">
            ${getIcon('user-round')}
            <span><strong>Register as User</strong><small>Submit & track grievances</small></span>
          </button>
          <button type="button" class="register-role-choice ${registerRole === 'officer' ? 'selected' : ''}" id="btn-reg-role-officer">
            ${getIcon('shield-check')}
            <span><strong>Register as Officer</strong><small>Review & manage grievances</small></span>
          </button>
        </div>
        <form id="form-register" class="register-form-grid" novalidate>
          <div class="field">
            <label class="field-label" for="register-name">Full name <span class="required">*</span></label>
            <div class="field-input-wrap">
              <input id="register-name" autocomplete="name" placeholder="Your full name" value="${escapeHtml(registerForm.name)}">
            </div>
            ${registerErrors.name ? `<span class="field-error" role="alert">${escapeHtml(registerErrors.name)}</span>` : ''}
          </div>
          <div class="field">
            <label class="field-label" for="register-email">Email <span class="required">*</span></label>
            <div class="field-input-wrap">
              <input id="register-email" type="email" autocomplete="email" placeholder="you@example.com" value="${escapeHtml(registerForm.email)}">
            </div>
            ${registerErrors.email ? `<span class="field-error" role="alert">${escapeHtml(registerErrors.email)}</span>` : ''}
          </div>
          <div class="field">
            <label class="field-label" for="register-password">Password <span class="required">*</span></label>
            <input id="register-password" type="password" autocomplete="new-password" placeholder="At least 8 characters" value="${escapeHtml(registerForm.password)}">
            ${registerErrors.password ? `<span class="field-error" role="alert">${escapeHtml(registerErrors.password)}</span>` : ''}
          </div>
          <div class="field">
            <label class="field-label" for="register-confirm-password">Confirm password <span class="required">*</span></label>
            <input id="register-confirm-password" type="password" autocomplete="new-password" placeholder="Enter password again" value="${escapeHtml(registerForm.confirmPassword)}">
            ${registerErrors.confirmPassword ? `<span class="field-error" role="alert">${escapeHtml(registerErrors.confirmPassword)}</span>` : ''}
          </div>
          <div class="field">
            <label class="field-label" for="register-phone">Phone number <span class="optional">(optional)</span></label>
            <div class="field-input-wrap">
              <input id="register-phone" type="tel" autocomplete="tel" placeholder="+1 (555) 000-0000" value="${escapeHtml(registerForm.phone || '')}">
            </div>
          </div>
          <div class="field">
            <label class="field-label" for="register-department">Department <span class="optional">(optional)</span></label>
            <div class="field-input-wrap">
              <input id="register-department" placeholder="${registerRole === 'officer' ? 'e.g. Public Works, IT, Facilities' : 'e.g. Student Affairs, Academic'}" value="${escapeHtml(registerForm.department || '')}">
            </div>
          </div>
          <div class="field field-full-level">
            <label class="field-label" for="register-address">Address <span class="optional">(optional)</span></label>
            <div class="field-input-wrap">
              <input id="register-address" autocomplete="street-address" placeholder="e.g. 124 Main Street, City, State" value="${escapeHtml(registerForm.address || '')}">
            </div>
          </div>
          <div class="field-full-level submit-wrap">
            <button class="button button-primary login-submit" type="submit" ${registerBusy ? 'disabled' : ''}>
              ${registerBusy ? '<span class="spinner"></span> Creating account...' : `Create account ${getIcon('arrow-right')}`}
            </button>
          </div>
        </form>
        <button class="register-inline-link" type="button" id="btn-goto-login">
          Already have an account? <strong>Login</strong>
        </button>
      </section>
    </main>
  `;
}

export function bindAuthEvents(setView, render) {
  // Login Role Toggle
  const toggleUser = document.getElementById('btn-toggle-user');
  if (toggleUser) toggleUser.onclick = () => { loginRole = 'user'; loginError = ''; render(); };

  const toggleOfficer = document.getElementById('btn-toggle-officer');
  if (toggleOfficer) toggleOfficer.onclick = () => { loginRole = 'officer'; loginError = ''; render(); };

  const gotoRegister = document.getElementById('btn-goto-register');
  if (gotoRegister) gotoRegister.onclick = () => setView('register');

  const gotoLogin = document.getElementById('btn-goto-login');
  if (gotoLogin) gotoLogin.onclick = () => setView('login');

  // Register Role Choice
  const regRoleUser = document.getElementById('btn-reg-role-user');
  if (regRoleUser) regRoleUser.onclick = () => { registerRole = 'user'; registerErrors = {}; render(); };

  const regRoleOfficer = document.getElementById('btn-reg-role-officer');
  if (regRoleOfficer) regRoleOfficer.onclick = () => { registerRole = 'officer'; registerErrors = {}; render(); };

  // Login Form Submission
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.onsubmit = async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const password = passInput ? passInput.value : '';

      loginForm.email = email;
      loginForm.password = password;

      if (!email) { loginError = 'Please enter your email.'; render(); return; }
      if (!password) { loginError = 'Please enter your password.'; render(); return; }

      loginBusy = true;
      loginError = '';
      render();

      try {
        const user = await authenticateLocalAccount(email, password, loginRole);
        loginBusy = false;
        if (!user) {
          loginError = 'Those credentials do not match. Please check your details or register an account.';
          render();
          return;
        }
        saveSession(user);
        loginError = '';
        showToast('Welcome to your dashboard.');
        setView('dashboard');
      } catch (err) {
        loginBusy = false;
        loginError = err instanceof Error ? err.message : 'Unable to sign in with local account storage.';
        render();
      }
    };
  }

  // Register Form Submission
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.onsubmit = async (e) => {
      e.preventDefault();
      const nameEl = document.getElementById('register-name');
      const emailEl = document.getElementById('register-email');
      const passEl = document.getElementById('register-password');
      const confirmEl = document.getElementById('register-confirm-password');
      const phoneEl = document.getElementById('register-phone');
      const addrEl = document.getElementById('register-address');
      const deptEl = document.getElementById('register-department');

      const name = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const password = passEl ? passEl.value : '';
      const confirmPassword = confirmEl ? confirmEl.value : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const address = addrEl ? addrEl.value.trim() : '';
      const department = deptEl ? deptEl.value.trim() : '';

      registerForm = { name, email, password, confirmPassword, phone, address, department };
      const errors = {};

      if (!name) errors.name = 'Please enter your name.';
      if (!email) errors.email = 'Please enter your email.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
      if (!password) errors.password = 'Please create a password.';
      else if (password.length < 8) errors.password = 'Use at least 8 characters.';
      if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';

      registerErrors = errors;
      if (Object.keys(errors).length > 0) {
        render();
        return;
      }

      registerBusy = true;
      render();

      try {
        const newAccount = await createLocalAccount({
          name,
          email,
          password,
          role: registerRole,
          phone: phone || '',
          address: address || '',
          department: department || ''
        });
        registerBusy = false;
        saveSession(newAccount);
        showToast('Account created successfully!');
        setView('dashboard');
      } catch (err) {
        registerBusy = false;
        registerErrors = {
          email: err instanceof Error ? err.message : 'Unable to create an account in local storage.'
        };
        render();
      }
    };
  }
}
