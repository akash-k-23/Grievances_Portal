/**
 * Grievances Portal — Dashboard Page Module (Citizen & Officer)
 */

import { getIcon } from '../icons.js';
import { state, getVisibleGrievances, getStatusTagHtml, getPriorityTagHtml, escapeHtml } from '../state.js';

export function renderWorkspaceDashboard() {
  const isOfficer = state.currentUser === 'officer';
  const visibleGrievances = getVisibleGrievances();

  const q = (state.dashSearchQuery || '').trim().toLowerCase();
  const filteredGrievances = visibleGrievances.filter(g => {
    if (!q) return true;
    const ref = (g.reference || g.referenceId || '').toLowerCase();
    const title = (g.title || '').toLowerCase();
    const desc = (g.description || '').toLowerCase();
    const cat = (g.category || '').toLowerCase();
    const status = (g.status || '').toLowerCase();
    const author = (g.authorName || g.userName || '').toLowerCase();
    const closedBy = (g.closedBy || '').toLowerCase();
    return ref.includes(q) || title.includes(q) || desc.includes(q) || cat.includes(q) || status.includes(q) || author.includes(q) || closedBy.includes(q);
  });

  const statsCards = isOfficer ? [
    ['Total Grievances', visibleGrievances.length, 'clipboard-list', 0],
    ['New', visibleGrievances.filter(g => g.status === 'Submitted').length, 'plus', 1],
    ['Under Review', visibleGrievances.filter(g => g.status === 'Under Review').length, 'clock-3', 2],
    ['Escalated', visibleGrievances.filter(g => g.status === 'Escalated').length, 'circle-alert', 3],
    ['Resolved', visibleGrievances.filter(g => g.status === 'Resolved').length, 'circle-check', 4]
  ] : [
    ['Total Grievances', visibleGrievances.length, 'clipboard-list', 0],
    ['Under Review', visibleGrievances.filter(g => ['Under Review', 'Assigned', 'In Progress'].includes(g.status)).length, 'clock-3', 1],
    ['Resolved', visibleGrievances.filter(g => g.status === 'Resolved').length, 'circle-check', 2],
    ['Escalated', visibleGrievances.filter(g => g.status === 'Escalated').length, 'circle-alert', 3]
  ];

  const statsHtml = statsCards.map(([label, val, icon, tone]) => `
    <article class="stat-card">
      <span class="stat-icon stat-tone-${tone}">${getIcon(icon)}</span>
      <span class="stat-copy">
        <small>${label}</small>
        <strong>${val}</strong>
      </span>
    </article>
  `).join('');

  let recentRowsHtml = '';

  if (isOfficer) {
    if (filteredGrievances.length) {
      recentRowsHtml = `
        <div class="admin-scroll-wrapper">
          <div class="desktop-list-heading admin-list-heading">
            <span>GRIEVANCE ID</span>
            <span>REPORT</span>
            <span>TIME RAISED</span>
            <span>STATUS</span>
            <span>ACTION BY</span>
            <span>CLOSED TIME</span>
            <span>TIME TAKEN</span>
          </div>
          <div class="admin-row-container">
            ${filteredGrievances.map(g => {
              const raisedByName = g.authorName || g.userName || 'Citizen';
              const refId = g.reference || g.referenceId;
              const raisedTime = g.submittedDate || g.createdAt || 'Recent';
              const desc = g.description || 'No description provided';
              const isClosed = g.status === 'Resolved';
              const closedTime = g.closedAt || (isClosed ? (g.lastUpdated || 'Recent') : '—');
              const closedBy = g.closedBy || (isClosed ? 'Admin' : '—');
              const timeTaken = g.timeTaken || (isClosed ? '1 day' : 'In Progress');
              const avatarInitial = raisedByName.charAt(0).toUpperCase();

              return `
                <article class="admin-row-compact clickable-grievance-row" data-ref="${refId}" title="Click to view grievance ${refId}">
                  <div class="admin-col-raised">
                    <span class="admin-avatar-sm">${avatarInitial}</span>
                    <div class="admin-raised-text">
                      <button class="admin-ref-id-btn" data-open-ref="${refId}" title="View grievance ${refId}">${refId}</button>
                      <small class="admin-raised-name-sub" title="${escapeHtml(raisedByName)}">${escapeHtml(raisedByName)}</small>
                    </div>
                  </div>
                  <div class="admin-col-desc" title="${escapeHtml(desc)}">
                    <span class="admin-desc-snippet">${escapeHtml(desc)}</span>
                  </div>
                  <div class="admin-col-raised-time">
                    <small class="admin-inline-label">Raised</small>
                    <span>${raisedTime}</span>
                  </div>
                  <div class="admin-col-status">
                    ${getStatusTagHtml(g.status)}
                  </div>
                  <div class="admin-col-admin">
                    <small class="admin-inline-label">Action By</small>
                    <span class="admin-admin-name">${escapeHtml(closedBy)}</span>
                  </div>
                  <div class="admin-col-closed-time">
                    <small class="admin-inline-label">Closed</small>
                    <span class="${isClosed ? 'highlight-closed' : ''}">${closedTime}</span>
                  </div>
                  <div class="admin-col-duration">
                    <small class="admin-inline-label">Time Taken</small>
                    <span class="admin-duration-text">${timeTaken}</span>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      recentRowsHtml = `
        <div class="empty-state" style="padding: 24px 0;">
          <p class="muted-copy">${q ? 'No grievances found matching your search.' : 'No grievances submitted yet.'}</p>
        </div>
      `;
    }
  } else {
    const userDisplayList = q ? filteredGrievances : filteredGrievances.slice(0, 8);
    if (userDisplayList.length) {
      recentRowsHtml = userDisplayList.map(g => {
        const isClosed = g.status === 'Resolved';
        const closedColHtml = isClosed ? `
          <div class="row-closed-info">
            <span class="closed-badge">${getIcon('circle-check')} ${g.closedAt || g.lastUpdated || 'Closed'}</span>
            <small class="closed-by-text">By ${g.closedBy || 'Officer Marcus Davis'}</small>
          </div>
        ` : `
          <div class="row-closed-info unclosed">
            <span>—</span>
          </div>
        `;

        const raisedByName = g.authorName || g.userName || (state.currentLoggedInUser ? state.currentLoggedInUser.name : 'Citizen');
        const refId = g.reference || g.referenceId;
        return `
          <article class="user-grievance-row clickable-grievance-row" data-ref="${escapeHtml(refId)}" title="Click to view grievance ${escapeHtml(refId)}">
            <div class="row-leading">
              <span class="row-symbol">${getIcon('file-text')}</span>
              <span class="row-title">
                <button class="user-ref-id-btn" data-open-ref="${escapeHtml(refId)}" title="${escapeHtml(refId)}: ${escapeHtml(g.title)}">${escapeHtml(refId)}</button>
                <small class="user-raised-name-sub" title="${escapeHtml(raisedByName)}${g.title ? ` · ${escapeHtml(g.title)}` : ''}">${escapeHtml(raisedByName)}${g.title ? ` · ${escapeHtml(g.title)}` : ''}</small>
              </span>
            </div>
            <span class="row-category" title="${escapeHtml(g.category)}">${escapeHtml(g.category)}</span>
            <span class="row-date">${escapeHtml(g.submittedDate || 'Recent')}</span>
            ${getPriorityTagHtml(g.priority)}
            ${getStatusTagHtml(g.status)}
            ${closedColHtml}
            <button class="row-view" aria-label="View ${escapeHtml(g.title)}" data-open-ref="${escapeHtml(refId)}">
              ${getIcon('chevron-right')}
            </button>
          </article>
        `;
      }).join('');
    } else {
      recentRowsHtml = `
        <div class="empty-state" style="padding: 24px 0;">
          <p class="muted-copy">${q ? 'No grievances found matching your search.' : 'No grievances submitted yet. Click "Submit New Grievance" above to submit one.'}</p>
        </div>
      `;
    }
  }

  return `
    <div class="welcome-row">
      <div>
        <span class="eyebrow">${isOfficer ? 'OFFICER WORKSPACE' : 'YOUR PORTAL'}</span>
        <h1 class="black-heading">${isOfficer ? 'Good morning, Officer' : 'Welcome back'}</h1>
        <p>${isOfficer ? 'Review and manage grievances with care.' : 'Here is the latest on your concerns.'}</p>
      </div>
      ${!isOfficer ? `
        <button class="button button-primary" id="btn-dash-new-grievance">
          ${getIcon('plus')} Submit New Grievance
        </button>
      ` : ''}
    </div>
    <section class="stats-grid ${isOfficer ? 'stats-five' : ''}">
      ${statsHtml}
    </section>

    <!-- Search Grievance Bar immediately after stats tiles -->
    <section class="dashboard-search-section">
      <div class="dash-search-container">
        <div class="dash-search-input-wrapper">
          <span class="dash-search-icon">${getIcon('search')}</span>
          <input 
            type="text" 
            id="dash-search-input" 
            class="dash-search-input" 
            placeholder="${isOfficer ? 'Search grievances by ID, citizen, description, category or status...' : 'Search grievances by ID, title, category or status...'}" 
            value="${escapeHtml(state.dashSearchQuery || '')}"
            aria-label="Search grievances"
            autocomplete="off"
          />
          ${state.dashSearchQuery ? `
            <button class="dash-search-clear-btn" id="btn-clear-dash-search" title="Clear search" aria-label="Clear search">
              ${getIcon('x')}
            </button>
          ` : ''}
        </div>
        <div class="dash-search-hints">
          <span class="search-count-badge">${filteredGrievances.length} ${filteredGrievances.length === 1 ? 'grievance' : 'grievances'}</span>
        </div>
      </div>
    </section>

    <section class="panel recent-panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">${isOfficer ? 'MANAGEMENT QUEUE' : 'LATEST ACTIVITY'}</span>
          <h2 class="black-heading">${isOfficer ? 'All Grievances' : 'Recent Grievances'}</h2>
        </div>
      </div>
      <div class="recent-list">
        ${!isOfficer && filteredGrievances.length ? `
          <div class="user-scroll-wrapper">
            <div class="desktop-list-heading user-list-heading">
              <span>GRIEVANCE ID</span>
              <span>CATEGORY</span>
              <span>SUBMITTED</span>
              <span>PRIORITY</span>
              <span>STATUS</span>
              <span>CLOSED DETAILS</span>
              <span></span>
            </div>
            <div class="user-row-container">
              ${recentRowsHtml}
            </div>
          </div>
        ` : recentRowsHtml}
      </div>
    </section>
    <div class="dashboard-footnote">
      ${getIcon('shield-check')}
      <span>All conversations and updates stay together with each grievance.</span>
    </div>
  `;
}

export function bindDashboardEvents(setView, render) {
  // New grievance button
  const btnNew = document.getElementById('btn-dash-new-grievance');
  if (btnNew) {
    btnNew.onclick = () => setView('submit');
  }

  // Search input
  const searchInput = document.getElementById('dash-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      state.dashSearchQuery = e.target.value;
      render();
      const el = document.getElementById('dash-search-input');
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    };
  }

  const btnClearSearch = document.getElementById('btn-clear-dash-search');
  if (btnClearSearch) {
    btnClearSearch.onclick = () => {
      state.dashSearchQuery = '';
      render();
    };
  }

  // Click on grievance row or reference button to view details
  document.querySelectorAll('[data-open-ref]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const ref = btn.getAttribute('data-open-ref');
      if (ref) {
        state.selectedRef = ref;
        setView('detail');
      }
    };
  });

  document.querySelectorAll('.clickable-grievance-row').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('button')) return;
      const ref = row.getAttribute('data-ref');
      if (ref) {
        state.selectedRef = ref;
        setView('detail');
      }
    };
  });
}
