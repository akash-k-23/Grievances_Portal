/**
 * Grievances Portal — Submit Grievance Page Module (with Leaflet Map & GPS Geolocation)
 */

import { getIcon } from '../icons.js';
import { state, CATEGORIES, saveGrievances, showToast, formatBytes, formatDate, escapeHtml } from '../state.js';

let submitMap = null;
let submitMarker = null;

let submitValues = {
  title: '',
  category: '',
  description: '',
  location: '',
  incidentDate: new Date().toISOString().split('T')[0],
  priority: 'Medium',
  coordinates: { lat: 9.9252, lng: 78.1198 }
};
let submitErrors = {};
let submitBusy = false;
let submitFile = null;
let submitFileName = '';
let submitFileType = '';
let submitFileSize = '';
let submitFileData = null;

export function renderSubmitPage() {
  return `
    <div class="page-intro compact-page-intro">
      <button class="back-link" id="btn-submit-back-dash">${getIcon('arrow-left')} Dashboard</button>
      <span class="eyebrow">SHARE YOUR CONCERN</span>
      <h1 class="black-heading">Submit a Grievance</h1>
      <p>Tell us what happened. We will make sure your concern reaches the right team.</p>
    </div>
    <form class="submission-layout submission-layout-compact" id="form-submit-grievance" novalidate>
      <section class="panel form-panel form-panel-compact">
        <div class="form-section-heading">
          <span class="step-number">1</span>
          <div>
            <h2>Tell us about your concern</h2>
            <p>Fields marked with <span class="required">*</span> are required.</p>
          </div>
        </div>
        <div class="form-grid">
          <div class="field">
            <label class="field-label" for="grievance-title">Grievance Title <span class="required">*</span></label>
            <div class="field-input-wrap">
              <input id="grievance-title" placeholder="A short title for your concern" value="${escapeHtml(submitValues.title)}">
            </div>
            ${submitErrors.title ? `<span class="field-error" role="alert">${escapeHtml(submitErrors.title)}</span>` : ''}
          </div>
          <div class="field">
            <label class="field-label" for="grievance-category">Category <span class="required">*</span></label>
            <select id="grievance-category">
              <option value="">Select a category</option>
              ${CATEGORIES.map(c => `<option ${submitValues.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            ${submitErrors.category ? `<span class="field-error" role="alert">${escapeHtml(submitErrors.category)}</span>` : ''}
          </div>
          <div class="field field-full">
            <label class="field-label" for="grievance-description">Description <span class="required">*</span></label>
            <div class="field-input-wrap">
              <textarea id="grievance-description" placeholder="Please describe your concern and any relevant details..." rows="3">${escapeHtml(submitValues.description)}</textarea>
            </div>
            ${submitErrors.description ? `<span class="field-error" role="alert">${escapeHtml(submitErrors.description)}</span>` : ''}
          </div>
          <div class="field field-full">
            <div class="location-header-row">
              <label class="field-label" for="grievance-location">Location / Incident Site <span class="required">*</span></label>
              <button type="button" class="btn-location-gps" id="btn-use-current-location" title="Detect and use your current GPS location">
                ${getIcon('crosshair')}
                <span>Use Current Location</span>
              </button>
            </div>
            <div class="location-input-group">
              <div class="location-input-wrap">
                <input id="grievance-location" placeholder="Type an address, building, or landmark..." value="${escapeHtml(submitValues.location || '')}" autocomplete="off">
              </div>
              <button type="button" class="button button-outline btn-search-location" id="btn-search-location" title="Locate on map">
                ${getIcon('search')}
                <span>Find on Map</span>
              </button>
            </div>
            ${submitErrors.location ? `<span class="field-error" role="alert">${escapeHtml(submitErrors.location)}</span>` : ''}

            <!-- Interactive Map Container -->
            <div class="map-wrapper">
              <div id="grievance-map" class="grievance-map-box"></div>
              <div class="map-footer-bar">
                <span class="map-helper-hint">
                  ${getIcon('map-pin')} Click anywhere on the map or drag the pin to pinpoint the incident spot.
                </span>
                <span id="map-coords-badge" class="map-coords-badge">${submitValues.coordinates ? `${submitValues.coordinates.lat.toFixed(4)}, ${submitValues.coordinates.lng.toFixed(4)}` : 'Coordinates ready'}</span>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="field-label" for="incident-date">Date of Incident <span class="required">*</span></label>
            <input id="incident-date" type="date" value="${submitValues.incidentDate}">
            ${submitErrors.incidentDate ? `<span class="field-error" role="alert">${escapeHtml(submitErrors.incidentDate)}</span>` : ''}
          </div>
          <div class="field">
            <label class="field-label" for="grievance-priority">Priority</label>
            <select id="grievance-priority">
              <option ${submitValues.priority === 'Low' ? 'selected' : ''}>Low</option>
              <option ${submitValues.priority === 'Medium' ? 'selected' : ''}>Medium</option>
              <option ${submitValues.priority === 'High' ? 'selected' : ''}>High</option>
            </select>
          </div>
          <div class="field field-full">
            <span class="field-label">Supporting Evidence / Photos <span class="optional">(optional)</span></span>
            ${submitFile ? `
              <div class="selected-file-card">
                ${submitFileData && submitFileType && submitFileType.startsWith('image/') ? `
                  <div class="selected-file-thumb">
                    <img src="${submitFileData}" alt="${submitFileName || submitFile.name}" />
                  </div>
                ` : `
                  <div class="selected-file-icon">${getIcon('paperclip')}</div>
                `}
                <div class="selected-file-info">
                  <strong>${escapeHtml(submitFileName || submitFile.name)}</strong>
                  <small>${escapeHtml(submitFileSize || '')} · Attached for Officer review</small>
                </div>
                <button type="button" class="btn-remove-selected-file" aria-label="Remove selected file" id="btn-remove-file">${getIcon('x')}</button>
              </div>
            ` : `
              <label class="upload-area upload-area-compact" for="grievance-file">
                ${getIcon('upload')}
                <strong>Choose a file to attach</strong>
                <span>Supports PNG, JPG, PDF up to 20MB. Image evidence will be visible to the Admin.</span>
                <input id="grievance-file" type="file" accept="image/*,.pdf,.doc,.docx,.txt">
              </label>
            `}
          </div>
        </div>
        <div class="form-actions">
          <button class="button button-outline" type="button" id="btn-submit-clear">Clear</button>
          <button class="button button-primary" type="submit" ${submitBusy ? 'disabled' : ''}>
            ${submitBusy ? '<span class="spinner"></span> Submitting...' : `Submit Grievance ${getIcon('arrow-right')}`}
          </button>
        </div>
      </section>
    </form>
  `;
}

export function initSubmitMap() {
  const mapContainer = document.getElementById('grievance-map');
  if (!mapContainer) return;

  if (submitMap) {
    try { submitMap.remove(); } catch (e) {}
    submitMap = null;
    submitMarker = null;
  }

  const defaultLat = (submitValues.coordinates && submitValues.coordinates.lat) || 9.9252;
  const defaultLng = (submitValues.coordinates && submitValues.coordinates.lng) || 78.1198;
  const defaultZoom = submitValues.coordinates ? 16 : 13;

  if (typeof window.L !== 'undefined') {
    try {
      submitMap = L.map('grievance-map', {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(submitMap);

      const customPinIcon = L.divIcon({
        className: 'custom-map-marker-pin',
        html: `<div class="marker-pulse"></div><div class="marker-pin-svg">${getIcon('map-pin')}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 34],
        popupAnchor: [0, -34]
      });

      submitMarker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customPinIcon
      }).addTo(submitMap);

      submitMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        updateLocationFromCoords(pos.lat, pos.lng);
      });

      submitMap.on('click', (e) => {
        submitMarker.setLatLng(e.latlng);
        updateLocationFromCoords(e.latlng.lat, e.latlng.lng);
      });

      setTimeout(() => {
        if (submitMap) submitMap.invalidateSize();
      }, 150);
    } catch (err) {
      console.warn('Map initialization error:', err);
    }
  } else {
    mapContainer.innerHTML = `
      <div class="map-fallback-view">
        <span class="fallback-pin-icon">${getIcon('map-pin')}</span>
        <p><strong>Interactive Location Picker</strong></p>
        <small>Enter your location in the field above or click "Use Current Location" to detect via GPS.</small>
      </div>
    `;
  }
}

