import * as SQLite from 'expo-sqlite';

import type {
  Achievement,
  CountryStat,
  DailyStats,
  Landmark,
  LandmarkCategory,
  Photo,
  TrackingSession,
} from '../types';

/**
 * expo-sqlite (SDK 56) 전담 모듈.
 * useSQLiteContext 훅 방식이 아닌 SQLiteDatabase 직접 접근 방식.
 * 앱의 다른 어떤 파일도 expo-sqlite 를 직접 import 하지 않는다 — 모든 DB 접근은 이 파일을 통한다.
 */

const DB_NAME = 'fogwalk.db';

const db: SQLite.SQLiteDatabase = SQLite.openDatabaseSync(DB_NAME);

const SCHEMA = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS visited_tiles (
  tile_id TEXT PRIMARY KEY,
  first_visited_at INTEGER NOT NULL,
  visit_count INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  distance_m REAL DEFAULT 0,
  points TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  value TEXT,
  unlocked_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY,
  distance_m REAL DEFAULT 0,
  new_tiles INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS landmarks (
  osm_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  discovered_at INTEGER
);

CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_distance_m REAL DEFAULT 0,
  walk_distance_m REAL DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  film INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_explore_date TEXT,
  last_lat REAL,
  last_lng REAL
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  uri TEXT NOT NULL,
  caption TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS country_stats (
  code TEXT PRIMARY KEY,
  name TEXT,
  tiles INTEGER DEFAULT 0,
  first_visited_at INTEGER
);
`;

/** 앱 시작 시 1회 호출. 테이블 생성 + 단일 진행도 행 보장, 생성된 테이블 목록 출력. */
export function initDatabase(): void {
  db.execSync(SCHEMA);
  db.runSync('INSERT OR IGNORE INTO progress (id) VALUES (1)'); // 진행도 단일 행 보장

  const tables = db.getAllSync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  console.log(
    `[db] ${tables.length} tables ready: ${tables.map((t) => t.name).join(', ')}`
  );
}

// ── visited_tiles ──────────────────────────────────────────────

/**
 * 방문 타일들을 한 트랜잭션으로 INSERT OR IGNORE.
 * first_visited_at = Date.now(). 새로 들어간(신규) tileId 배열만 반환.
 */
export function insertVisitedTiles(tileIds: string[]): string[] {
  if (tileIds.length === 0) return [];
  const now = Date.now();
  const fresh: string[] = [];
  db.withTransactionSync(() => {
    for (const tileId of tileIds) {
      const result = db.runSync(
        'INSERT OR IGNORE INTO visited_tiles (tile_id, first_visited_at, visit_count) VALUES (?, ?, 1)',
        tileId,
        now
      );
      if (result.changes > 0) fresh.push(tileId); // 실제 삽입된 것만 신규
    }
  });
  return fresh;
}

export function getAllVisitedTileIds(): string[] {
  const rows = db.getAllSync<{ tile_id: string }>(
    'SELECT tile_id FROM visited_tiles'
  );
  return rows.map((r) => r.tile_id);
}

export function getTileCount(): number {
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM visited_tiles'
  );
  return row?.count ?? 0;
}

// ── progress (단일 행 러닝 합계) ────────────────────────────────

export interface Progress {
  totalDistanceM: number; // 총 이동거리(무가중)
  walkDistanceM: number; // 노력 가중 거리(걷기=1, 차량≈0)
  totalXp: number;
  film: number;
  streak: number;
  lastExploreDate: string | null; // 'YYYY-MM-DD'
  lastLat: number | null; // 거리 누적 연속용
  lastLng: number | null;
}

export function getProgress(): Progress {
  const row = db.getFirstSync<{
    total_distance_m: number;
    walk_distance_m: number;
    total_xp: number;
    film: number;
    streak: number;
    last_explore_date: string | null;
    last_lat: number | null;
    last_lng: number | null;
  }>('SELECT * FROM progress WHERE id = 1');
  return {
    totalDistanceM: row?.total_distance_m ?? 0,
    walkDistanceM: row?.walk_distance_m ?? 0,
    totalXp: row?.total_xp ?? 0,
    film: row?.film ?? 0,
    streak: row?.streak ?? 0,
    lastExploreDate: row?.last_explore_date ?? null,
    lastLat: row?.last_lat ?? null,
    lastLng: row?.last_lng ?? null,
  };
}

export function updateProgress(fields: Partial<Progress>): void {
  const sets: string[] = [];
  const params: SQLite.SQLiteBindValue[] = [];
  const push = (col: string, v: number | string | null | undefined) => {
    if (v !== undefined) {
      sets.push(`${col} = ?`);
      params.push(v);
    }
  };
  push('total_distance_m', fields.totalDistanceM);
  push('walk_distance_m', fields.walkDistanceM);
  push('total_xp', fields.totalXp);
  push('film', fields.film);
  push('streak', fields.streak);
  push('last_explore_date', fields.lastExploreDate);
  push('last_lat', fields.lastLat);
  push('last_lng', fields.lastLng);
  if (sets.length === 0) return;
  db.runSync(`UPDATE progress SET ${sets.join(', ')} WHERE id = 1`, ...params);
}

// ── sessions ───────────────────────────────────────────────────

export function insertSession(session: TrackingSession): void {
  db.runSync(
    'INSERT INTO sessions (id, started_at, ended_at, distance_m, points) VALUES (?, ?, ?, ?, ?)',
    session.id,
    session.startedAt,
    session.endedAt ?? null,
    session.distanceM,
    JSON.stringify(session.points)
  );
}

export function updateSession(
  id: string,
  fields: Partial<Pick<TrackingSession, 'endedAt' | 'distanceM' | 'points'>>
): void {
  const sets: string[] = [];
  const params: SQLite.SQLiteBindValue[] = [];

  if (fields.endedAt !== undefined) {
    sets.push('ended_at = ?');
    params.push(fields.endedAt);
  }
  if (fields.distanceM !== undefined) {
    sets.push('distance_m = ?');
    params.push(fields.distanceM);
  }
  if (fields.points !== undefined) {
    sets.push('points = ?');
    params.push(JSON.stringify(fields.points));
  }
  if (sets.length === 0) return;

  params.push(id);
  db.runSync(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`, ...params);
}

