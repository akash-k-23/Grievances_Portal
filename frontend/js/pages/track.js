/**
 * Grievances Portal — Public Tracking Page Module
 */

import { getIcon } from '../icons.js';
import { state, getStatusTagHtml, renderTimelineBlock, escapeHtml } from '../state.js';

let trackInput = '';
let trackResult = null;
let trackError = '';
let trackBusy = false;

export function renderTrackPage(isPublic = true) {
  let resultBlock = '';
  if (trackResult) {
    resultBlock = `
      <section class="panel tracking-result">
        <div class="result-top">
          <div>
            <span class="eyebrow">GRIEVANCE OVERVIEW</span>
            <h2>${escapeHtml(trackResult.title)}</h2>
            <span class="reference-text">${escapeHtml(trackResult.reference || trackResult.referenceId)}</span>
          </div>
          ${getStatusTagHtml(trackResult.status)}
        </div>
        <div class="track-details-grid">
          <div class="detail-fact"><span>Category</span><strong>${escapeHtml(trackResult.category)}</strong></div>
          <div class="detail-fact"><span>Submitted Date</span><strong>${escapeHtml(trackResult.submittedDate || 'Recent')}</strong></div>
          <div class="detail-fact"><span>Current Status</span><strong>${escapeHtml(trackResult.status)}</strong></div>
          <div class="detail-fact"><span>Last Updated</span><strong>${escapeHtml(trackResult.lastUpdated || 'Recent')}</strong></div>
        </div>
        ${renderTimelineBlock(trackResult.status, trackResult.lastUpdated)}
        <button class="button button-outline" id="btn-view-tracked-details">
          View Grievance Details ${getIcon('arrow-right')}
        </button>
      </section>
    `;
  } else if (!trackError) {
    resultBlock = `
      <div class="track-empty">
        <span class="empty-icon">${getIcon('search')}</span>
        <p>Enter a grievance reference number to track its status.</p>
      </div>
    `;
  }

  const content = `
    <div class="page-intro">
      <span class="eyebrow">A CLEAR VIEW OF WHAT'S NEXT</span>
      <h1>Track Grievance</h1>
      <p>Enter your reference number to see the latest status and updates.</p>
    </div>
    <section class="panel track-search-panel">
      <div class="track-search-heading">
        <span class="track-icon">${getIcon('search')}</span>
        <span>
          <h2>Find your grievance</h2>
          <p>Use the reference number you received when you submitted.</p>
        </span>
      </div>
      <form class="track-form" id="form-track" novalidate>
        <label class="sr-only" for="tracking-reference">Enter grievance reference number</label>
        <div class="field-input-wrap">
          <input id="tracking-reference" placeholder="Enter grievance reference number" value="${escapeHtml(trackInput)}">
        </div>
        <button class="button button-primary" type="submit" ${trackBusy ? 'disabled' : ''}>
          ${trackBusy ? '<span class="spinner"></span> Tracking...' : `Track ${getIcon('arrow-right')}`}
        </button>
      </form>
      ${trackError ? `<span class="field-error" role="alert" style="margin-top: 8px; display: block;">${escapeHtml(trackError)}</span>` : ''}
      <small class="track-example">Example: GRV20261001001</small>
    </section>
    ${resultBlock}
  `;

  if (isPublic) {
    return `<div class="landing-page" style="padding-top: 40px; padding-bottom: 60px;">${content}</div>`;
  }
  return content;
}

export function bindTrackEvents(setView, render) {
  const formTrack = document.getElementById('form-track');
  if (formTrack) {
    formTrack.onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('tracking-reference');
      const val = input ? input.value.trim().toUpperCase() : '';
      trackInput = val;

      if (!val) {
        trackError = 'Please enter a grievance reference number.';
        trackResult = null;
        render();
        return;
      }

      trackBusy = true;
      trackError = '';
      render();

      setTimeout(() => {
        trackBusy = false;
        const found = state.grievances.find(g => (g.reference || g.referenceId || '').toUpperCase() === val);
        if (found) {
          trackResult = found;
          trackError = '';
        } else {
          trackResult = null;
          trackError = `No grievance found matching reference "${val}". Please check the number.`;
        }
        render();
      }, 350);
    };
  }

  const btnTrackDetails = document.getElementById('btn-view-tracked-details');
  if (btnTrackDetails && trackResult) {
    btnTrackDetails.onclick = () => {
      state.selectedRef = trackResult.reference || trackResult.referenceId;
      if (state.currentUser) {
        setView('detail');
      } else {
        setView('login');
      }
    };
  }
}
