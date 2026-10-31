/**
 * Grievances Portal — Public Home & Landing Page Module
 */

import { getIcon } from '../icons.js';
import { 
  accessibilitySettings, 
  setAccessibilityTextSize, 
  toggleAccessibilityContrast, 
  toggleAccessibilitySpacing, 
  resetAccessibility 
} from '../state.js';

let accessibilityOpen = false;

export function renderBrandMark() {
  return `<span class="brand-mark" aria-hidden="true">${getIcon('shield-check')}</span>`;
}

export function renderPublicHeader() {
  const SIZES = ['normal', 'large', 'largest'];
  const currentIndex = SIZES.indexOf(accessibilitySettings.textSize);
  const isDecreaseDisabled = currentIndex <= 0;
  const isIncreaseDisabled = currentIndex >= SIZES.length - 1;

  const a11yPanel = accessibilityOpen ? `
    <div class="accessibility-panel" id="accessibility-panel" aria-label="Adjust how this page looks">
      <h2>Make this page easier to read</h2>
      <p>Choose the settings that work best for you.</p>
      <div class="accessibility-setting-row">
        <span>Text size</span>
        <div class="accessibility-size-controls">
          <button type="button" aria-label="Decrease text size" ${isDecreaseDisabled ? 'disabled' : ''} id="btn-a11y-dec">A−</button>
          <button type="button" aria-label="Increase text size" ${isIncreaseDisabled ? 'disabled' : ''} id="btn-a11y-inc">A+</button>
        </div>
      </div>
      <button class="accessibility-toggle" type="button" aria-pressed="${accessibilitySettings.highContrast}" id="btn-a11y-contrast">
        Higher contrast <span>${accessibilitySettings.highContrast ? 'On' : 'Off'}</span>
      </button>
      <button class="accessibility-toggle" type="button" aria-pressed="${accessibilitySettings.extraSpacing}" id="btn-a11y-spacing">
        More text spacing <span>${accessibilitySettings.extraSpacing ? 'On' : 'Off'}</span>
      </button>
      <button class="accessibility-reset" type="button" id="btn-a11y-reset">Reset settings</button>
    </div>
  ` : '';

  return `
    <header class="public-header">
      <button class="brand-lockup" id="btn-nav-brand">
        ${renderBrandMark()}
        <span>Grievances Portal</span>
      </button>
      <nav class="public-nav" aria-label="Public navigation">
        <button id="btn-nav-home">Home</button>
        <button id="btn-nav-track">Track Grievance</button>
        <button class="public-register" id="btn-nav-register">Register</button>
        <button class="button button-primary public-login" id="btn-nav-login">
          Login ${getIcon('arrow-right')}
        </button>
      </nav>
      <section class="accessibility-settings" aria-label="Accessibility settings">
        <button class="accessibility-trigger" type="button" aria-expanded="${accessibilityOpen}" aria-controls="accessibility-panel" id="btn-a11y-trigger">
          ${getIcon('accessibility')}
          <span class="accessibility-label">Accessibility settings</span>
        </button>
        ${a11yPanel}
      </section>
    </header>
  `;
}

export function renderHomePage() {
  return `
    ${renderPublicHeader()}
    <main class="landing-page">
      <section class="hero-section">
        <div class="hero-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> A clear path forward</span>
          <h1>Grievances<br/><span>Portal</span></h1>
          <p class="hero-subtitle">Raise your concern, track its progress, and receive updates in one place.</p>
          <div class="hero-actions">
            <button class="button button-primary button-large" id="btn-hero-submit">
              Submit a Grievance ${getIcon('arrow-right')}
            </button>
            <button class="button button-secondary button-large" id="btn-hero-track">
              Track Grievance ${getIcon('search')}
            </button>
          </div>
          <div class="hero-assurance">
            ${getIcon('shield-check')}
            <span>A thoughtful, transparent process from start to finish.</span>
          </div>
        </div>
        <div class="hero-art" aria-label="A clear and supportive process for raising a concern">
          <div class="art-wash"></div>
          <div class="art-ring ring-one"></div>
          <div class="art-ring ring-two"></div>
          <div class="art-orb">
            ${renderBrandMark()}
            <strong>Here to<br/>listen</strong>
          </div>
          <div class="art-card art-card-top">
            <span class="art-card-icon">${getIcon('file-text')}</span>
            <span><strong>Share your concern</strong><small>At your own pace</small></span>
          </div>
          <div class="art-card art-card-right">
            <span class="art-card-icon">${getIcon('message-circle')}</span>
            <span><strong>Stay informed</strong><small>Updates in one place</small></span>
          </div>
          <div class="art-card art-card-bottom">
            <span class="art-card-icon">${getIcon('circle-check')}</span>
            <span><strong>Move forward</strong><small>With clear next steps</small></span>
          </div>
        </div>
      </section>
      <section class="functions-section">
        <div class="section-heading">
          <div>
            <span class="eyebrow">HOW IT WORKS</span>
            <h2>Support at every step</h2>
          </div>
          <p>A straightforward process designed to keep you informed and heard.</p>
        </div>
        <div class="function-grid">
          <article class="function-card">
            <span class="function-number">01</span>
            <span class="function-icon">${getIcon('file-text')}</span>
            <h3>Submit Grievance</h3>
            <p>Share your concern with the right team in a few simple steps.</p>
          </article>
          <article class="function-card">
            <span class="function-number">02</span>
            <span class="function-icon">${getIcon('search')}</span>
            <h3>Track Grievance</h3>
            <p>See clear updates and know exactly where things stand.</p>
          </article>
          <article class="function-card">
            <span class="function-number">03</span>
            <span class="function-icon">${getIcon('message-circle')}</span>
            <h3>Communicate</h3>
            <p>Keep the conversation with your officer in one place.</p>
          </article>
          <article class="function-card">
            <span class="function-number">04</span>
            <span class="function-icon">${getIcon('circle-check')}</span>
            <h3>Get Resolution</h3>
            <p>Follow your concern through to a considered resolution.</p>
          </article>
        </div>
      </section>
      <footer class="public-footer">
        ${renderBrandMark()}
        <span>Grievances Portal</span>
        <small>A clear and considered process.</small>
      </footer>
    </main>
  `;
}