// ── achievements ───────────────────────────────────────────────

export function insertAchievement(achievement: Achievement): void {
  db.runSync(
    'INSERT OR IGNORE INTO achievements (id, type, value, unlocked_at) VALUES (?, ?, ?, ?)',
    achievement.id,
    achievement.type,
    achievement.value,
    achievement.unlockedAt
  );
}

export function getAllAchievements(): Achievement[] {
  const rows = db.getAllSync<{
    id: string;
    type: string;
    value: string | null;
    unlocked_at: number;
  }>('SELECT id, type, value, unlocked_at FROM achievements ORDER BY unlocked_at DESC');

  return rows.map((r) => ({
    id: r.id,
    type: r.type as Achievement['type'],
    value: r.value ?? '',
    unlockedAt: r.unlocked_at,
  }));
}

// ── daily_stats ────────────────────────────────────────────────

/** date 기준 누적. 같은 날짜가 이미 있으면 distance / tiles 를 더한다. */
export function upsertDailyStats(
  date: string,
  distanceM: number,
  newTiles: number
): void {
  db.runSync(
    `INSERT INTO daily_stats (date, distance_m, new_tiles)
     VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       distance_m = distance_m + excluded.distance_m,
       new_tiles = new_tiles + excluded.new_tiles`,
    date,
    distanceM,
    newTiles
  );
}

export function getDailyStatsByDate(date: string): DailyStats | null {
  const row = db.getFirstSync<{
    date: string;
    distance_m: number;
    new_tiles: number;
  }>('SELECT date, distance_m, new_tiles FROM daily_stats WHERE date = ?', date);

  if (!row) return null;
  return {
    date: row.date,
    distanceM: row.distance_m,
    newTiles: row.new_tiles,
  };
}

