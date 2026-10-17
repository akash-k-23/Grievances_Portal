/**
 * Grievances Portal — Messages & Case Communication Page Module
 */

import { getIcon } from '../icons.js';
import { state, getVisibleGrievances, getStatusTagHtml, saveGrievances, showToast, formatDateTime, escapeHtml } from '../state.js';

let messageComposerText = '';

export function renderMessagesPage() {
  const isOfficer = state.currentUser === 'officer';
  const visibleGrievances = getVisibleGrievances();

  if (!visibleGrievances.length) {
    return `
      <div class="page-intro">
        <button class="back-link" id="btn-messages-back-dash" style="margin-bottom: 10px; cursor: pointer;">
          ${getIcon('arrow-left')} Back to Dashboard
        </button>
        <span class="eyebrow">ONE CONVERSATION, ONE PLACE</span>
        <h1 class="black-heading">Messages</h1>
        <p>Stay connected with the officer handling your grievance.</p>
      </div>
      <div class="empty-state thread-empty" style="padding: 40px 0;">
        <span class="empty-icon">${getIcon('message-circle')}</span>
        <h3 class="black-heading">No conversations yet</h3>
        <p>Submit a grievance to begin communicating with an officer.</p>
      </div>
    `;
  }

  let active = visibleGrievances.find(g => (g.reference === state.selectedRef || g.referenceId === state.selectedRef)) || visibleGrievances[0];
  state.selectedRef = active.reference || active.referenceId;
  const activeRef = active.reference || active.referenceId;

  const listHtml = visibleGrievances.map(g => {
    const ref = g.reference || g.referenceId;
    const isSelected = (ref === activeRef);
    const lastMsg = g.messages && g.messages.length ? g.messages[g.messages.length - 1].text : 'No messages yet.';
    return `
      <button class="conversation-select ${isSelected ? 'conversation-selected' : ''}" data-select-ref="${escapeHtml(ref)}">
        <span class="conversation-avatar">${(g.title || 'G').charAt(0)}</span>
        <span class="conversation-select-copy">
          <strong>${escapeHtml(g.title)}</strong>
          <small>${escapeHtml(lastMsg)}</small>
          <small>${escapeHtml(ref)}</small>
        </span>
      </button>
    `;
  }).join('');

  const currentUserName = state.currentLoggedInUser ? state.currentLoggedInUser.name : (isOfficer ? 'Admin Officer' : 'Citizen');

  const messagesHtml = active.messages && active.messages.length ? active.messages.map(m => {
    const isOwn = m.sender === currentUserName || (isOfficer && m.sender.includes('Officer')) || (!isOfficer && !m.sender.includes('Officer'));
    return `
      <article class="message-bubble-row ${isOwn ? 'message-own' : ''}">
        <span class="message-avatar">${(m.sender || 'U').charAt(0)}</span>
        <div class="message-bubble">
          <div class="message-meta">
            <strong>${escapeHtml(m.sender)}</strong>
            <small>${escapeHtml(m.time)}</small>
          </div>
          <p>${escapeHtml(m.text)}</p>
        </div>
      </article>
    `;
  }).join('') : `
    <div class="empty-state thread-empty">
      <span class="empty-icon">${getIcon('message-circle')}</span>
      <h3 class="black-heading">No messages yet.</h3>
      <p>Send a message to start the conversation.</p>
    </div>
  `;

  return `
    <div class="page-intro">
      <button class="back-link" id="btn-messages-back-detail" style="margin-bottom: 10px; cursor: pointer;">
        ${getIcon('arrow-left')} Back to Grievance (${escapeHtml(activeRef)})
      </button>
      <span class="eyebrow">ONE CONVERSATION, ONE PLACE</span>
      <h1 class="black-heading">Messages for ${escapeHtml(activeRef)}</h1>
      <p>Stay connected with the ${isOfficer ? 'citizen' : 'officer'} handling this grievance.</p>
    </div>
    <section class="messages-layout panel">
      <aside class="conversation-list">
        <div class="conversation-list-title">
          <h2>Grievances</h2>
          <span>${visibleGrievances.length}</span>
        </div>
        ${listHtml}
      </aside>
      <div class="message-thread">
        <header class="thread-header">
          <span class="conversation-avatar">${(active.title || 'G').charAt(0)}</span>
          <span class="thread-heading">
            <strong>${escapeHtml(active.title)}</strong>
            <small>${escapeHtml(activeRef)} · ${escapeHtml(active.category)}</small>
          </span>
          ${getStatusTagHtml(active.status)}
        </header>
        <div class="thread-body" id="thread-body-scroll" aria-live="polite">
          ${messagesHtml}
        </div>
        <form class="message-composer" id="form-message-composer">
          <label class="sr-only" for="message-input">Type your message...</label>
          <div class="field-input-wrap">
            <textarea id="message-input" placeholder="Type your message..." rows="2">${escapeHtml(messageComposerText)}</textarea>
          </div>
          <button class="button button-primary" type="submit">
            ${getIcon('send')} Send Message
          </button>
        </form>
      </div>
    </section>
  `;
}

export function bindMessagesEvents(setView, render) {
  const btnBackDetail = document.getElementById('btn-messages-back-detail');
  if (btnBackDetail) {
    btnBackDetail.onclick = () => setView('detail');
  }

  const btnBackDash = document.getElementById('btn-messages-back-dash');
  if (btnBackDash) {
    btnBackDash.onclick = () => setView('dashboard');
  }

  document.querySelectorAll('[data-select-ref]').forEach(btn => {
    btn.onclick = () => {
      const ref = btn.getAttribute('data-select-ref');
      if (ref) {
        state.selectedRef = ref;
        render();
      }
    };
  });

  const formMsg = document.getElementById('form-message-composer');
  if (formMsg) {
    formMsg.onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('message-input');
      const text = input ? input.value.trim() : '';
      if (!text) return;

      const item = state.grievances.find(g => (g.reference === state.selectedRef || g.referenceId === state.selectedRef));
      if (!item) return;

      const senderName = state.currentLoggedInUser ? state.currentLoggedInUser.name : (state.currentUser === 'officer' ? 'Admin Officer' : 'Citizen');
      const newMsg = {
        sender: senderName,
        time: formatDateTime(),
        text
      };

      item.messages = item.messages || [];
      item.messages.push(newMsg);
      saveGrievances();
      messageComposerText = '';
      render();

      const scrollBox = document.getElementById('thread-body-scroll');
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
    };
  }
}
