/**
 * Minimal in-memory stand-in for the Supabase/PostgREST query builder, covering the
 * subset used by src/lib/db.ts. Tables are plain arrays so tests can seed and inspect them.
 */
import { randomUUID } from 'crypto';

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Result = { data: any; error: { code?: string; message: string } | null; count?: number | null }; // eslint-disable-line @typescript-eslint/no-explicit-any

const UNIQUE_COLUMNS: Record<string, string[]> = {
  telegram_updates: ['update_id'],
  products: ['slug'],
  categories: ['slug'],
};

const TIMESTAMP_DEFAULTS: Record<string, string[]> = {
  affiliate_clicks: ['timestamp'],
  website_settings: ['updated_at'],
  telegram_imports: ['created_at', 'updated_at'],
  telegram_updates: ['created_at'],
  products: ['created_at', 'updated_at'],
};

export interface FakeSupabase {
  tables: Record<string, Row[]>;
  /** Make every query against `table` fail with this message. */
  failTables: Set<string>;
  client: { from: (table: string) => Query };
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

class Query implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'delete' | null = null;
  private returning = false;
  private columns = '*';
  private countMode: string | undefined;
  private head = false;
  private filters: ((r: Row) => boolean)[] = [];
  private orders: { column: string; ascending: boolean }[] = [];
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private limitN: number | null = null;
  private singleMode: 'single' | 'maybe' | null = null;
  private payload: Row[] = [];
  private patch: Row = {};

  constructor(private fake: FakeSupabase, private table: string) {}

  select(columns = '*', opts?: { count?: string; head?: boolean }) {
    if (this.op === null) this.op = 'select';
    else this.returning = true;
    this.columns = columns;
    this.countMode = opts?.count;
    this.head = !!opts?.head;
    return this;
  }
  insert(p: Row | Row[]) { this.op = 'insert'; this.payload = Array.isArray(p) ? p : [p]; return this; }
  update(p: Row) { this.op = 'update'; this.patch = p; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(c: string, v: unknown) { this.filters.push(r => r[c] === v); return this; }
  in(c: string, vs: unknown[]) { this.filters.push(r => vs.includes(r[c])); return this; }
  ilike(c: string, pattern: string) {
    const re = new RegExp('^' + pattern.split('%').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$', 'i');
    this.filters.push(r => typeof r[c] === 'string' && re.test(r[c]));
    return this;
  }
  order(column: string, opts?: { ascending?: boolean }) { this.orders.push({ column, ascending: opts?.ascending ?? true }); return this; }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) { this.rangeFrom = from; this.rangeTo = to; return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybe'; return this; }

  then<A = Result, B = never>(onOk?: ((v: Result) => A | PromiseLike<A>) | null, onErr?: ((e: unknown) => B | PromiseLike<B>) | null) {
    return Promise.resolve().then(() => this.exec()).then(onOk, onErr);
  }

  private rows(): Row[] {
    return (this.fake.tables[this.table] ??= []);
  }

  private project(row: Row): Row {
    const embeds = Array.from(this.columns.matchAll(/(\w+):(\w+)\(\*\)/g));
    const plain = this.columns.replace(/(\w+):(\w+)\(\*\)/g, '').split(',').map(s => s.trim()).filter(Boolean);
    const out: Row = plain.includes('*') || plain.length === 0 ? { ...row } : Object.fromEntries(plain.map(c => [c, row[c]]));
    for (const [, alias, foreign] of embeds) {
      const fk = row[`${alias}_id`];
      out[alias] = (this.fake.tables[foreign] ?? []).find(r => r.id === fk) ?? null;
    }
    return out;
  }

  private exec(): Result {
    if (this.fake.failTables.has(this.table)) {
      return { data: null, error: { code: 'XX000', message: `simulated failure on ${this.table}` } };
    }
    const table = this.rows();
    let result: Row[] = [];

    if (this.op === 'insert') {
      for (const input of this.payload) {
        for (const col of UNIQUE_COLUMNS[this.table] ?? []) {
          if (input[col] !== undefined && table.some(r => r[col] === input[col])) {
            return { data: null, error: { code: '23505', message: `duplicate key value violates unique constraint "${this.table}_${col}_key"` } };
          }
        }
      }
      for (const input of this.payload) {
        const row: Row = { id: randomUUID(), ...clone(input) };
        for (const col of TIMESTAMP_DEFAULTS[this.table] ?? []) row[col] ??= new Date().toISOString();
        table.push(row);
        result.push(row);
      }
    } else {
      const matched = table.filter(r => this.filters.every(f => f(r)));
      if (this.op === 'update') {
        matched.forEach(r => Object.assign(r, clone(this.patch)));
        result = matched;
      } else if (this.op === 'delete') {
        this.fake.tables[this.table] = table.filter(r => !matched.includes(r));
        result = matched;
      } else {
        result = [...matched];
        for (const { column, ascending } of [...this.orders].reverse()) {
          result.sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) * (ascending ? 1 : -1));
        }
      }
    }

    const count = this.countMode === 'exact' ? result.length : null;
    if (this.op === 'select') {
      if (this.rangeFrom !== null) result = result.slice(this.rangeFrom, (this.rangeTo ?? result.length) + 1);
      if (this.limitN !== null) result = result.slice(0, this.limitN);
    }

    if (this.op !== 'select' && !this.returning) return { data: null, error: null, count };
    if (this.head) return { data: null, error: null, count };

    const data = clone(result.map(r => this.project(r)));
    if (this.singleMode) {
      if (data.length > 1 || (data.length === 0 && this.singleMode === 'single')) {
        return { data: null, error: { code: 'PGRST116', message: `expected one row, got ${data.length}` } };
      }
      return { data: data[0] ?? null, error: null, count };
    }
    return { data, error: null, count };
  }
}

export function createFakeSupabase(seed: Record<string, Row[]> = {}): FakeSupabase {
  const fake: FakeSupabase = {
    tables: Object.fromEntries(Object.entries(seed).map(([k, rows]) => [k, clone(rows)])),
    failTables: new Set(),
    client: { from: (table: string) => new Query(fake, table) },
  };
  return fake;
}
