export class ValidationPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(validation) {
    if (!validation) {
      this.container.innerHTML = '<div class="placeholder"><p>No validation data</p></div>';
      return;
    }

    const overall = validation.overall || {};
    const categories = [
      { key: 'orbital', title: 'Orbital Mechanics', icon: 'orbit' },
      { key: 'thermal', title: 'Thermal Control', icon: 'radiator' },
      { key: 'power', title: 'Power Budget', icon: 'solar' },
      { key: 'comms', title: 'Communications', icon: 'antenna' },
      { key: 'structural', title: 'Structural', icon: 'cube' }
    ];

    this.container.innerHTML = `
      <div class="validation-overall">
        <div class="validation-score">
          <div class="score-circle" style="--score: ${overall.score || 0}">
            <span>${overall.score || 0}</span>
          </div>
          <div class="score-info">
            <h4>${overall.summary || 'Design Assessment'}</h4>
            <span class="status ${overall.status || 'unknown'}">${(overall.status || 'unknown').toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div class="validation-categories">
        ${categories.map(cat => {
          const catData = validation[cat.key] || {};
          const score = catData.score || 0;
          const status = catData.status || 'unknown';
          const warnings = catData.warnings || [];
          return `
            <div class="val-category">
              <div class="val-category-header" data-category="${cat.key}">
                <div class="val-category-title">
                  <span class="val-icon">${this.getIcon(cat.icon)}</span>
                  <span>${cat.title}</span>
                </div>
                <div class="val-category-score">
                  <div class="mini-score" style="--score: ${score}">${score}</div>
                  <span class="status ${status}">${status.toUpperCase()}</span>
                </div>
                <span class="val-toggle">${this.getIcon('chevron')}</span>
              </div>
              <div class="val-category-body">
                ${this.formatCategoryDetails(cat.key, catData)}
                ${warnings.length > 0 ? `
                  <div class="val-warnings">
                    <h6>Warnings</h6>
                    <ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${validation.recommendations?.length ? `
        <div class="val-recommendations">
          <h5>Recommendations</h5>
          <ul>${validation.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
      ` : ''}
    `;

    this.container.querySelectorAll('.val-category-header').forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling;
        const toggle = header.querySelector('.val-toggle');
        body.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
      });
    });
  }

  formatCategoryDetails(key, data) {
    const items = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === 'status' || k === 'score' || k === 'warnings') continue;
      if (v === null || v === undefined) continue;
      if (typeof v === 'object') continue;
      items.push(`<div class="val-item"><span class="val-key">${this.formatKey(k)}</span><span class="val-value">${this.formatValue(k, v)}</span></div>`);
    }
    return items.join('');
  }

  formatKey(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formatValue(key, value) {
    if (typeof value === 'number') {
      if (key.endsWith('_c') || key.endsWith('_temp')) return `${value.toFixed(1)}°C`;
      if (key.endsWith('_w') || key.endsWith('_power')) return `${value.toFixed(1)} W`;
      if (key.endsWith('_db')) return `${value.toFixed(1)} dB`;
      if (key.endsWith('_km')) return `${value.toFixed(1)} km`;
      if (key.endsWith('_ms')) return `${value.toFixed(1)} m/s`;
      if (key.endsWith('_m2') || key.endsWith('_area')) return `${value.toFixed(2)} m²`;
      if (key.endsWith('_ghz')) return `${value.toFixed(1)} GHz`;
      if (key.endsWith('_dbi')) return `${value.toFixed(1)} dBi`;
      if (key.endsWith('_mbps') || key.endsWith('_mb')) return `${value.toFixed(1)} Mbps`;
      if (key.endsWith('_percent') || key.endsWith('_margin')) return `${value.toFixed(1)}%`;
      if (key.endsWith('_hz')) return `${value.toFixed(1)} Hz`;
      if (key.endsWith('_mpa')) return `${value.toFixed(1)} MPa`;
      if (key.endsWith('_deg')) return `${value.toFixed(1)}°`;
      if (key.endsWith('_min')) return `${value.toFixed(1)} min`;
      if (key.endsWith('_years')) return `${value.toFixed(1)} years`;
      return value.toFixed(2);
    }
    return String(value);
  }

  getIcon(type) {
    const icons = {
      orbit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>',
      radiator: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 12h8M8 16h8"/></svg>',
      solar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
      antenna: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M12 2l8 8M12 2l-8 8"/></svg>',
      cube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
      chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
      info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };
    return icons[type] || icons.info;
  }
}