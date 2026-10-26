/**
 * TileO license policy shared by the release gate, notice generator and
 * evidence verifiers. Keep this module dependency-free so it can run in CI
 * before `npm ci` completes.
 */

export const PERMISSIVE_LICENSES = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSL-1.0',
  'CC0-1.0',
  'curl',
  'IJG',
  'ISC',
  'libpng-2.0',
  'libtiff',
  'MIT',
  'Python-2.0',
  'Unicode-3.0',
  'Unlicense',
  'X11',
  'Zlib',
]);

/** Licenses accepted only for a documented, reviewed exception. */
export const EXCEPTIONS = new Map([
  ['GPL-3.0-only WITH GCC-exception-3.1', 'GCC Runtime Library Exception 3.1'],
  ['MPL-2.0', 'Data-scope license (certificate trust bundle)'],
]);

/** Public-domain declarations are not SPDX identifiers; keep them explicit. */
export const PUBLIC_DOMAIN = new Set(['Public-Domain', 'public-domain', 'PD']);

export const ELECTIONS = new Map([
  ['jszip', { license: 'MIT', offered: 'MIT OR GPL-3.0-or-later' }],
  ['expand-template', { license: 'MIT', offered: 'MIT OR WTFPL' }],
  ['rc', { license: 'BSD-2-Clause', offered: 'BSD-2-Clause OR MIT OR Apache-2.0' }],
  ['@maplibre/mlt', { license: 'MIT', offered: 'MIT OR Apache-2.0' }],
]);

const TOKEN = /\s*(\(|\)|\bAND\b|\bOR\b|\bWITH\b|[A-Za-z0-9.+-]+)\s*/y;

function tokenize(expression) {
  const tokens = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < expression.length) {
    const match = TOKEN.exec(expression);
    if (!match) throw new Error(`Invalid license expression near: ${expression.slice(TOKEN.lastIndex)}`);
    tokens.push(match[1]);
  }
  return tokens;
}

/**
 * Evaluate an SPDX-like expression. `allowed` means every required branch is
 * permissive (or an explicitly reviewed exception). `exceptions` lists the
 * exception identifiers encountered so callers can require human review.
 */
export function evaluateExpression(expression) {
  const tokens = tokenize(expression.trim());
  let index = 0;
  const exceptions = new Set();

  function primary() {
    const token = tokens[index++];
    if (token === '(') {
      const value = orExpression();
      if (tokens[index++] !== ')') throw new Error(`Unclosed parenthesis in: ${expression}`);
      return value;
    }
    if (!token) throw new Error(`Unexpected end of license expression: ${expression}`);
    if (token === 'AND' || token === 'OR' || token === 'WITH') {
      throw new Error(`Unexpected operator ${token} in: ${expression}`);
    }
    // WITH binds tighter than AND/OR.
    if (tokens[index] === 'WITH') {
      index += 1;
      const exception = tokens[index++];
      const identifier = `${token} WITH ${exception}`;
      if (EXCEPTIONS.has(identifier)) {
        exceptions.add(identifier);
        return true;
      }
      exceptions.add(identifier);
      return false;
    }
    if (PERMISSIVE_LICENSES.has(token) || PUBLIC_DOMAIN.has(token)) return true;
    if (EXCEPTIONS.has(token)) {
      exceptions.add(token);
      return true;
    }
    return false;
  }

  function andExpression() {
    let value = primary();
    while (tokens[index] === 'AND') {
      index += 1;
      const right = primary();
      value = value && right;
    }
    return value;
  }

  function orExpression() {
    let value = andExpression();
    while (tokens[index] === 'OR') {
      index += 1;
      const right = andExpression();
      value = value || right;
    }
    return value;
  }

  const allowed = orExpression();
  if (index !== tokens.length) throw new Error(`Trailing tokens in: ${expression}`);
  return { allowed, exceptions: [...exceptions] };
}

/** Evaluate an npm package, applying an explicit election when recorded. */
export function evaluatePackage(name, expression) {
  const election = ELECTIONS.get(name);
  if (election) {
    return { allowed: true, elected: election.license, offered: election.offered, exceptions: [] };
  }
  return evaluateExpression(expression || 'UNKNOWN');
}

export function isPermissiveExpression(expression) {
  return evaluateExpression(expression).allowed;
}
