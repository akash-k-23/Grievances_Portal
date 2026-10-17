/**
 * Grievances Portal — State Management & API Layer
 */

import { getIcon } from './icons.js';

export const CATEGORIES = ["Infrastructure", "Academic", "Administrative", "Student Services", "Other"];
export const ALL_STATUSES = ["Submitted", "Under Review", "Assigned", "In Progress", "Escalated", "Resolved"];
export const TIMELINE_STEPS = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];

export const CAMPUS_MAP_PLACES = [
  { title: 'Main Administrative Block', subtitle: 'Academic & Admin Offices', lat: 9.9252, lng: 78.1198 },
  { title: 'Central Library & Research Wing', subtitle: 'Digital Archives & Study Halls', lat: 9.9260, lng: 78.1210 },
  { title: 'Computer Science & IT Complex', subtitle: 'CSE & IT Departments, Server Labs', lat: 9.9248, lng: 78.1205 },
  { title: 'Mechanical Sciences Block', subtitle: 'Mech & Mechatronics Workshops', lat: 9.9242, lng: 78.1190 },
  { title: 'Civil Engineering Wing', subtitle: 'Survey Labs & Drafting Halls', lat: 9.9265, lng: 78.1185 },
  { title: 'Student Welfare & Recreation Center', subtitle: 'Canteen, Co-op Store & Union', lat: 9.9250, lng: 78.1220 },
  { title: 'Open Air Auditorium & Quadrangle', subtitle: 'Cultural Grounds & Main Arena', lat: 9.9255, lng: 78.1200 },
  { title: 'East Campus Hostel Complex', subtitle: 'Block A, B & Dining Mess', lat: 9.9270, lng: 78.1225 },
  { title: 'West Campus Hostel Complex', subtitle: 'Block C, D & Guest House', lat: 9.9238, lng: 78.1175 },
  { title: 'Sports Arena & Indoor Stadium', subtitle: 'Basketball Courts & Gymnasium', lat: 9.9235, lng: 78.1215 },
  { title: 'Health Center & First Aid Post', subtitle: '24/7 Dispensary & Pharmacy', lat: 9.9253, lng: 78.1212 },
  { title: 'Electrical Sciences Complex', subtitle: 'EEE & ECE Department Wing', lat: 9.9258, lng: 78.1180 }
];

