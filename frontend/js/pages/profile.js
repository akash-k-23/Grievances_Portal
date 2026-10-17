/**
 * Grievances Portal — User & Officer Profile Page Module
 */

import { getIcon } from '../icons.js';
import { state, escapeHtml } from '../state.js';

export function renderProfilePage() {
  const isOfficer = state.currentUser === 'officer';
  const user = state.currentLoggedInUser || (isOfficer ? {
    name: 'Admin Officer',
    email: 'admin@grievance.gov',
    role: 'officer',
    department: 'Central Grievance Office',
    phone: '+1 (555) 019-2831',
    address: 'Civic Center, Suite 400, Madurai',
    id: 'OFF-1001'
  } : {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    role: 'citizen',
    department: 'Student Affairs',
    phone: '+1 (555) 234-5678',
    address: '42 Pine Crest Avenue, Cityville',
    id: 'usr-1'
  });

  const userName = user.name || (isOfficer ? 'Admin Officer' : 'Resident Citizen');
  const avatarLetter = (user.avatarInitial) || (userName ? userName.charAt(0).toUpperCase() : (isOfficer ? 'A' : 'C'));
  const userRoleText = isOfficer ? 'Officer / Administrator' : 'Resident Citizen';
  const userDept = user.department || (isOfficer ? 'Central Grievance Office' : 'General Public');
  const userPhone = user.phone || 'Not specified';
  const userAddr = user.address || 'Not specified';

  return `
    <div class="profile-page-container">
      <div class="profile-top-bar">
        <button class="back-link" id="btn-profile-back">${getIcon('arrow-left')} Dashboard</button>
        <div class="profile-heading-group">
          <span class="eyebrow">${isOfficer ? 'ADMINISTRATOR PROFILE' : 'USER PROFILE'}</span>
          <h1 class="black-heading">Account Profile</h1>
          <p>Your verified account credentials and identity details.</p>
        </div>
      </div>

      <div class="profile-card">
        <!-- Profile Hero Row -->
        <div class="profile-hero-row">
          <div class="profile-avatar-large">${avatarLetter}</div>
          <div class="profile-hero-copy">
            <div class="profile-name-badges">
              <h2 class="profile-name-text">${escapeHtml(userName)}</h2>
              <span class="profile-role-pill ${isOfficer ? 'pill-officer' : 'pill-citizen'}">
                ${isOfficer ? getIcon('shield-check') + ' Officer / Admin' : getIcon('user-round') + ' Resident Citizen'}
              </span>
              <span class="profile-status-pill">
                ${getIcon('circle-check')} Active Account
              </span>
            </div>
            <span class="profile-email-text">${escapeHtml(user.email || '')}</span>
          </div>
        </div>

        <!-- Profile Details Grid -->
        <div class="profile-details-grid">
          <div class="profile-fact-card">
            <div class="profile-fact-label">
              ${getIcon('user-round')}
              <span>Full Name</span>
            </div>
            <strong class="profile-fact-value">${escapeHtml(userName)}</strong>
          </div>

          <div class="profile-fact-card">
            <div class="profile-fact-label">
              ${getIcon('mail')}
              <span>Email Address</span>
            </div>
            <strong class="profile-fact-value" title="${escapeHtml(user.email || '')}">${escapeHtml(user.email || '—')}</strong>
          </div>

          <div class="profile-fact-card">
            <div class="profile-fact-label">
              ${getIcon('shield-check')}
              <span>Account Role</span>
            </div>
            <strong class="profile-fact-value">${userRoleText}</strong>
          </div>

          <div class="profile-fact-card">
            <div class="profile-fact-label">
              ${getIcon('building')}
              <span>Department</span>
            </div>
            <strong class="profile-fact-value">${escapeHtml(userDept)}</strong>
          </div>

          <div class="profile-fact-card">
            <div class="profile-fact-label">
              ${getIcon('phone')}
              <span>Phone Number</span>
            </div>
            <strong class="profile-fact-value">${escapeHtml(userPhone)}</strong>
          </div>

          <div class="profile-fact-card">
            <div class="profile-fact-label">
              ${getIcon('map-pin')}
              <span>Address</span>
            </div>
            <strong class="profile-fact-value" title="${escapeHtml(userAddr)}">${escapeHtml(userAddr)}</strong>
          </div>
        </div>

        <!-- Profile Card Footer Bar -->
        <div class="profile-card-footer">
          <div class="profile-security-note">
            ${getIcon('shield-check')}
            <span>Demo account saved in this browser only. Do not use sensitive personal information.</span>
          </div>
          <button class="button button-primary button-small" id="btn-profile-dashboard">
            Back to Dashboard ${getIcon('arrow-right')}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindProfileEvents(setView, render) {
  const btnBack = document.getElementById('btn-profile-back');
  if (btnBack) btnBack.onclick = () => setView('dashboard');

  const btnDash = document.getElementById('btn-profile-dashboard');
  if (btnDash) btnDash.onclick = () => setView('dashboard');
}
