// Pure view helpers for feature-attribute popups. No MapLibre/DOM imports so
// unit tests can pin the XSS escaping: tile properties are user data and must
// never reach innerHTML unescaped.
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c => ESCAPES[c] ?? c);
}

function formatPopupValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') {
    try {
      const text = JSON.stringify(value);
      return text.length > 300 ? `${text.slice(0, 300)}…` : text;
    } catch { return '—'; }
  }
  return String(value);
}

export function propertiesHtml(props: Record<string, unknown> | null | undefined, sourceLayer?: string, maxRows = 100): string {
  const entries = Object.entries(props ?? {});
  const title = sourceLayer ? `<div class="popup-title">${escapeHtml(sourceLayer)}</div>` : '';
  if (!entries.length) return `<div class="feature-popup">${title}<div class="popup-empty">No attributes</div></div>`;
  const shown = entries.slice(0, Math.max(1, Math.floor(maxRows)));
  const rows = shown.map(([key, value]) => `<div class="popup-row"><span>${escapeHtml(key)}</span><span>${escapeHtml(formatPopupValue(value))}</span></div>`).join('');
  const more = entries.length > shown.length ? `<div class="popup-empty">+${entries.length - shown.length} more</div>` : '';
  return `<div class="feature-popup">${title}<div class="popup-table">${rows}</div>${more}</div>`;
}
