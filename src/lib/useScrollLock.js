// src/lib/useScrollLock.js
//
// Body-scroll locking, done once, correctly.
//
// ── Why this exists ───────────────────────────────────────────────────
//
// Three components were each writing `document.body.style.overflow` by hand:
// DetailView, MenuModal, and the HashModal inside it. They shared one global
// with no coordination, and two of them got it wrong:
//
//   HashModal:
//       if (isOpen) body.style.overflow = 'hidden';
//       return () => { if (!isOpen) body.style.overflow = ''; };
//
//   A cleanup closes over the OLD render's values. When isOpen goes true→false,
//   React runs the cleanup from the render where isOpen was still true — so
//   `!isOpen` is false and it never unlocks. The lock was set on open and
//   released on never. That's what left the results page frozen at 947px with
//   75,554px of content underneath it.
//
//   MenuModal:
//       return () => { if (!isHashModalOpen) body.style.overflow = ''; };
//
//   Skips the unlock whenever the hash modal happens to be open at teardown.
//   Open the menu, open the hash modal, close both — locked forever.
//
// Even with both fixed, the deeper problem stays: if two overlays are open and
// one closes, an unconditional unlock frees the page while the other is still
// up. Whoever closes last wins, and the lock leaks again.
//
// ── The fix ───────────────────────────────────────────────────────────
//
// Count the holders. Lock when the count goes 0 → 1, unlock when it returns to
// 0, and restore whatever `overflow` was there before rather than assuming ''.
// Any number of overlays can now open and close in any order.
//
// The counter is module-level on purpose. It's a single global resource
// (`document.body`), so exactly one thing should be tracking it.

import { useEffect } from 'react';

let holders = 0;
let previousOverflow = '';

/**
 * Lock body scroll for as long as this component is mounted and `active`.
 *
 *   useScrollLock(isOpen);         // locks while open
 *   useScrollLock(!asPage);        // locks only in modal mode
 *
 * Releases on unmount even if the component disappears unexpectedly — which is
 * the other way these locks get stranded.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;

    if (holders === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    holders += 1;

    return () => {
      holders -= 1;
      if (holders === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [active]);
}

/**
 * Escape hatch. Force-releases the lock regardless of the count.
 *
 * Only for recovering from a lock that's already stranded — for instance from
 * an older component that hasn't been migrated to this hook yet. If you find
 * yourself calling this in normal operation, something is still bypassing the
 * counter.
 */
export function forceReleaseScrollLock() {
  holders = 0;
  document.body.style.overflow = '';
}