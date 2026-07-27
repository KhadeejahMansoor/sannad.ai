// src/lib/db.js
//
// One Postgres pool, sized for serverless.
//
// The previous version created `new Pool()` with pg's default max of 10. On
// Vercel every concurrent function instance is its own Node process, so three
// warm instances alone wanted 30 connections. Supabase's session-mode pooler
// hands out 15, and past that every query fails with:
//
//   (EMAXCONNSESSION) max clients reached in session mode
//
// Two changes fix it:
//
//   1. max: 1 — a serverless invocation handles one request at a time, so a
//      pool of one is all it can use. Ten was nine idle connections held open
//      against a hard cap.
//
//   2. The pool is cached on globalThis. Module state is NOT reliably reused
//      between invocations, and in dev every hot reload re-evaluates this file;
//      without the cache each reload leaked another pool that never closed.
//
// ALSO CHANGE YOUR CONNECTION STRING. In Supabase, Project Settings ->
// Database -> Connection string, pick "Transaction pooler" (port 6543) rather
// than session mode (5432), and set that as DATABASE_URL in Vercel. Transaction
// mode returns the connection after each statement instead of holding it for
// the whole session, which is what serverless actually needs. Keep session mode
// only for long-lived processes or anything using LISTEN/NOTIFY.

import { Pool } from 'pg';

const globalForPg = globalThis;

function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },

    max: 1,

    // Hand the connection back quickly — an idle one still counts against the
    // pooler's cap, and a cold function may sit idle for minutes.
    idleTimeoutMillis: 10_000,

    // Fail fast instead of hanging the request for pg's default of forever
    // when the pooler is saturated. The caller gets a real error it can retry.
    connectionTimeoutMillis: 10_000,

    // Don't let one wedged query hold the single connection indefinitely.
    statement_timeout: 30_000,
  });
}

export const pool = globalForPg.__pgPool ?? createPool();

if (!globalForPg.__pgPool) {
  // An idle client erroring out (pooler restart, network blip) emits 'error' on
  // the pool. Unhandled, that's an uncaught exception that kills the process.
  pool.on('error', (err) => {
    console.error('Unexpected error on idle Postgres client:', err);
  });
  globalForPg.__pgPool = pool;
}