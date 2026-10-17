/**
 * Grievances Portal — Master SPA Application & View Router
 * Modular ES6 architecture.
 */

import { getIcon } from './icons.js';
import { 
  state, 
  clearSession, 
  escapeHtml 
} from './state.js';

import { renderHomePage, bindHomeEvents, renderBrandMark } from './pages/home.js';
import { renderLoginPage, renderRegisterPage, bindAuthEvents } from './pages/auth.js';
import { renderTrackPage, bindTrackEvents } from './pages/track.js';
import { renderWorkspaceDashboard, bindDashboardEvents } from './pages/dashboard.js';
import { renderSubmitPage, initSubmitMap, bindSubmitEvents } from './pages/submit.js';
import { renderWorkspaceDetailPage, initDetailMap, bindDetailEvents } from './pages/detail.js';
import { renderMessagesPage, bindMessagesEvents } from './pages/messages.js';
import { renderProfilePage, bindProfileEvents } from './pages/profile.js';

export function setView(view) {
  state.currentView = view;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function renderWorkspaceTopNav() {
  const isOfficer = state.currentUser === 'officer';
  const userName = state.currentLoggedInUser ? state.currentLoggedInUser.name : (isOfficer ? 'Admin Officer' : 'Citizen');
  const avatarLetter = (state.currentLoggedInUser && state.currentLoggedInUser.avatarInitial) || (userName ? userName.charAt(0).toUpperCase() : (isOfficer ? 'A' : 'C'));

  return `
    <header class="workspace-header workspace-top-nav">
      <div class="header-brand-group">
        <button class="brand-link" id="btn-brand-home" title="Go to Dashboard">
          ${renderBrandMark()}
          <span class="brand-title">Grievances Portal</span>
        </button>
        <nav class="header-nav-links" aria-label="Main Navigation">
          <button class="top-nav-btn ${state.currentView === 'dashboard' ? 'top-nav-active' : ''}" id="btn-top-nav-dashboard" title="Dashboard">
            ${getIcon('house')}
            <span>Dashboard</span>
          </button>
          ${!isOfficer ? `
            <button class="top-nav-btn header-submit-btn ${state.currentView === 'submit' ? 'top-nav-active' : ''}" id="btn-top-nav-submit" title="Submit Grievance">
              ${getIcon('plus')}
              <span>Submit Grievance</span>
            </button>
          ` : ''}
        </nav>
      </div>

      <div class="header-tools">
        <span class="role-pill ${isOfficer ? 'role-officer' : 'role-citizen'}">
          ${isOfficer ? 'Admin Officer' : 'Resident Citizen'}
        </span>
        <button class="header-profile-btn ${state.currentView === 'profile' ? 'profile-active' : ''}" id="btn-header-profile" aria-label="View Profile" title="View Profile">
          <span class="header-avatar">${avatarLetter}</span>
          <span class="header-user-name">${escapeHtml(userName)}</span>
        </button>
        <button class="header-logout-btn" id="btn-logout" title="Sign out of account">
          ${getIcon('log-out')}
          <span>Logout</span>
        </button>
      </div>
    </header>
  `;
}

export function renderWorkspaceFrame(contentHtml) {
  return `
    <div class="app-frame app-frame-nosidebar">
      ${renderWorkspaceTopNav()}
      <main class="workspace-content full-width-workspace">
        ${contentHtml}
      </main>
    </div>
  `;
}

export function render() {
  const root = document.getElementById('portal-app');
  if (!root) return;

  let html = '';

  if (!state.currentUser) {
    // Public non-authenticated views
    if (state.currentView === 'login') {
      html = `
        <div class="portal-root">
          <header class="public-header">
            <button class="brand-lockup" id="btn-nav-brand">
              ${renderBrandMark()}
              <span>Grievances Portal</span>
            </button>
            <nav class="public-nav">
              <button id="btn-nav-home">Home</button>
              <button id="btn-nav-track">Track Grievance</button>
              <button class="public-register" id="btn-nav-register">Register</button>
            </nav>
          </header>
          ${renderLoginPage()}
        </div>
      `;
    } else if (state.currentView === 'register') {
      html = `
        <div class="portal-root">
          <header class="public-header">
            <button class="brand-lockup" id="btn-nav-brand">
              ${renderBrandMark()}
              <span>Grievances Portal</span>
            </button>
            <nav class="public-nav">
              <button id="btn-nav-home">Home</button>
              <button id="btn-nav-track">Track Grievance</button>
              <button class="public-login" id="btn-nav-login">Login ${getIcon('arrow-right')}</button>
            </nav>
          </header>
          ${renderRegisterPage()}
        </div>
      `;
    } else if (state.currentView === 'track') {
      html = `
        <div class="portal-root">
          <header class="public-header">
            <button class="brand-lockup" id="btn-nav-brand">
              ${renderBrandMark()}
              <span>Grievances Portal</span>
            </button>
            <nav class="public-nav">
              <button id="btn-nav-home">Home</button>
              <button class="public-register" id="btn-nav-register">Register</button>
              <button class="button button-primary public-login" id="btn-nav-login">Login ${getIcon('arrow-right')}</button>
            </nav>
          </header>
          ${renderTrackPage(true)}
        </div>
      `;
    } else {
      // Home / Landing
      html = `<div class="portal-root">${renderHomePage()}</div>`;
    }
  } else {
    // Authenticated workspace views
    let content = '';
    if (state.currentView === 'submit') {
      content = renderSubmitPage();
    } else if (state.currentView === 'detail') {
      content = renderWorkspaceDetailPage();
    } else if (state.currentView === 'messages') {
      content = renderMessagesPage();
    } else if (state.currentView === 'profile') {
      content = renderProfilePage();
    } else {
      state.currentView = 'dashboard';
      content = renderWorkspaceDashboard();
    }

    html = `<div class="portal-root">${renderWorkspaceFrame(content)}</div>`;
  }

  root.innerHTML = html;

  // Re-bind all dynamic events
  bindAllEvents();

  // Lazy-load maps
  if (state.currentView === 'submit') {
    setTimeout(() => initSubmitMap(), 60);
  } else if (state.currentView === 'detail') {
    setTimeout(() => initDetailMap(), 60);
  }
}

function bindAllEvents() {
  if (!state.currentUser) {
    bindHomeEvents(setView, render);
    bindAuthEvents(setView, render);
    bindTrackEvents(setView, render);

    const brand = document.getElementById('btn-nav-brand');
    if (brand) brand.onclick = () => setView('home');
    const home = document.getElementById('btn-nav-home');
    if (home) home.onclick = () => setView('home');
    const track = document.getElementById('btn-nav-track');
    if (track) track.onclick = () => setView('track');
    const reg = document.getElementById('btn-nav-register');
    if (reg) reg.onclick = () => setView('register');
    const log = document.getElementById('btn-nav-login');
    if (log) log.onclick = () => setView('login');
  } else {
    // Top Navigation
    const btnBrand = document.getElementById('btn-brand-home');
    if (btnBrand) btnBrand.onclick = () => setView('dashboard');

    const btnNavDash = document.getElementById('btn-top-nav-dashboard');
    if (btnNavDash) btnNavDash.onclick = () => setView('dashboard');

    const btnNavSubmit = document.getElementById('btn-top-nav-submit');
    if (btnNavSubmit) btnNavSubmit.onclick = () => setView('submit');

    const btnProfile = document.getElementById('btn-header-profile');
    if (btnProfile) btnProfile.onclick = () => setView('profile');

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.onclick = () => {
        clearSession();
        setView('home');
      };
    }

    // Page-specific bindings
    if (state.currentView === 'dashboard') {
      bindDashboardEvents(setView, render);
    } else if (state.currentView === 'submit') {
      bindSubmitEvents(setView, render);
    } else if (state.currentView === 'detail') {
      bindDetailEvents(setView, render);
    } else if (state.currentView === 'messages') {
      bindMessagesEvents(setView, render);
    } else if (state.currentView === 'profile') {
      bindProfileEvents(setView, render);
    }
  }
}

// Initial Boot (browser only)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    render();
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    render();
  }
}
