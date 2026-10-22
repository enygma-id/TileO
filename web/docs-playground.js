import { iconSvg } from './icons.js';

(() => {
  const p = (name, location, placeholder = '', required = false, options, extra = {}) => ({ name, location, placeholder, required, options, ...extra });
  const job = () => p('id', 'path', 'Job UUID', true);
  const num = (name, location, placeholder, required, min, max) => p(name, location, placeholder, required, undefined, { kind: 'number', min, max });
  const combo = (name, location, placeholder, required, options) => p(name, location, placeholder, required, options, { editable: true });
  const tile = () => [num('z', 'path', 'e.g. 10', true, 0, 22), num('x', 'path', 'e.g. 851', true, 0), num('y', 'path', 'e.g. 526', true, 0)];
  const endpoints = [
    ['System', 'GET', '/healthz', 'API liveness'],
    ['System', 'GET', '/api/status', 'Application and worker status'],
    ['Authentication', 'POST', '/api/session', 'Create a browser session', [], 'json', '{\n  "token": "your-api-token"\n}'],
    ['Authentication', 'POST', '/api/session/logout', 'End the current browser session'],
    ['Storage inputs', 'GET', '/api/storage/connections', 'List configured S3 or MinIO connections'],
    ['Storage inputs', 'POST', '/api/storage/credentials', 'Register your own bucket keys (BYOC, https endpoint)', [], 'json', '{\n  "endpoint": "s3.example.com",\n  "region": "auto",\n  "bucket": "my-bucket",\n  "accessKeyId": "<key>",\n  "secretAccessKey": "<secret>"\n}'],
    ['Storage inputs', 'GET', '/api/storage/credentials', 'List your registered bucket credentials'],
    ['Storage inputs', 'DELETE', '/api/storage/credentials/{id}', 'Revoke registered bucket credentials', [p('id', 'path', 'Credential UUID', true)]],
    ['Storage inputs', 'POST', '/api/storage/inspect', 'Inspect a public or presigned COG URL', [], 'json', '{\n  "url": "<presigned-https-url-to-cog>",\n  "readMode": "auto"\n}'],
    ['Storage inputs', 'DELETE', '/api/storage/inspect/{id}', 'Discard a storage inspection', [p('id', 'path', 'Inspection UUID', true)]],
    ['Storage inputs', 'POST', '/api/jobs/from-source', 'Enqueue from a storage inspection', [], 'json', '{\n  "inspectionId": "inspection-uuid",\n  "options": {"minZoom": 0, "maxZoom": 14}\n}'],
    ['Conversion jobs', 'GET', '/api/jobs', 'List recent jobs'],
    ['Conversion jobs', 'POST', '/api/jobs', 'Enqueue a conversion or use an inspection', [p('filename', 'query', 'Filled from selected file', true), p('inspectionId', 'query', 'Optional inspection UUID'), combo('options', 'query', '{"minZoom":0,"maxZoom":14} — or type custom JSON', false, ['{"minZoom":0,"maxZoom":14}', '{"pipeline":"elevation","rasterPurpose":"elevation","elevationOutput":"cog"}', '{"exportPmtiles":true}'])], 'file'],
    ['Inspect uploads', 'POST', '/api/inspect', 'Upload and inspect a raster or vector dataset', [p('filename', 'query', 'dataset.tif', true)], 'file'],
    ['Inspect uploads', 'DELETE', '/api/inspect/{id}', 'Discard an inspected upload', [p('id', 'path', 'Inspection UUID', true)]],
    ['Conversion jobs', 'GET', '/api/jobs/{id}', 'Get a job', [job()]],
    ['Conversion jobs', 'DELETE', '/api/jobs/{id}', 'Delete a terminal job and its files', [job()]],
    ['Conversion jobs', 'POST', '/api/jobs/{id}/cancel', 'Cancel a queued or running job', [job()]],
    ['Conversion jobs', 'POST', '/api/jobs/{id}/retry', 'Retry a failed or cancelled job', [job()]],
    ['Downloads', 'GET', '/api/jobs/{id}/log', 'Get the process log', [job()]],
    ['Source previews', 'GET', '/api/jobs/{id}/compare', 'Compare source and output metadata', [job()]],
    ['Downloads', 'GET', '/api/jobs/{id}/download', 'Download a completed result', [job(), combo('file', 'query', 'Optional artifact', false, ['cog', 'terrain', 'pmtiles', 'b3dm', 'glb', 'gltf'])]],
    ['Map tiles and services', 'GET', '/api/jobs/{id}/cog', 'Read a completed COG', [job(), combo('Range', 'header', 'bytes=0-16383', false, ['bytes=0-16383', 'bytes=0-65535'])]],
    ['Map tiles and services', 'GET', '/api/jobs/{id}/wmts', 'WMTS capabilities or tile service', [job(), p('SERVICE', 'query', '', true, ['WMTS']), p('VERSION', 'query', '1.0.0'), p('REQUEST', 'query', '', true, ['GetCapabilities', 'GetTile']), p('LAYER', 'query', 'Job UUID for GetTile'), p('STYLE', 'query', 'default'), p('TILEMATRIXSET', 'query', 'WebMercatorQuad'), num('TILEMATRIX', 'query', 'Zoom, e.g. 10', false, 0, 22), num('TILECOL', 'query', 'Column, e.g. 851', false, 0), num('TILEROW', 'query', 'Row, e.g. 526', false, 0), combo('FORMAT', 'query', 'image/png or application/vnd.mapbox-vector-tile', false, ['image/png', 'image/jpeg', 'application/vnd.mapbox-vector-tile'])]],
    ['Map tiles and services', 'GET', '/api/jobs/{id}/tilejson', 'Get terrain TileJSON', [job()]],
    ['Source previews', 'GET', '/api/jobs/{id}/source-preview', 'Preview original imagery or vector data', [job(), p('bbox', 'query', 'west,south,east,north')]],
    ['Source previews', 'GET', '/api/jobs/{id}/source', 'Read the original TIFF or GLB', [job(), combo('Range', 'header', 'bytes=0-16383', false, ['bytes=0-16383', 'bytes=0-65535'])]],
    ['Source previews', 'GET', '/api/jobs/{id}/source-georef', 'Get original TIFF georeferencing', [job()]],
    ['Source previews', 'GET', '/api/jobs/{id}/source-tileset.json', 'Get original GLB comparison tileset', [job()]],
    ['Map tiles and services', 'GET', '/api/jobs/{id}/3d/tileset.json', 'Read a 3D Tiles manifest', [job()]],
    ['Map tiles and services', 'GET', '/api/jobs/{id}/3d/tiles/{file}', 'Read GLB tile content', [job(), p('file', 'path', 'model.glb', true)]],
    ['Map tiles and services', 'GET', '/api/jobs/{id}/tiles/{z}/{x}/{y}', 'Read one XYZ tile', [job(), ...tile()]],
    ['Map tiles and services', 'GET', '/api/basemap/osm/{z}/{x}/{y}.png', 'Proxy an OpenStreetMap basemap tile', tile()],
    ['Quick Open', 'POST', '/api/quick/mbtiles', 'Open an existing MBTiles archive', [p('filename', 'query', 'map.mbtiles')], 'file'],
    ['Quick Open', 'GET', '/api/quick/{id}/tiles/{z}/{x}/{y}', 'Read a Quick Open tile', [p('id', 'path', 'Preview ID', true), ...tile()]],
    ['Quick Open', 'POST', '/api/quick/tiff', 'Open a GeoTIFF for streaming preview', [p('filename', 'query', 'image.tif'), combo('mode', 'query', 'auto', false, ['auto', 'imagery', 'scientific', 'dem', 'dsm', 'dtm'])], 'file'],
    ['Quick Open', 'GET', '/api/quick/{id}/file', 'Stream the original Quick Open TIFF', [p('id', 'path', 'Preview ID', true), combo('Range', 'header', 'bytes=0-65535', false, ['bytes=0-65535', 'bytes=0-16383'])]],
    ['Quick Open', 'DELETE', '/api/quick/{id}', 'Release a Quick Open preview', [p('id', 'path', 'Preview ID', true)]],
  ].map(([group, method, path, summary, parameters = [], body = 'none', example = '']) => ({ group, method, path, summary, parameters, body, example }));

  const byId = id => document.getElementById(id);
  const method = byId('play-method'), path = byId('play-path');
  const token = byId('play-token'), contentType = byId('play-content-type'), body = byId('play-body'), file = byId('play-file');
  const command = byId('curl-command'), response = byId('play-response'), status = byId('play-status'), parameters = byId('play-parameters');
  const sessionStatus = byId('session-status-text'), respPreview = byId('response-preview'), copyResp = byId('copy-response');
  const endpointSearch = byId('endpoint-search'), endpointCount = byId('endpoint-count'), endpointEmpty = byId('endpoint-empty');
  const selectedMethod = byId('selected-method'), selectedPath = byId('selected-path');
  const parameterSection = byId('parameter-section'), payloadSection = byId('payload-section');
  const fileSelection = byId('file-selection'), bodyTools = document.querySelector('.body-tools'), responseMeta = byId('response-meta');
  const runButton = byId('run-request'), cancelButton = byId('cancel-request');
  let selectedIndex = 1;
  let selected = endpoints[selectedIndex];
  let jobs = [], quickIds = [], inspectionIds = [];
  let activeRequest, responseBlobUrl;

  const catalog = byId('endpoint-catalog');
  const groupIcons = {
    'System': 'server',
    'Authentication': 'shield-halved',
    'Storage inputs': 'cloud',
    'Conversion jobs': 'gears',
    'Inspect uploads': 'file-waveform',
    'Downloads': 'download',
    'Source previews': 'eye',
    'Map tiles and services': 'map',
    'Quick Open': 'folder-open',
  };
  for (const group of [...new Set(endpoints.map(endpoint => endpoint.group))]) {
    const section = document.createElement('details'); section.className = 'endpoint-group';
    section.dataset.group = group.toLowerCase();
    section.id = `group-${group.toLowerCase().replace(/\s+/g, '-')}`;
    section.open = ['System', 'Conversion jobs'].includes(group);
    const heading = document.createElement('summary');
    const iconName = groupIcons[group] || 'folder';
    heading.innerHTML = `${iconSvg(iconName, 'icon endpoint-group-icon')} <span>${group} (${endpoints.filter(endpoint => endpoint.group === group).length})</span>`;
    const buttons = document.createElement('div'); buttons.className = 'endpoint-buttons';
    endpoints.forEach((endpoint, index) => {
      if (endpoint.group !== group) return;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'endpoint-button'; button.dataset.endpoint = String(index);
      button.dataset.search = `${endpoint.method} ${endpoint.path} ${endpoint.summary} ${endpoint.group}`.toLowerCase();
      const methodLabel = document.createElement('span'); methodLabel.className = `endpoint-method ${endpoint.method.toLowerCase()}`; methodLabel.textContent = endpoint.method;
      const detail = document.createElement('span'); detail.textContent = endpoint.path; const summary = document.createElement('small'); summary.textContent = endpoint.summary; detail.append(summary);
      button.append(methodLabel, detail); button.addEventListener('click', () => {
        selectedIndex = index; renderEndpoint();
        if (matchMedia('(max-width: 959px)').matches) document.querySelector('.playground-interactive-col').scrollIntoView({ behavior: 'smooth', block: 'start' });
        else document.querySelector('.playground-interactive-col').scrollTo({ top: 0, behavior: 'smooth' });
      }); buttons.append(button);
    });
    section.append(heading, buttons); catalog.append(section);
  }

  function filterEndpoints() {
    const query = endpointSearch.value.trim().toLowerCase();
    let visible = 0;
    for (const group of catalog.querySelectorAll('.endpoint-group')) {
      let groupVisible = 0;
      for (const button of group.querySelectorAll('.endpoint-button')) {
        const matches = !query || button.dataset.search.includes(query);
        button.hidden = !matches;
        if (matches) { visible++; groupVisible++; }
      }
      group.hidden = groupVisible === 0;
      if (query && groupVisible) group.open = true;
    }
    endpointCount.textContent = query ? `${visible} of ${endpoints.length}` : `${endpoints.length} endpoints`;
    endpointEmpty.hidden = visible !== 0;
  }

  const shellQuote = value => `'${String(value).replaceAll("'", "'\\''")}'`;
  function renderEndpoint() {
    selected = endpoints[selectedIndex]; method.value = selected.method; path.value = selected.path;
    selectedMethod.textContent = selected.method;
    selectedMethod.className = `endpoint-method ${selected.method.toLowerCase()}`;
    selectedPath.textContent = selected.path;
    byId('play-summary').textContent = selected.summary; parameters.replaceChildren();
    selected.parameters.forEach(parameter => {
      const label = document.createElement('label'), title = document.createElement('span'); title.textContent = parameter.name;
      if (parameter.required) { const mark = document.createElement('span'); mark.className = 'required-mark'; mark.textContent = ' *'; title.append(mark); }
      const location = document.createElement('small'); location.className = 'parameter-location'; location.textContent = parameter.location;
      const jobId = parameter.name === 'id' && selected.path.startsWith('/api/jobs/');
      const quickId = parameter.name === 'id' && selected.path.startsWith('/api/quick/');
      const inspectionId = parameter.name === 'id' && selected.path.startsWith('/api/inspect/');
      const choices = parameter.options || (jobId ? jobs.map(item => ({ value: item.id, label: `${item.filename} — ${item.status}` })) : quickId ? quickIds.map(id => ({ value: id, label: id })) : inspectionId ? inspectionIds.map(id => ({ value: id, label: id })) : null);
      const hasChoices = choices && choices.length > 0;
      let input;
      if (parameter.kind === 'number') {
        input = document.createElement('input'); input.type = 'number'; input.inputMode = 'numeric';
        if (parameter.min !== undefined) input.min = String(parameter.min);
        if (parameter.max !== undefined) input.max = String(parameter.max);
        if (parameter.required) input.placeholder = parameter.placeholder || `${parameter.min ?? 0}–${parameter.max ?? '…'}`;
      }
      else if (hasChoices && !parameter.editable) {
        input = document.createElement('select');
        choices.forEach(choice => { const value = typeof choice === 'string' ? choice : choice.value, label = typeof choice === 'string' ? choice : choice.label; const option = document.createElement('option'); option.value = value; option.textContent = label || 'Not set'; input.append(option); });
      }
      else {
        input = document.createElement('input');
        if (hasChoices) {
          const listId = `combo-${selectedIndex}-${parameter.name}`;
          let list = document.getElementById(listId);
          if (!list) { list = document.createElement('datalist'); list.id = listId; document.body.append(list); }
          list.replaceChildren();
          choices.forEach(choice => { const value = typeof choice === 'string' ? choice : choice.value; const option = document.createElement('option'); option.value = value; list.append(option); });
          input.setAttribute('list', listId);
        }
      }
      input.dataset.parameter = parameter.name; input.dataset.location = parameter.location; input.dataset.required = String(parameter.required);
      if (parameter.kind === 'number') input.dataset.kind = 'number';
      if (input.tagName !== 'SELECT') { input.placeholder = input.placeholder || parameter.placeholder || (jobId ? 'Enter Job UUID' : 'Enter UUID'); input.autocomplete = 'off'; }
      input.addEventListener('input', updateCommand); input.addEventListener('change', updateCommand); label.append(title, location, input); parameters.append(label);
    });
    parameterSection.hidden = selected.parameters.length === 0;
    for (const button of catalog.querySelectorAll('.endpoint-button')) {
      const active = Number(button.dataset.endpoint) === selectedIndex;
      button.classList.toggle('active', active);
      if (active) {
        button.setAttribute('aria-current', 'true');
        button.closest('.endpoint-group').open = true;
      } else button.removeAttribute('aria-current');
    }
    body.value = selected.example; file.value = '';
    body.parentElement.hidden = selected.body !== 'json';
    bodyTools.hidden = selected.body !== 'json';
    file.parentElement.hidden = selected.body !== 'file';
    payloadSection.hidden = selected.body === 'none';
    contentType.value = selected.body === 'file' ? 'application/octet-stream' : 'application/json';
    fileSelection.textContent = 'Choose a local file to send as the request body.';
    updateCommand();
  }
  function requestParts() {
    let requestPath = path.value.trim(); const headers = {};
    for (const input of parameters.querySelectorAll('[data-parameter]')) {
      const value = input.value.trim();
      if (!value && input.dataset.required === 'true') throw new Error(`Fill required parameter ${input.dataset.parameter}.`);
      if (!value) continue;
      if (input.dataset.kind === 'number') {
        const n = Number(value);
        const min = input.min === '' ? 0 : Number(input.min);
        const max = input.max === '' ? Infinity : Number(input.max);
        if (!Number.isInteger(n) || n < min || n > max) throw new Error(`Parameter ${input.dataset.parameter} must be an integer${Number.isFinite(max) ? ` between ${min} and ${max}` : ` >= ${min}`}.`);
      }
      if (input.dataset.location === 'path') requestPath = requestPath.replace(`{${input.dataset.parameter}}`, encodeURIComponent(value));
      else if (input.dataset.location === 'query') { const url = new URL(requestPath, location.origin); url.searchParams.set(input.dataset.parameter, value); requestPath = `${url.pathname}${url.search}`; }
      else headers[input.dataset.parameter] = value;
    }
    if (!/^\/(?:api(?:\/|$)|healthz(?:\?|$))/.test(requestPath) || requestPath.startsWith('//')) throw new Error('Path must start with /api/ or /healthz.');
    const missing = requestPath.match(/\{[^}]+\}/)?.[0]; if (missing) throw new Error(`Fill required parameter ${missing}.`); return { requestPath, headers };
  }
  function updateCommand() {
    try {
      const { requestPath, headers } = requestParts(), parts = ['curl', '-i', '-X', method.value, shellQuote(`${location.origin}${requestPath}`)];
      if (token.value) headers.Authorization = `Bearer ${token.value}`; for (const [name, value] of Object.entries(headers)) parts.push('-H', shellQuote(`${name}: ${value}`));
      if (method.value !== 'GET' && selected.body !== 'none') { parts.push('-H', shellQuote(`Content-Type: ${contentType.value}`)); if (file.files[0]) parts.push('--data-binary', shellQuote(`@${file.files[0].name}`)); else if (body.value) parts.push('--data-binary', shellQuote(body.value)); }
      command.textContent = parts.join(' ');
    } catch (error) { command.textContent = error.message; }
  }
  for (const shortcut of document.querySelectorAll('[data-endpoint-path]')) shortcut.addEventListener('click', () => { const index = endpoints.findIndex(endpoint => endpoint.path === shortcut.dataset.endpointPath); selectedIndex = index; renderEndpoint(); });
  for (const link of document.querySelectorAll('[data-jump-group]')) {
    link.addEventListener('click', e => {
      e.preventDefault();
      const groupName = link.dataset.jumpGroup;
      const groupEl = byId(`group-${groupName.toLowerCase().replace(/\s+/g, '-')}`);
      if (groupEl) groupEl.open = true;
      const firstIndex = endpoints.findIndex(ep => ep.group === groupName);
      if (firstIndex !== -1) { selectedIndex = firstIndex; renderEndpoint(); }
      byId('play-summary').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  endpointSearch.addEventListener('input', filterEndpoints);
  document.addEventListener('keydown', event => {
    const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (event.key === '/' && !editing) { event.preventDefault(); endpointSearch.focus(); }
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !runButton.disabled) { event.preventDefault(); runButton.click(); }
  });
  for (const control of [method, path, token, contentType, body, file]) control.addEventListener(control === file ? 'change' : 'input', updateCommand);
  method.addEventListener('change', updateCommand); contentType.addEventListener('change', updateCommand);
  file.addEventListener('change', () => {
    const selectedFile = file.files[0];
    const filename = parameters.querySelector('[data-parameter="filename"]');
    if (filename && selectedFile) filename.value = selectedFile.name;
    fileSelection.textContent = selectedFile ? `${selectedFile.name} · ${formatBytes(selectedFile.size)}` : 'Choose a local file to send as the request body.';
    updateCommand();
  });
  byId('reset-request').addEventListener('click', renderEndpoint);
  byId('format-json').addEventListener('click', () => {
    try {
      body.value = JSON.stringify(JSON.parse(body.value || '{}'), null, 2);
      status.className = 'status-badge status-ok'; status.textContent = 'JSON formatted.'; updateCommand();
    } catch (error) {
      status.className = 'status-badge status-err'; status.textContent = error instanceof Error ? `Invalid JSON: ${error.message}` : 'Invalid JSON.';
      body.focus();
    }
  });
  async function loadJobs() {
    const headers = token.value ? { Authorization: `Bearer ${token.value}` } : {};
    try {
      const result = await fetch('/api/jobs', { headers, credentials: 'same-origin' });
      jobs = result.ok ? await result.json() : [];
      if (sessionStatus) sessionStatus.textContent = result.ok ? (jobs.length ? `${jobs.length} recent job(s) available in dropdowns.` : 'Authenticated. No conversion jobs yet.') : 'No active workspace session. Use token override if protected.';
      renderEndpoint();
    }
    catch {
      jobs = [];
      if (sessionStatus) sessionStatus.textContent = 'Could not reach server to load jobs.';
      renderEndpoint();
    }
  }
  byId('reload-jobs').addEventListener('click', loadJobs);
  async function copyText(text, what) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
        document.body.append(area); area.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        area.remove();
        if (!ok) throw new Error('copy command failed');
      }
      status.className = 'status-badge status-ok'; status.textContent = `${what} copied.`;
    } catch {
      status.className = 'status-badge status-err'; status.textContent = `Copy failed — select the text manually (Ctrl+C).`;
    }
  }
  byId('copy-curl').addEventListener('click', () => void copyText(command.textContent, 'Command'));
  if (copyResp) copyResp.addEventListener('click', () => void copyText(response.textContent, 'Response'));
  cancelButton.addEventListener('click', () => activeRequest?.abort());
  runButton.addEventListener('click', async () => {
    const button = runButton;
    if (respPreview) { respPreview.replaceChildren(); respPreview.hidden = true; }
    if (responseBlobUrl) { URL.revokeObjectURL(responseBlobUrl); responseBlobUrl = undefined; }
    try {
      const { requestPath, headers } = requestParts(); if (token.value) headers.Authorization = `Bearer ${token.value}`;
      if (selected.body === 'json' && body.value.trim()) {
        try { JSON.parse(body.value); } catch (error) { throw new Error(`Request body is not valid JSON: ${error.message}`); }
      }
      if (method.value === 'DELETE' && !window.confirm(`Send DELETE ${requestPath}? This action may remove stored data.`)) return;
      activeRequest = new AbortController();
      const options = { method: method.value, headers, credentials: 'same-origin', signal: activeRequest.signal };
      if (method.value !== 'GET' && selected.body !== 'none') { headers['Content-Type'] = contentType.value; options.body = file.files[0] || body.value || undefined; }
      button.disabled = true; button.innerHTML = `${iconSvg('spinner', 'icon icon-spin')} Sending…`; cancelButton.hidden = false;
      status.className = 'status-badge'; status.textContent = 'Request in progress…'; response.textContent = ''; responseMeta.textContent = `${method.value} ${requestPath}`;
      const started = performance.now(), result = await fetch(requestPath, options), type = result.headers.get('content-type') || '';
      let responseBytes = 0;
      if (result.status === 204) {
        response.textContent = '(empty response — nothing stored at this address; check the zoom range and bounds)';
      }
      else if (/json|text|xml|yaml/.test(type)) {
        const text = await result.text();
        responseBytes = new TextEncoder().encode(text).byteLength;
        try {
          const data = JSON.parse(text);
          response.textContent = JSON.stringify(data, null, 2);
          if (data.id && selected.path.startsWith('/api/quick/')) quickIds = [...new Set([data.id, ...quickIds])];
          if (data.inspectionId) inspectionIds = [...new Set([data.inspectionId, ...inspectionIds])];
        } catch { response.textContent = text || '(empty response)'; }
      }
      else {
        const blob = await result.blob();
        responseBytes = blob.size;
        const blobUrl = URL.createObjectURL(blob); responseBlobUrl = blobUrl;
        if (respPreview) {
          respPreview.hidden = false;
          if (type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = blobUrl;
            img.className = 'tile-preview-img';
            img.alt = 'Tile Preview';
            respPreview.append(img);
          }
          const dl = document.createElement('a');
          dl.href = blobUrl;
          dl.className = 'download-link';
          dl.download = `response-${Date.now()}.${type.split('/')[1]?.split(';')[0] || 'bin'}`;
          dl.innerHTML = `${iconSvg('download')} Download response (${blob.size.toLocaleString()} bytes)`;
          respPreview.append(dl);
        }
        response.textContent = `Binary response: ${type || 'application/octet-stream'}\nSize: ${blob.size.toLocaleString()} bytes`;
      }
      const elapsed = Math.round(performance.now() - started);
      status.className = `status-badge ${result.ok ? 'status-ok' : 'status-err'}`;
      status.textContent = `${result.status} ${result.statusText} · ${elapsed} ms`;
      responseMeta.textContent = [type.split(';')[0] || 'no content type', responseBytes ? formatBytes(responseBytes) : 'empty', `${elapsed} ms`].join(' · ');
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError';
      response.textContent = cancelled ? 'Request cancelled by user.' : error instanceof Error ? error.message : String(error);
      responseMeta.textContent = cancelled ? 'Cancelled' : 'Request did not complete';
      status.className = `status-badge ${cancelled ? '' : 'status-err'}`;
      status.textContent = cancelled ? 'Cancelled.' : 'Request failed.';
    } finally {
      activeRequest = undefined; button.disabled = false; cancelButton.hidden = true;
      button.innerHTML = `${iconSvg('play')} Run request <kbd>Ctrl/⌘ ↵</kbd>`;
    }
  });
  function formatBytes(value) {
    if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GiB`;
    if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MiB`;
    if (value >= 1024) return `${(value / 1024).toFixed(1)} KiB`;
    return `${value} B`;
  }
  renderEndpoint(); filterEndpoints(); void loadJobs();
})();