export function getAllDailyStats(): DailyStats[] {
  const rows = db.getAllSync<{
    date: string;
    distance_m: number;
    new_tiles: number;
  }>('SELECT date, distance_m, new_tiles FROM daily_stats ORDER BY date ASC');
  return rows.map((r) => ({
    date: r.date,
    distanceM: r.distance_m,
    newTiles: r.new_tiles,
  }));
}

// ── landmarks ──────────────────────────────────────────────────

export function upsertLandmark(landmark: Landmark): void {
  db.runSync(
    `INSERT INTO landmarks (osm_id, name, category, lat, lng, discovered_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(osm_id) DO UPDATE SET
       name = excluded.name,
       category = excluded.category,
       lat = excluded.lat,
       lng = excluded.lng`,
    landmark.osmId,
    landmark.name,
    landmark.category,
    landmark.lat,
    landmark.lng,
    landmark.discoveredAt ?? null
  );
}

/**
 * 아직 발견되지 않은(discovered_at IS NULL) 랜드마크 중
 * (lat, lng) 기준 radiusM 반경의 바운딩박스 안에 있는 것들을 반환.
 */
export function getUndiscoveredLandmarksNear(
  lat: number,
  lng: number,
  radiusM: number
): Landmark[] {
  const dLat = radiusM / 111_320;
  const dLng = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180) || 1);

  const rows = db.getAllSync<{
    osm_id: string;
    name: string;
    category: string | null;
    lat: number;
    lng: number;
    discovered_at: number | null;
  }>(
    `SELECT osm_id, name, category, lat, lng, discovered_at
     FROM landmarks
     WHERE discovered_at IS NULL
       AND lat BETWEEN ? AND ?
       AND lng BETWEEN ? AND ?`,
    lat - dLat,
    lat + dLat,
    lng - dLng,
    lng + dLng
  );

  return rows.map((r) => ({
    osmId: r.osm_id,
    name: r.name,
    category: (r.category ?? 'other') as LandmarkCategory,
    lat: r.lat,
    lng: r.lng,
    discoveredAt: r.discovered_at ?? undefined,
  }));
}

export function markLandmarkDiscovered(
  osmId: string,
  discoveredAt: number
): void {
  db.runSync(
    'UPDATE landmarks SET discovered_at = ? WHERE osm_id = ?',
    discoveredAt,
    osmId
  );
}

// ── photos ─────────────────────────────────────────────────────

export function insertPhoto(photo: Photo): void {
  db.runSync(
    'INSERT INTO photos (id, lat, lng, uri, caption, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    photo.id,
    photo.lat,
    photo.lng,
    photo.uri,
    photo.caption ?? null,
    photo.createdAt
  );
}

export function getAllPhotos(): Photo[] {
  const rows = db.getAllSync<{
    id: string;
    lat: number;
    lng: number;
    uri: string;
    caption: string | null;
    created_at: number;
  }>('SELECT id, lat, lng, uri, caption, created_at FROM photos ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    uri: r.uri,
    caption: r.caption ?? undefined,
    createdAt: r.created_at,
  }));
}

// ── settings (키-값) ───────────────────────────────────────────

export function getSetting(key: string): string | null {
  const row = db.getFirstSync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.runSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value
  );
}

// ── country_stats (여권) ───────────────────────────────────────

export function upsertCountryTiles(
  code: string,
  name: string,
  addTiles: number
): void {
  db.runSync(
    `INSERT INTO country_stats (code, name, tiles, first_visited_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(code) DO UPDATE SET tiles = tiles + excluded.tiles, name = excluded.name`,
    code,
    name,
    addTiles,
    Date.now()
  );
}

export function getAllCountryStats(): CountryStat[] {
  const rows = db.getAllSync<{
    code: string;
    name: string | null;
    tiles: number;
    first_visited_at: number | null;
  }>('SELECT code, name, tiles, first_visited_at FROM country_stats ORDER BY tiles DESC');
  return rows.map((r) => ({
    code: r.code,
    name: r.name ?? r.code,
    tiles: r.tiles,
    firstVisitedAt: r.first_visited_at ?? 0,
  }));
}
