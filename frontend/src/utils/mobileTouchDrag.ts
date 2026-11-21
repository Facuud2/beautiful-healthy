/**
 * Ultra-smooth mobile-like drag-to-scroll with kinetic momentum & 240Hz RAF synchronization.
 * Frame-rate independent physics (supports 60Hz, 120Hz, 144Hz, 240Hz+ monitors).
 */

interface VelocityPoint {
  x: number;
  y: number;
  time: number;
}

export function initMobileTouchDrag(targetDoc: Document = document, targetWin: Window = window) {
  if (!targetDoc || (targetDoc as any).__mobileTouchDragInit) return;
  (targetDoc as any).__mobileTouchDragInit = true;

  let isDown = false;
  let hasDragged = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;

  // Subpixel scroll coordinates for 240Hz smoothness
  let currentScrollTop = 0;
  let currentScrollLeft = 0;
  let targetContainer: HTMLElement | Window | null = null;

  // Velocity tracking buffer for momentum
  const velocityHistory: VelocityPoint[] = [];
  let momentumRafId: number | null = null;
  let dragRafId: number | null = null;
  let pendingDx = 0;
  let pendingDy = 0;

  const cancelMomentum = () => {
    if (momentumRafId !== null) {
      targetWin.cancelAnimationFrame(momentumRafId);
      momentumRafId = null;
    }
  };

  const cancelDragRaf = () => {
    if (dragRafId !== null) {
      targetWin.cancelAnimationFrame(dragRafId);
      dragRafId = null;
    }
  };

  const findScrollable = (el: HTMLElement | null): HTMLElement | Window => {
    let curr = el;
    while (curr && curr !== targetDoc.body && curr !== targetDoc.documentElement) {
      const style = targetWin.getComputedStyle(curr);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      const canScrollY =
        (overflowY === 'auto' || overflowY === 'scroll') &&
        curr.scrollHeight > curr.clientHeight;
      const canScrollX =
        (overflowX === 'auto' || overflowX === 'scroll') &&
        curr.scrollWidth > curr.clientWidth;
      if (canScrollY || canScrollX) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return targetWin;
  };

  const getScrollValues = (container: HTMLElement | Window) => {
    if (container === targetWin) {
      return {
        top: targetWin.scrollY || targetDoc.documentElement.scrollTop || 0,
        left: targetWin.scrollX || targetDoc.documentElement.scrollLeft || 0,
        maxTop: Math.max(0, targetDoc.documentElement.scrollHeight - targetWin.innerHeight),
        maxLeft: Math.max(0, targetDoc.documentElement.scrollWidth - targetWin.innerWidth),
      };
    } else {
      const elem = container as HTMLElement;
      return {
        top: elem.scrollTop,
        left: elem.scrollLeft,
        maxTop: Math.max(0, elem.scrollHeight - elem.clientHeight),
        maxLeft: Math.max(0, elem.scrollWidth - elem.clientWidth),
      };
    }
  };

  const setScrollValues = (container: HTMLElement | Window, left: number, top: number) => {
    if (container === targetWin) {
      targetWin.scrollTo({
        left,
        top,
        behavior: 'instant' as ScrollBehavior,
      });
    } else {
      const elem = container as HTMLElement;
      elem.scrollLeft = left;
      elem.scrollTop = top;
    }
  };

  const onPointerDown = (e: MouseEvent | PointerEvent) => {
    // Left click only
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    // Don't drag-scroll on interactive input fields
    if (target.closest('input, textarea, select, option, [contenteditable="true"]')) {
      return;
    }

    // Stop any ongoing momentum glide on touch/click interrupt
    cancelMomentum();
    cancelDragRaf();

    isDown = true;
    hasDragged = false;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    pendingDx = 0;
    pendingDy = 0;

    velocityHistory.length = 0;
    velocityHistory.push({ x: e.clientX, y: e.clientY, time: performance.now() });

    // Clear any text selection that might have started
    try {
      const sel = targetWin.getSelection ? targetWin.getSelection() : null;
      if (sel && sel.removeAllRanges) {
        sel.removeAllRanges();
      }
    } catch {}

    targetContainer = findScrollable(target);
    const bounds = getScrollValues(targetContainer);
    currentScrollTop = bounds.top;
    currentScrollLeft = bounds.left;
  };

  const onPointerMove = (e: MouseEvent | PointerEvent) => {
    if (!isDown || !targetContainer) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    if (!hasDragged) {
      const totalDist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (totalDist > 4) {
        hasDragged = true;
      }
    }

    if (!hasDragged) return;

    const now = performance.now();
    velocityHistory.push({ x: e.clientX, y: e.clientY, time: now });
    // Keep only last 100ms of velocity history
    while (velocityHistory.length > 1 && now - velocityHistory[0].time > 100) {
      velocityHistory.shift();
    }

    pendingDx += dx;
    pendingDy += dy;

    // Schedule frame-rate synchronized update (240Hz RAF)
    if (dragRafId === null) {
      dragRafId = targetWin.requestAnimationFrame(() => {
        dragRafId = null;
        if (!targetContainer) return;

        currentScrollLeft -= pendingDx;
        currentScrollTop -= pendingDy;
        pendingDx = 0;
        pendingDy = 0;

        const bounds = getScrollValues(targetContainer);
        currentScrollLeft = Math.max(0, Math.min(bounds.maxLeft, currentScrollLeft));
        currentScrollTop = Math.max(0, Math.min(bounds.maxTop, currentScrollTop));

        setScrollValues(targetContainer, currentScrollLeft, currentScrollTop);
      });
    }
  };

  const startMomentum = (vx: number, vy: number, container: HTMLElement | Window) => {
    let lastTime = performance.now();

    const momentumLoop = () => {
      const now = performance.now();
      const dt = Math.min(now - lastTime, 32); // Clamp delta to avoid huge leaps
      lastTime = now;

      // Frame-rate independent decay (tuned for buttery smooth 240Hz/120Hz/60Hz feeling)
      const decay = Math.pow(0.92, dt / 16.67);
      vx *= decay;
      vy *= decay;

      const speed = Math.hypot(vx, vy);
      if (speed < 0.04) {
        cancelMomentum();
        return;
      }

      const bounds = getScrollValues(container);
      currentScrollLeft -= vx * dt;
      currentScrollTop -= vy * dt;

      // Bounce/clamp against boundaries
      if (currentScrollLeft <= 0 || currentScrollLeft >= bounds.maxLeft) {
        vx = 0;
        currentScrollLeft = Math.max(0, Math.min(bounds.maxLeft, currentScrollLeft));
      }
      if (currentScrollTop <= 0 || currentScrollTop >= bounds.maxTop) {
        vy = 0;
        currentScrollTop = Math.max(0, Math.min(bounds.maxTop, currentScrollTop));
      }

      setScrollValues(container, currentScrollLeft, currentScrollTop);

      if (Math.abs(vx) > 0.04 || Math.abs(vy) > 0.04) {
        momentumRafId = targetWin.requestAnimationFrame(momentumLoop);
      } else {
        cancelMomentum();
      }
    };

    momentumRafId = targetWin.requestAnimationFrame(momentumLoop);
  };

  const onPointerUp = () => {
    if (!isDown) return;
    isDown = false;
    cancelDragRaf();

    if (hasDragged && targetContainer) {
      const now = performance.now();
      const recent = velocityHistory.filter((pt) => now - pt.time <= 80);

      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const dt = last.time - first.time;

        if (dt > 10) {
          // Pixels per millisecond
          const vx = (last.x - first.x) / dt;
          const vy = (last.y - first.y) / dt;

          const initialSpeed = Math.hypot(vx, vy);
          if (initialSpeed > 0.15) {
            startMomentum(vx * 1.15, vy * 1.15, targetContainer);
          }
        }
      }
    }
  };

  // Add listeners using pointer events for highest precision
  targetDoc.addEventListener('pointerdown', onPointerDown, { passive: true });
  targetDoc.addEventListener('pointermove', onPointerMove, { passive: true });
  targetDoc.addEventListener('pointerup', onPointerUp, { passive: true });
  targetDoc.addEventListener('pointercancel', onPointerUp, { passive: true });

  // Prevent browser native text selection and element dragging during mobile simulation
  targetDoc.addEventListener('selectstart', (e: Event) => {
    const target = e.target as HTMLElement;
    if (target?.closest && target.closest('input, textarea, select, option, [contenteditable="true"]')) {
      return;
    }
    e.preventDefault();
  });

  targetDoc.addEventListener('dragstart', (e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (target?.closest && target.closest('input, textarea, select, option, [contenteditable="true"]')) {
      return;
    }
    e.preventDefault();
  });

  // Suppress click if it was an active drag
  targetDoc.addEventListener(
    'click',
    (e: MouseEvent) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    },
    true
  );
}