export async function updateLocationFromCoords(lat, lng) {
  submitValues.coordinates = { lat, lng };
  const badge = document.getElementById('map-coords-badge');
  if (badge) badge.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const shortAddress = parts.slice(0, 3).join(',').trim();
        submitValues.location = shortAddress;
        const locInput = document.getElementById('grievance-location');
        if (locInput) locInput.value = shortAddress;
      }
    }
  } catch (err) {
    if (!submitValues.location) {
      submitValues.location = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      const locInput = document.getElementById('grievance-location');
      if (locInput) locInput.value = submitValues.location;
    }
  }
}

export async function searchLocationOnMap(query) {
  if (!query || !query.trim()) return;
  const btnSearch = document.getElementById('btn-search-location');
  if (btnSearch) {
    btnSearch.disabled = true;
    btnSearch.innerHTML = `${getIcon('search')} <span>Searching...</span>`;
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        submitValues.coordinates = { lat, lng: lon };
        if (submitMap && submitMarker) {
          submitMap.setView([lat, lon], 16);
          submitMarker.setLatLng([lat, lon]);
        }
        const badge = document.getElementById('map-coords-badge');
        if (badge) badge.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        showToast('Location pinned on map.');
      } else {
        showToast('Address not found on map. You can click to pin it directly.');
      }
    }
  } catch (e) {
    showToast('Search service unavailable. You can click on the map directly.');
  } finally {
    if (btnSearch) {
      btnSearch.disabled = false;
      btnSearch.innerHTML = `${getIcon('search')} <span>Find on Map</span>`;
    }
  }
}

