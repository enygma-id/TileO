import { lookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';
import { BlockList, isIP, type LookupFunction } from 'node:net';
import { Readable } from 'node:stream';
import { JobError } from './types.js';

const reserved = new BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
  ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) reserved.addSubnet(address, prefix, 'ipv4');
reserved.addSubnet('2001:db8::', 32, 'ipv6');

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !reserved.check(address, 'ipv4');
  // Only global unicast IPv6; this also rejects IPv4-mapped private addresses.
  return family === 6 && (parseInt(address.split(':')[0]!, 16) & 0xe000) === 0x2000 && !reserved.check(address, 'ipv6');
}

export function guardedLookup(allowPrivate: boolean, resolver: typeof lookup = lookup): LookupFunction {
  return (hostname, options, callback) => {
    void resolver(hostname, { all: true }).then(addresses => {
      if (!addresses.length || (!allowPrivate && addresses.some(item => !isPublicAddress(item.address)))) {
        callback(new JobError('STORAGE_HOST_DENIED', 'Private or reserved remote addresses are not allowed.'), '', 4);
        return;
      }
      // These exact addresses are passed to the socket: no second DNS lookup.
      if (options.all) callback(null, addresses);
      else callback(null, addresses[0]!.address, addresses[0]!.family);
    }, error => callback(new JobError('STORAGE_HOST_UNAVAILABLE', 'The remote storage hostname could not be resolved.'), '', 4));
  };
}

export type RemoteTransport = (url: URL, options: { headers: Record<string, string>; signal?: AbortSignal }) => Promise<Response>;

export function requestRemote(url: URL, trustedHosts: string[], allowPrivate: boolean,
  options: { headers: Record<string, string>; signal?: AbortSignal }): Promise<Response> {
  // Select the destination from administrator configuration, never from request data.
  const hostname = trustedHosts.find(host => host === url.hostname.toLowerCase());
  if (!hostname) throw new JobError('STORAGE_HOST_DENIED', 'Remote URL host is not allowlisted.');
  const host = hostname.replace(/^\[|\]$/g, '');
  if (isIP(host) && !allowPrivate && !isPublicAddress(host)) throw new JobError('STORAGE_HOST_DENIED', 'Private or reserved remote addresses are not allowed.');
  if (url.protocol !== 'https:' && !(allowPrivate && url.protocol === 'http:')) throw new JobError('INSECURE_STORAGE_URL', 'Remote URLs require HTTPS.');
  const transport = url.protocol === 'https:' ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const request = transport({
      hostname: host, port: url.port || undefined, path: url.pathname + url.search,
      method: 'GET', agent: false, lookup: guardedLookup(allowPrivate),
      headers: { ...options.headers, 'accept-encoding': 'identity' },
      signal: options.signal ?? AbortSignal.timeout(60_000),
    }, response => {
      if ((response.statusCode ?? 0) >= 300 && (response.statusCode ?? 0) < 400) {
        response.destroy(); reject(new JobError('STORAGE_HOST_DENIED', 'Remote redirects are not allowed.')); return;
      }
      const headers = new Headers();
      for (let i = 0; i < response.rawHeaders.length; i += 2) headers.append(response.rawHeaders[i]!, response.rawHeaders[i + 1]!);
      const body = response.statusCode === 204 ? null : Readable.toWeb(response) as ReadableStream<Uint8Array>;
      resolve(new Response(body, { status: response.statusCode, headers }));
    });
    request.on('error', reject);
    request.end();
  });
}
