/**
 * Loader danych sklepów z registry.jsonl
 * Build time only — nie leci do klienta
 *
 * Lokalnie: czyta z ../index/registry.jsonl
 * CI/GitHub Actions: ściąga z GitHub raw
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

const LOCAL_PATH = resolve(import.meta.dirname, '../../../index/registry.jsonl');
const CACHE_PATH = resolve(import.meta.dirname, '../../.data/registry.jsonl');
const REMOTE_URL = 'https://raw.githubusercontent.com/otwarty-sklep/index/main/registry.jsonl';

let _cache = null;

async function ensureData() {
  if (existsSync(LOCAL_PATH)) return LOCAL_PATH;
  if (existsSync(CACHE_PATH)) return CACHE_PATH;

  console.log(`Fetching registry from ${REMOTE_URL}...`);
  const res = await fetch(REMOTE_URL);
  if (!res.ok) throw new Error(`Failed to fetch registry: ${res.status}`);
  const data = await res.text();
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, data, 'utf-8');
  console.log(`Cached registry at ${CACHE_PATH}`);
  return CACHE_PATH;
}

export async function loadShops() {
  if (_cache) return _cache;
  const path = await ensureData();
  const raw = readFileSync(path, 'utf-8');
  _cache = raw.trim().split('\n').map(line => JSON.parse(line));
  return _cache;
}

export async function getShop(domain) {
  const shops = await loadShops();
  return shops.find(s => s.domain === domain);
}

export async function getStats() {
  const shops = await loadShops();
  const total = shops.length;
  const withSchema = shops.filter(s => s.schema_org).length;
  const withJsonLd = shops.filter(s => s.jsonld_product).length;
  const withFeed = shops.filter(s => s.resources?.feed).length;
  const withSitemap = shops.filter(s => s.resources?.sitemap).length;

  const platforms = {};
  for (const s of shops) {
    const p = s.platform || 'unknown';
    platforms[p] = (platforms[p] || 0) + 1;
  }

  return { total, withSchema, withJsonLd, withFeed, withSitemap, platforms };
}
