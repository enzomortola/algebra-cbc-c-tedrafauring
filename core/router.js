/**
 * core/router.js
 * Module registry and navigation.
 *
 * Each module is an object with the shape:
 *   {
 *     id:       string,     // unique key, e.g. 'vectors'
 *     label:    string,     // display name
 *     icon:     string,     // emoji / symbol
 *     section:  string,     // 'modules' | 'theory' | etc.
 *     template: () => string,  // returns HTML string for the module panel
 *     init:     () => void,    // called once after template is injected
 *   }
 *
 * To add a new module: call router.register(myModule) before router.start().
 */

const registry = new Map();
let currentId = null;

/**
 * Register a module definition.
 * @param {object} mod
 */
export function register(mod) {
  if (!mod.id || !mod.template || !mod.init) {
    console.error('[router] Module missing required fields:', mod);
    return;
  }
  registry.set(mod.id, mod);
}

/**
 * Build the sidebar nav and inject all module containers.
 * Must be called after all modules are registered.
 * @param {string} defaultModuleId - id to activate on start
 */
export function start(defaultModuleId) {
  _buildSidebar();
  _buildModuleContainers();
  _setupSidebarToggle();
  navigate(defaultModuleId || registry.keys().next().value);
}

/**
 * Navigate to a module by id.
 */
export function navigate(id) {
  if (!registry.has(id)) return;

  // Deactivate old
  if (currentId) {
    document.querySelector(`.nav-item[data-module="${currentId}"]`)?.classList.remove('active');
    document.getElementById(`mod-${currentId}`)?.classList.remove('active');
  }

  currentId = id;
  const mod = registry.get(id);

  // Update title
  document.getElementById('pageTitle').textContent = mod.label;

  // Activate nav item
  document.querySelector(`.nav-item[data-module="${id}"]`)?.classList.add('active');

  // Activate panel
  document.getElementById(`mod-${id}`)?.classList.add('active');

  // Init (deferred so DOM is painted)
  setTimeout(() => mod.init(), 30);
}

/* ── PRIVATE ─────────────────────────────── */

function _buildSidebar() {
  const navMenu = document.getElementById('navMenu');
  if (!navMenu) return;

  // Group by section
  const sections = {};
  for (const [, mod] of registry) {
    const sec = mod.section ?? 'módulos';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(mod);
  }

  let html = '';
  for (const [section, mods] of Object.entries(sections)) {
    html += `<div class="nav-section-label">${section.toUpperCase()}</div>`;
    for (const mod of mods) {
      html += `
        <a class="nav-item" data-module="${mod.id}" href="#" title="${mod.label}">
          <span class="nav-icon">${mod.icon}</span>
          <span class="nav-label">${mod.label}</span>
        </a>`;
    }
  }

  navMenu.innerHTML = html;

  // Attach click listeners
  navMenu.querySelectorAll('.nav-item[data-module]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigate(item.dataset.module);
    });
  });
}

function _buildModuleContainers() {
  const container = document.getElementById('moduleContainer');
  if (!container) return;

  container.innerHTML = '';
  for (const [id, mod] of registry) {
    const div = document.createElement('div');
    div.className = 'module';
    div.id = `mod-${id}`;
    div.innerHTML = mod.template();
    container.appendChild(div);
  }
}

function _setupSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const menuBtn   = document.getElementById('menuBtn');

  const toggle = () => {
    sidebar.classList.toggle('collapsed');
    if (toggleBtn) toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '›' : '‹';
  };

  toggleBtn?.addEventListener('click', toggle);
  menuBtn?.addEventListener('click', toggle);
}
