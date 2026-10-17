/**
 * Grievances Portal — Grievance Details & Incident Location Map Page Module
 */

import { getIcon } from '../icons.js';
import { 
  state, 
  CAMPUS_MAP_PLACES, 
  ALL_STATUSES, 
  getVisibleGrievances, 
  getStatusTagHtml, 
  getPriorityTagHtml, 
  renderTimelineBlock, 
  saveGrievances, 
  showToast, 
  escapeHtml,
  formatBytes
} from '../state.js';

let detailMap = null;
let detailMarker = null;

function renderAttachmentSection(item) {
  const fileName = (item && (item.attachmentName || item.fileName)) || (item && item.attachmentData ? 'Attached_Evidence.png' : null);
  if (!fileName && !(item && item.attachmentData)) return '';

  const displayFileName = fileName || 'Attached_Evidence.png';
  const fileUrl = item && item.attachmentData ? item.attachmentData : null;
  const isImg = /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(displayFileName) || (item && item.attachmentType && item.attachmentType.startsWith('image/'));
  const fileSize = (item && item.attachmentSize) ? item.attachmentSize : (item && item.attachmentData ? formatBytes(item.attachmentData.length * 0.75) : 'Attachment file');

  return `
    <div class="attachment-section" style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #f0eaf7;">
      <div class="attachment-section-heading">
        <span class="eyebrow">SUPPORTING EVIDENCE</span>
        <h3 class="black-heading" style="margin: 4px 0 10px;">Attached File</h3>
      </div>
      <div class="attachment-card" style="display: flex; align-items: center; gap: 12px; background: #faf8fc; border: 1.5px solid #ded5ea; border-radius: 10px; padding: 10px 14px;">
        <div class="attachment-preview-box" style="width: 42px; height: 42px; border-radius: 8px; background: #ede3fa; color: #6b21a8; display: grid; place-items: center; flex-shrink: 0;">
          ${fileUrl && isImg ? `
            <img src="${fileUrl}" alt="${displayFileName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" />
          ` : `
            ${getIcon('file-text')}
          `}
        </div>
        <div class="attachment-meta-wrap" style="flex: 1; min-width: 0;">
          <strong class="attachment-name" style="display: block; font-size: 13.5px; color: #1e122d; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(displayFileName)}</strong>
          <small class="attachment-subinfo" style="color: #6f6280; font-size: 11.5px;">${escapeHtml(fileSize)} · ${isImg ? 'Photo Evidence' : 'Document File'}</small>
        </div>
        ${fileUrl ? `
          <a href="${fileUrl}" download="${displayFileName}" class="button button-outline button-small" style="text-decoration: none;">
            ${getIcon('download')} Download
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

export function renderWorkspaceDetailPage() {
  const isOfficer = state.currentUser === 'officer';
  const visibleGrievances = getVisibleGrievances();
  const item = visibleGrievances.find(g => (g.reference === state.selectedRef || g.referenceId === state.selectedRef)) || state.grievances.find(g => (g.reference === state.selectedRef || g.referenceId === state.selectedRef));

  if (!item) {
    return `
      <div class="page-intro detail-intro">
        <button class="back-link" id="btn-detail-back-list">
          ${getIcon('arrow-left')} Back to Dashboard
        </button>
        <div class="empty-state" style="padding: 40px 0;">
          <span class="empty-icon">${getIcon('circle-alert')}</span>
          <h3>Access Denied</h3>
          <p>This grievance was not found or belongs to another user account.</p>
        </div>
      </div>
    `;
  }

  const refId = item.reference || item.referenceId;

  return `
    <div class="page-intro detail-intro">
      <button class="back-link" id="btn-detail-back-list">
        ${getIcon('arrow-left')} Back to Dashboard
      </button>
      <div class="detail-title-row">
        <div>
          <span class="reference-text">${escapeHtml(refId)}</span>
          <h1 class="black-heading">${escapeHtml(item.title)}</h1>
          <p>${escapeHtml(item.category)} <span class="dot-separator">·</span> Submitted ${escapeHtml(item.submittedDate || 'Recently')}</p>
        </div>
        ${getStatusTagHtml(item.status)}
      </div>
    </div>
    <div class="detail-layout">
      <div class="detail-main">
        <section class="panel information-panel">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">GRIEVANCE INFORMATION</span>
              <h2 class="black-heading">Details</h2>
            </div>
            ${getPriorityTagHtml(item.priority)}
          </div>
          <p class="description-text">${escapeHtml(item.description)}</p>
          <div class="detail-facts-grid">
            <div class="detail-fact"><span>Category</span><strong>${escapeHtml(item.category)}</strong></div>
            <div class="detail-fact">${getIcon('map-pin')}<span>Location</span><strong>${escapeHtml(item.location || 'Campus')}${item.coordinates ? ` <span class="coord-inline-pill" title="GPS Coordinates">📍 ${item.coordinates.lat.toFixed(4)}, ${item.coordinates.lng.toFixed(4)}</span>` : ''}</strong></div>
            <div class="detail-fact"><span>Incident Date</span><strong>${escapeHtml(item.incidentDate || 'N/A')}</strong></div>
            <div class="detail-fact"><span>Submitted Date</span><strong>${escapeHtml(item.submittedDate || 'Recent')}</strong></div>
            <div class="detail-fact"><span>Priority</span><strong>${escapeHtml(item.priority || 'Medium')}</strong></div>
            <div class="detail-fact"><span>Last Updated</span><strong>${escapeHtml(item.lastUpdated || 'Recent')}</strong></div>
          </div>
          ${renderAttachmentSection(item)}
          ${isOfficer ? `
            <div class="officer-status-control" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #f0eaf7;">
              <label class="field-label" for="officer-status">Update status</label>
              <select id="officer-status">
                ${ALL_STATUSES.map(s => `<option ${item.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <small class="field-hint" style="display: block; margin-top: 4px; color: #766986;">Status changes update the grievance immediately.</small>
            </div>
          ` : ''}
        </section>

        <!-- Reported Location on Map Panel -->
        <section class="panel incident-map-panel">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">INCIDENT SITE LOCATION</span>
              <h2 class="black-heading">Reported Location on Map</h2>
            </div>
            <span id="detail-coords-badge" class="map-coords-badge">${item.coordinates ? `${item.coordinates.lat.toFixed(4)}, ${item.coordinates.lng.toFixed(4)}` : 'Campus Map'}</span>
          </div>
          <div class="detail-map-wrapper">
            <div id="detail-incident-map" class="detail-map-box"></div>
            <div class="detail-map-footer">
              <div class="detail-map-site-info">
                <span class="detail-map-pin-icon">${getIcon('map-pin')}</span>
                <div class="detail-map-site-text">
                  <strong class="detail-map-site-title">${escapeHtml(item.location || 'Reported Incident Site')}</strong>
                  <small class="detail-map-site-desc">Reported by ${escapeHtml(item.authorName || item.userName || 'Citizen')} · ${escapeHtml(item.category || 'Grievance')}</small>
                </div>
              </div>
              <div class="detail-map-actions">
                <button type="button" class="button button-outline button-small" id="btn-recenter-detail-map" title="Center on Incident Spot">
                  ${getIcon('crosshair')} Recenter Pin
                </button>
                <button type="button" class="button button-outline button-small" id="btn-open-ext-map" title="View Full Map on OpenStreetMap">
                  ${getIcon('arrow-right')} Open Full Map
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="panel detail-timeline">
          ${renderTimelineBlock(item.status, item.lastUpdated)}
        </section>

        <section class="panel conversation-panel">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">CONVERSATION</span>
              <h2 class="black-heading">Messages</h2>
            </div>
            <button class="text-button" id="btn-open-conversation">Open Messages ${getIcon('arrow-right')}</button>
          </div>
          ${item.messages && item.messages.length ? item.messages.slice(-3).map(m => `
            <article class="preview-message">
              <strong>${escapeHtml(m.sender)} <small>${escapeHtml(m.time)}</small></strong>
              <p>${escapeHtml(m.text)}</p>
            </article>
          `).join('') : '<p class="muted-copy">No messages yet. Click "Open Messages" to communicate regarding this grievance.</p>'}
        </section>
      </div>

      <aside class="detail-aside">
        <section class="panel detail-actions">
          <h2 class="black-heading">Next steps</h2>
          <p>${isOfficer ? 'Keep the grievance status and conversation up to date.' : 'Keep track of progress and stay in touch with your officer.'}</p>
          <button class="button button-outline button-full" id="btn-detail-open-msgs">
            ${getIcon('message-circle')} Open Messages
          </button>
        </section>
      </aside>
    </div>
  `;
}

export function initDetailMap() {
  const mapContainer = document.getElementById('detail-incident-map');
  if (!mapContainer) return;

  if (detailMap) {
    try { detailMap.remove(); } catch (e) {}
    detailMap = null;
    detailMarker = null;
  }

  const visibleGrievances = getVisibleGrievances();
  const item = visibleGrievances.find(g => (g.reference === state.selectedRef || g.referenceId === state.selectedRef)) || state.grievances.find(g => (g.reference === state.selectedRef || g.referenceId === state.selectedRef));
  if (!item) return;

  let lat = item.coordinates && item.coordinates.lat;
  let lng = item.coordinates && item.coordinates.lng;

  if (!lat || !lng) {
    const locStr = (item.location || '').toLowerCase();
    const match = CAMPUS_MAP_PLACES.find(p => locStr.includes(p.title.toLowerCase()) || locStr.includes((p.subtitle || '').toLowerCase()));
    if (match) {
      lat = match.lat;
      lng = match.lng;
    } else if (locStr.includes('east wing') || locStr.includes('block a')) {
      lat = 9.9252;
      lng = 78.1198;
    } else if (locStr.includes('library')) {
      lat = 9.9260;
      lng = 78.1210;
    } else if (locStr.includes('cse') || locStr.includes('cs') || locStr.includes('academic')) {
      lat = 9.9248;
      lng = 78.1205;
    } else {
      lat = 9.9252;
      lng = 78.1198;
    }
  }

  const badge = document.getElementById('detail-coords-badge');
  if (badge) badge.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  const btnRecenter = document.getElementById('btn-recenter-detail-map');
  if (btnRecenter) {
    btnRecenter.onclick = () => {
      if (detailMap) {
        detailMap.setView([lat, lng], 16);
        if (detailMarker) detailMarker.openPopup();
      }
    };
  }

  const btnOpenExt = document.getElementById('btn-open-ext-map');
  if (btnOpenExt) {
    btnOpenExt.onclick = () => {
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`, '_blank');
    };
  }

  if (typeof window.L !== 'undefined') {
    try {
      detailMap = L.map('detail-incident-map', {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(detailMap);

      const customPinIcon = L.divIcon({
        className: 'custom-map-marker-pin',
        html: `<div class="marker-pulse"></div><div class="marker-pin-svg">${getIcon('map-pin')}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 34],
        popupAnchor: [0, -34]
      });

      detailMarker = L.marker([lat, lng], {
        icon: customPinIcon
      }).addTo(detailMap);

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #1f142c; min-width: 170px;">
          <strong style="color: #6b21a8; font-size: 13px; display: block; margin-bottom: 2px;">${escapeHtml(item.reference || item.referenceId || 'Grievance')}</strong>
          <div style="font-weight: 700; margin-bottom: 4px; color: #000000;">${escapeHtml(item.title || '')}</div>
          <div style="color: #6b5e78; font-size: 11.5px; margin-bottom: 2px;">📍 ${escapeHtml(item.location || 'Reported site')}</div>
          <div style="color: #8b7d9b; font-size: 10.5px;">Reported by: ${escapeHtml(item.authorName || item.userName || 'Citizen')}</div>
        </div>
      `;
      detailMarker.bindPopup(popupContent).openPopup();

      setTimeout(() => {
        if (detailMap) detailMap.invalidateSize();
      }, 150);
    } catch (err) {
      console.warn('Detail map initialization error:', err);
    }
  } else {
    mapContainer.innerHTML = `
      <div class="map-fallback-view">
        <span class="fallback-pin-icon">${getIcon('map-pin')}</span>
        <p><strong>${escapeHtml(item.location || 'Reported Site')}</strong></p>
        <small>GPS Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</small>
      </div>
    `;
  }
}

export function bindDetailEvents(setView, render) {
  const btnBack = document.getElementById('btn-detail-back-list');
  if (btnBack) btnBack.onclick = () => setView('dashboard');

  const btnOpenMsg1 = document.getElementById('btn-open-conversation');
  if (btnOpenMsg1) btnOpenMsg1.onclick = () => setView('messages');

  const btnOpenMsg2 = document.getElementById('btn-detail-open-msgs');
  if (btnOpenMsg2) btnOpenMsg2.onclick = () => setView('messages');

  const officerStatusSelect = document.getElementById('officer-status');
  if (officerStatusSelect) {
    officerStatusSelect.onchange = (e) => {
      const newStatus = e.target.value;
      const item = state.grievances.find(g => (g.reference === state.selectedRef || g.referenceId === state.selectedRef));
      if (item) {
        item.status = newStatus;
        item.lastUpdated = 'Just now';
        if (newStatus === 'Resolved') {
          item.closedAt = 'Just now';
          item.closedBy = state.currentLoggedInUser ? state.currentLoggedInUser.name : 'Admin Officer';
        }
        saveGrievances();
        showToast(`Status updated to "${newStatus}".`);
        render();
      }
    };
  }
}