export function bindSubmitEvents(setView, render) {
  const btnBack = document.getElementById('btn-submit-back-dash');
  if (btnBack) btnBack.onclick = () => setView('dashboard');

  const btnClear = document.getElementById('btn-submit-clear');
  if (btnClear) {
    btnClear.onclick = () => {
      submitValues = {
        title: '',
        category: '',
        description: '',
        location: '',
        incidentDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        coordinates: { lat: 9.9252, lng: 78.1198 }
      };
      submitErrors = {};
      submitFile = null;
      submitFileName = '';
      submitFileType = '';
      submitFileSize = '';
      submitFileData = null;
      render();
    };
  }

  const btnUseCurrentLoc = document.getElementById('btn-use-current-location');
  if (btnUseCurrentLoc) {
    btnUseCurrentLoc.onclick = () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.');
        return;
      }
      btnUseCurrentLoc.innerHTML = `<span class="spinner spinner-small"></span> <span>Detecting GPS...</span>`;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btnUseCurrentLoc.innerHTML = `${getIcon('crosshair')} <span>Use Current Location</span>`;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          submitValues.coordinates = { lat, lng };
          if (submitMap && submitMarker) {
            submitMap.setView([lat, lng], 16);
            submitMarker.setLatLng([lat, lng]);
          }
          const badge = document.getElementById('map-coords-badge');
          if (badge) badge.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          updateLocationFromCoords(lat, lng);
          showToast('GPS Location detected and pinned.');
        },
        () => {
          btnUseCurrentLoc.innerHTML = `${getIcon('crosshair')} <span>Use Current Location</span>`;
          showToast('Could not access GPS. Please type your location or pick on map.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };
  }

  const btnSearchLoc = document.getElementById('btn-search-location');
  const inputLoc = document.getElementById('grievance-location');
  if (btnSearchLoc && inputLoc) {
    btnSearchLoc.onclick = () => searchLocationOnMap(inputLoc.value);
    inputLoc.oninput = (e) => {
      submitValues.location = e.target.value;
    };
    inputLoc.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchLocationOnMap(inputLoc.value);
      }
    };
  }

  const fileInput = document.getElementById('grievance-file');
  if (fileInput) {
    fileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
      if (file) {
        if (file.size > 20 * 1024 * 1024) {
          showToast('File size must be under 20MB.');
          return;
        }
        submitFile = file;
        submitFileName = file.name;
        submitFileType = file.type || '';
        submitFileSize = formatBytes(file.size);
        const reader = new FileReader();
        reader.onload = (re) => {
          submitFileData = re.target.result;
          render();
        };
        reader.readAsDataURL(file);
      }
    };
  }

  const btnRemoveFile = document.getElementById('btn-remove-file');
  if (btnRemoveFile) {
    btnRemoveFile.onclick = () => {
      submitFile = null;
      submitFileName = '';
      submitFileType = '';
      submitFileSize = '';
      submitFileData = null;
      render();
    };
  }

  const formSubmit = document.getElementById('form-submit-grievance');
  if (formSubmit) {
    formSubmit.onsubmit = (e) => {
      e.preventDefault();
      const title = document.getElementById('grievance-title')?.value.trim() || '';
      const category = document.getElementById('grievance-category')?.value || '';
      const description = document.getElementById('grievance-description')?.value.trim() || '';
      const location = document.getElementById('grievance-location')?.value.trim() || '';
      const incidentDate = document.getElementById('incident-date')?.value || '';
      const priority = document.getElementById('grievance-priority')?.value || 'Medium';

      submitValues = { title, category, description, location, incidentDate, priority, coordinates: submitValues.coordinates };
      const errors = {};
      if (!title) errors.title = 'Please enter a title.';
      if (!category) errors.category = 'Please select a category.';
      if (!description) errors.description = 'Please describe your concern.';
      if (!location) errors.location = 'Please specify the incident location.';
      if (!incidentDate) errors.incidentDate = 'Please select the incident date.';

      submitErrors = errors;
      if (Object.keys(errors).length > 0) {
        render();
        return;
      }

      submitBusy = true;
      render();

      const user = state.currentLoggedInUser || { name: 'Citizen', email: 'citizen@example.com' };
      const newRef = 'GRV' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + String(Math.floor(1000 + Math.random() * 9000));
      const todayStr = formatDate();

      const newGrievance = {
        id: 'grv-' + Date.now(),
        reference: newRef,
        referenceId: newRef,
        title,
        category,
        description,
        location,
        coordinates: submitValues.coordinates,
        incidentDate,
        priority,
        status: 'Submitted',
        submittedDate: todayStr,
        lastUpdated: todayStr,
        createdAt: new Date().toISOString(),
        authorName: user.name,
        authorEmail: user.email,
        userName: user.name,
        userEmail: user.email,
        attachmentName: submitFileName,
        attachmentSize: submitFileSize,
        attachmentType: submitFileType,
        attachmentData: submitFileData,
        messages: [
          { sender: user.name, time: todayStr, text: `Grievance submitted regarding: ${title}` }
        ]
      };

      state.grievances.unshift(newGrievance);
      saveGrievances();
      state.selectedRef = newRef;
      submitBusy = false;
      submitValues = {
        title: '',
        category: '',
        description: '',
        location: '',
        incidentDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        coordinates: { lat: 9.9252, lng: 78.1198 }
      };
      submitFile = null;
      submitFileName = '';
      submitFileType = '';
      submitFileSize = '';
      submitFileData = null;
      submitErrors = {};

      showToast(`Grievance ${newRef} submitted successfully!`);
      setView('detail');
    };
  }
}