export const formatDate = () => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
export const formatTime = () => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date());
export const formatDateTime = (d = new Date()) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(d);

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const calculateTimeTaken = (startStr, endStr) => {
  if (!startStr) return "1 day";
  try {
    const s = new Date(startStr);
    const e = endStr ? new Date(endStr) : new Date();
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "1 day";
    const diffMs = Math.max(0, e - s);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${hours}h ${mins}m`;
  } catch (err) {
    return "1 day";
  }
};

export const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const accessibilitySettings = {
  textSize: 'normal',   // 'normal' | 'large' | 'largest'
  highContrast: false,  // boolean
  extraSpacing: false   // boolean
};

export const state = {
  grievances: [],
  currentUser: null,           // null, 'user', or 'officer'
  currentLoggedInUser: null,   // { name, email, role, ... }
  currentView: 'home',         // home, login, register, dashboard, submit, success, list, track, detail, messages, profile
  selectedRef: null,
  dashSearchQuery: '',
  loginRole: 'user',
  toasts: []
};

const ACCOUNT_STORAGE_KEY = 'grievances_portal_accounts';

function getStoredAccounts() {
  const storedAccounts = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!storedAccounts) return [];

  const accounts = JSON.parse(storedAccounts);
  if (!Array.isArray(accounts)) {
    throw new Error('Saved accounts data is invalid. Clear this site’s browser data and register again.');
  }
  return accounts;
}

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

function getCryptoApi() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error('Secure local sign-in is unavailable in this browser. Open the app through npm start at localhost.');
  }
  return cryptoApi;
}

async function hashPassword(password, salt) {
  const subtle = getCryptoApi().subtle;

  const key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await subtle.deriveBits({
    name: 'PBKDF2',
    salt,
    iterations: 100000,
    hash: 'SHA-256'
  }, key, 256);
  return toHex(hash);
}

function hexToBytes(value) {
  return Uint8Array.from(value.match(/.{2}/g) || [], byte => parseInt(byte, 16));
}

export async function createLocalAccount({ name, email, password, role, phone, address, department }) {
  const accounts = getStoredAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  if (accounts.some(account => account.email === normalizedEmail)) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const salt = getCryptoApi().getRandomValues(new Uint8Array(16));
  const user = {
    id: `usr-${Date.now()}`,
    name,
    email: normalizedEmail,
    role,
    phone,
    address,
    department,
    avatarInitial: name.charAt(0).toUpperCase()
  };
  accounts.push({
    ...user,
    passwordSalt: toHex(salt),
    passwordHash: await hashPassword(password, salt)
  });
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
  return user;
}

export async function authenticateLocalAccount(email, password, role) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = getStoredAccounts().find(savedAccount =>
    savedAccount.email === normalizedEmail && savedAccount.role === role
  );
  if (!account) return null;

  const passwordHash = await hashPassword(password, hexToBytes(account.passwordSalt));
  if (passwordHash !== account.passwordHash) return null;

  const { passwordSalt, passwordHash: storedPasswordHash, ...user } = account;
  return user;
}

// Initialize State from LocalStorage
try {
  const savedGrievances = localStorage.getItem('grievances_data');
  if (savedGrievances) {
    state.grievances = JSON.parse(savedGrievances);
  }
} catch (e) {
  state.grievances = [];
}

try {
  const session = localStorage.getItem("portal_current_user");
  if (session) {
    state.currentLoggedInUser = JSON.parse(session);
    state.currentUser = (state.currentLoggedInUser.role === 'officer' || state.currentLoggedInUser.role === 'admin') ? 'officer' : 'user';
    state.currentView = 'dashboard';
  }
} catch (e) {}

export function initAccessibility() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const raw = localStorage.getItem('grievances-portal-accessibility');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.textSize && ['normal', 'large', 'largest'].includes(parsed.textSize)) {
        accessibilitySettings.textSize = parsed.textSize;
      }
      accessibilitySettings.highContrast = !!parsed.highContrast;
      accessibilitySettings.extraSpacing = !!parsed.extraSpacing;
    }
  } catch (e) {
    accessibilitySettings.textSize = 'normal';
    accessibilitySettings.highContrast = false;
    accessibilitySettings.extraSpacing = false;
  }
  applyAccessibility();
}

export function applyAccessibility() {
  if (typeof document === 'undefined') return;
  const doc = document.documentElement;
  doc.dataset.accessibilityText = accessibilitySettings.textSize;
  doc.dataset.accessibilityContrast = String(accessibilitySettings.highContrast);
  doc.dataset.accessibilitySpacing = String(accessibilitySettings.extraSpacing);
  try {
    localStorage.setItem('grievances-portal-accessibility', JSON.stringify({
      textSize: accessibilitySettings.textSize,
      highContrast: accessibilitySettings.highContrast,
      extraSpacing: accessibilitySettings.extraSpacing
    }));
  } catch (e) {}
}

export function setAccessibilityTextSize(size) {
  if (['normal', 'large', 'largest'].includes(size)) {
    accessibilitySettings.textSize = size;
    applyAccessibility();
  }
}

export function toggleAccessibilityContrast() {
  accessibilitySettings.highContrast = !accessibilitySettings.highContrast;
  applyAccessibility();
}

export function toggleAccessibilitySpacing() {
  accessibilitySettings.extraSpacing = !accessibilitySettings.extraSpacing;
  applyAccessibility();
}

export function resetAccessibility() {
  accessibilitySettings.textSize = 'normal';
  accessibilitySettings.highContrast = false;
  accessibilitySettings.extraSpacing = false;
  applyAccessibility();
}

// Auto-run accessibility initialization
initAccessibility();

export function saveGrievances() {
  try {
    localStorage.setItem('grievances_data', JSON.stringify(state.grievances));
  } catch (e) {}
}

export function saveSession(user) {
  state.currentLoggedInUser = user;
  state.currentUser = (user.role === 'officer' || user.role === 'admin') ? 'officer' : 'user';
  try {
    localStorage.setItem("portal_current_user", JSON.stringify(user));
  } catch (e) {}
}

export function clearSession() {
  state.currentUser = null;
  state.currentLoggedInUser = null;
  state.currentView = 'home';
  try {
    localStorage.removeItem("portal_current_user");
  } catch (e) {}
}

export function getVisibleGrievances() {
  if (!state.currentUser) return [];
  if (state.currentUser === "officer") {
    return state.grievances;
  }
  const myEmail = (state.currentLoggedInUser ? state.currentLoggedInUser.email : "").toLowerCase().trim();
  if (!myEmail) return [];
  return state.grievances.filter(g => {
    const creator = (g.authorEmail || g.createdBy || g.userEmail || "").toLowerCase().trim();
    return creator === myEmail;
  });
}

export function showToast(message, type = 'info') {
  const toast = { id: Date.now() + Math.random(), message, type };
  state.toasts.push(toast);
  renderToastRegion();
  setTimeout(() => {
    state.toasts = state.toasts.filter(t => t.id !== toast.id);
    renderToastRegion();
  }, 4000);
}

export function renderToastRegion() {
  let region = document.querySelector('.toast-region');
  if (!region) {
    region = document.createElement('div');
    region.className = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  region.innerHTML = state.toasts.map(t => `
    <div class="toast toast-${t.type}" role="status">
      <span>${escapeHtml(t.message)}</span>
    </div>
  `).join('');
}

export function getStatusTagHtml(status) {
  let iconName = 'clock-3';
  if (status === 'Resolved') iconName = 'check';
  else if (status === 'Escalated') iconName = 'circle-alert';
  else if (status === 'Submitted') iconName = 'file-text';
  const slug = (status || 'submitted').toLowerCase().replace(/\s+/g, '-');
  return `<span class="status-tag status-${slug}">${getIcon(iconName)}${escapeHtml(status)}</span>`;
}

export function getPriorityTagHtml(priority) {
  const slug = (priority || 'medium').toLowerCase();
  return `<span class="priority-tag priority-${slug}"><span></span>${escapeHtml(priority)}</span>`;
}

export function renderTimelineBlock(currentStatus, lastUpdated) {
  const isEscalated = currentStatus === 'Escalated';
  const activeIndex = TIMELINE_STEPS.indexOf(currentStatus);

  const stepItems = TIMELINE_STEPS.map((step, idx) => {
    const isComplete = activeIndex > idx;
    const isActive = activeIndex === idx && !isEscalated;
    return `
      <li class="${isComplete ? 'timeline-complete' : ''} ${isActive ? 'timeline-active' : ''}">
        <span class="timeline-marker">
          ${isComplete ? getIcon('check') : (isActive ? '<span></span>' : '<span class="marker-empty"></span>')}
        </span>
        <span class="timeline-copy">
          <strong>${step}</strong>
          <small>${isComplete ? `Completed · ${escapeHtml(lastUpdated || 'Recently')}` : (isActive ? 'Current status' : 'Next step')}</small>
        </span>
      </li>
    `;
  }).join('');

  const escalatedItem = isEscalated ? `
    <li class="timeline-escalated timeline-active">
      <span class="timeline-marker">${getIcon('circle-alert')}</span>
      <span class="timeline-copy">
        <strong>Escalated</strong>
        <small>Current status · ${escapeHtml(lastUpdated || 'Recently')}</small>
      </span>
    </li>
  ` : '';

  return `
    <div class="timeline-block">
      <div class="timeline-heading">
        <div>
          <span class="eyebrow">PROGRESS</span>
          <h3>Grievance timeline</h3>
        </div>
        <span class="timeline-updated">${getIcon('clock-3')} Updated ${escapeHtml(lastUpdated || 'Recently')}</span>
      </div>
      <ol class="timeline-list">
        ${stepItems}
        ${escalatedItem}
      </ol>
    </div>
  `;
}