export function bindHomeEvents(setView, render) {
  const navBrand = document.getElementById('btn-nav-brand');
  if (navBrand) navBrand.onclick = () => setView('home');

  const navHome = document.getElementById('btn-nav-home');
  if (navHome) navHome.onclick = () => setView('home');

  const navTrack = document.getElementById('btn-nav-track');
  if (navTrack) navTrack.onclick = () => setView('track');

  const navRegister = document.getElementById('btn-nav-register');
  if (navRegister) navRegister.onclick = () => setView('register');
  document.querySelectorAll('.public-register').forEach(el => { el.onclick = () => setView('register'); });

  const navLogin = document.getElementById('btn-nav-login');
  if (navLogin) navLogin.onclick = () => setView('login');
  document.querySelectorAll('.public-login').forEach(el => { el.onclick = () => setView('login'); });

  const heroSubmit = document.getElementById('btn-hero-submit');
  if (heroSubmit) heroSubmit.onclick = () => setView('login');

  const heroTrack = document.getElementById('btn-hero-track');
  if (heroTrack) heroTrack.onclick = () => setView('track');

  // Accessibility
  const a11yTrigger = document.getElementById('btn-a11y-trigger');
  if (a11yTrigger) {
    a11yTrigger.onclick = (e) => {
      e.stopPropagation();
      accessibilityOpen = !accessibilityOpen;
      render();
    };
  }

  const btnDec = document.getElementById('btn-a11y-dec');
  if (btnDec) {
    btnDec.onclick = (e) => {
      e.stopPropagation();
      const SIZES = ['normal', 'large', 'largest'];
      const curIdx = SIZES.indexOf(accessibilitySettings.textSize);
      if (curIdx > 0) {
        setAccessibilityTextSize(SIZES[curIdx - 1]);
        render();
      }
    };
  }

  const btnInc = document.getElementById('btn-a11y-inc');
  if (btnInc) {
    btnInc.onclick = (e) => {
      e.stopPropagation();
      const SIZES = ['normal', 'large', 'largest'];
      const curIdx = SIZES.indexOf(accessibilitySettings.textSize);
      if (curIdx < SIZES.length - 1) {
        setAccessibilityTextSize(SIZES[curIdx + 1]);
        render();
      }
    };
  }

  const btnContrast = document.getElementById('btn-a11y-contrast');
  if (btnContrast) {
    btnContrast.onclick = (e) => {
      e.stopPropagation();
      toggleAccessibilityContrast();
      render();
    };
  }

  const btnSpacing = document.getElementById('btn-a11y-spacing');
  if (btnSpacing) {
    btnSpacing.onclick = (e) => {
      e.stopPropagation();
      toggleAccessibilitySpacing();
      render();
    };
  }

  const btnReset = document.getElementById('btn-a11y-reset');
  if (btnReset) {
    btnReset.onclick = (e) => {
      e.stopPropagation();
      resetAccessibility();
      render();
    };
  }

  if (accessibilityOpen) {
    const handleOutsideClick = (e) => {
      const panel = document.getElementById('accessibility-panel');
      const trigger = document.getElementById('btn-a11y-trigger');
      if (panel && !panel.contains(e.target) && trigger && !trigger.contains(e.target)) {
        accessibilityOpen = false;
        render();
        document.removeEventListener('click', handleOutsideClick);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);
  }
}

