import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { sha256File } from './release-evidence.js';

// No Authorization header, cookie jar, gh subprocess or credential environment.
export async function publicDownload(url, destination, fetcher = fetch) {
  const requested = url;
  let response;
  for (let redirects = 0; redirects <= 8; redirects++) {
    if (new URL(url).protocol !== 'https:') throw Error('Public download requires HTTPS');
    // codeql[js/file-access-to-http] The URL comes from the recorded candidate evidence, the request omits all
    // credentials by design (this verifier must never authenticate), and the response is only trusted after
    // the SHA-256 recorded in the evidence manifest is confirmed for the written file.
    response = await fetcher(url, { redirect: 'manual', credentials: 'omit', headers: { 'User-Agent': 'TileO-source-access-verifier' }, signal: AbortSignal.timeout(120000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      url = new URL(response.headers.get('location'), url).href;
      continue;
    }
    if (response.status !== 200 || /text\/html/i.test(response.headers.get('content-type') ?? '')) throw Error(`Public download rejected HTTP/content type: ${response.status} ${url}`);
    await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(destination, { flags: 'wx' }));
    if (!fs.statSync(destination).size) throw Error('Empty public download');
    return { requested_url: requested, final_url: url, http_status: response.status, bytes: fs.statSync(destination).size, sha256: sha256File(destination) };
  }
  throw Error('Too many public redirects');
}
