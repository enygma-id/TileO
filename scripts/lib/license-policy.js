/**
 * TileO license policy shared by the release gate, notice generator,
 * image auditor, and evidence verifiers. Keep this module dependency-free
 * so it can run in CI before `npm ci` completes.
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

/** Public-domain declarations are not SPDX identifiers; keep them explicit. */
export const PUBLIC_DOMAIN = new Set(['Public-Domain', 'public-domain', 'PD']);

/**
 * Approved exceptions scoped to exact component IDs.
 * Global wildcards are strictly prohibited.
 */
export const APPROVED_EXCEPTIONS = new Map([
  [
    'libstdc++',
    {
      license: 'GPL-3.0-only WITH GCC-exception-3.1',
      description: 'GCC Runtime Library Exception 3.1',
      spdxMatch: (id) => id === 'GPL-3.0-only WITH GCC-exception-3.1',
    },
  ],
  [
    'libgcc',
    {
      license: 'GPL-3.0-only WITH GCC-exception-3.1',
      description: 'GCC Runtime Library Exception 3.1',
      spdxMatch: (id) => id === 'GPL-3.0-only WITH GCC-exception-3.1',
    },
  ],
  [
    'ca-certificates',
    {
      license: 'MPL-2.0 AND MIT',
      description: 'Mozilla CA certificate trust bundle',
      spdxMatch: (id) => id === 'MPL-2.0' || id === 'MPL-2.0 AND MIT',
    },
  ],
]);

/**
 * Backward compatibility map for exception descriptions.
 */
export const EXCEPTIONS = new Map([
  ['GPL-3.0-only WITH GCC-exception-3.1', 'GCC Runtime Library Exception 3.1'],
  ['MPL-2.0', 'Data-scope license (certificate trust bundle)'],
  ['MPL-2.0 AND MIT', 'Mozilla CA certificate trust bundle (MPL-2.0 AND MIT)'],
]);

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
 * Evaluate an SPDX-like expression.
 * Returns:
 * - allowed: boolean
 * - isPermissive: boolean (strictly permissive; NEVER true for exceptions or copyleft)
 * - status: 'permissive' | 'approved_exception' | 'exception_pending_review' | 'prohibited' | 'unknown'
 * - exceptions: Array of exception identifiers encountered
 */
export function evaluateExpression(expression, componentId = null) {
  const trimmed = (expression || 'UNKNOWN').trim();
  const tokens = tokenize(trimmed);
  let index = 0;
  const exceptions = new Set();
  let containsNonPermissive = false;
  let hasPendingReview = false;

  const approvedConfig = componentId ? APPROVED_EXCEPTIONS.get(componentId) : null;

  function primary() {
    const token = tokens[index++];
    if (token === '(') {
      const value = orExpression();
      if (tokens[index++] !== ')') throw new Error(`Unclosed parenthesis in: ${trimmed}`);
      return value;
    }
    if (!token) throw new Error(`Unexpected end of license expression: ${trimmed}`);
    if (token === 'AND' || token === 'OR' || token === 'WITH') {
      throw new Error(`Unexpected operator ${token} in: ${trimmed}`);
    }

    // WITH binds tighter than AND/OR.
    if (tokens[index] === 'WITH') {
      index += 1;
      const exception = tokens[index++];
      const identifier = `${token} WITH ${exception}`;
      containsNonPermissive = true;
      exceptions.add(identifier);

      // Check if this component has an approved scoped exception
      if (approvedConfig && approvedConfig.spdxMatch(identifier)) {
        return true;
      }
      return false;
    }

    if (PERMISSIVE_LICENSES.has(token) || PUBLIC_DOMAIN.has(token)) {
      return true;
    }

    // Non-permissive token
    containsNonPermissive = true;
    exceptions.add(token);

    if (approvedConfig && approvedConfig.spdxMatch(token)) {
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
  if (index !== tokens.length) throw new Error(`Trailing tokens in: ${trimmed}`);

  const isPermissive = !containsNonPermissive && allowed;
  let status = 'unknown';

  if (isPermissive) {
    status = 'permissive';
  } else if (allowed && approvedConfig) {
    status = 'approved_exception';
  } else if (exceptions.size > 0 && !allowed) {
    status = 'prohibited';
  } else {
    status = 'unknown';
  }

  return {
    allowed,
    isPermissive,
    status,
    exceptions: [...exceptions],
  };
}

/** Evaluate an npm package, applying an explicit election when recorded. */
export function evaluatePackage(name, expression) {
  const election = ELECTIONS.get(name);
  if (election) {
    return {
      allowed: true,
      isPermissive: true,
      status: 'permissive',
      elected: election.license,
      offered: election.offered,
      exceptions: [],
    };
  }
  return evaluateExpression(expression || 'UNKNOWN', name);
}

/** Strictly permissive check: returns true ONLY for permissive licenses. Never for exceptions. */
export function isPermissiveExpression(expression) {
  return evaluateExpression(expression).isPermissive;
}
