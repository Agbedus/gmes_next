"use client";

import React from 'react';
import { createPortal } from 'react-dom';

type Props = {
  visible: boolean;
  left: number;
  top: number;
  onCloseAction?: () => void;
  announcement?: string; // plain-text announcement for screen-readers
  children: React.ReactNode;
  maxWidth?: number;
};

export default function Tooltip({ visible, left, top, onCloseAction, announcement, children, maxWidth = 320 }: Props) {
  const elRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<{ left: number; top: number }>({ left, top });

  // clamp position after render
  React.useLayoutEffect(() => {
    if (!visible) return;
    const el = elRef.current;
    if (!el) {
      setPos({ left, top });
      return;
    }

    // set initial position to measure
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;

    // measure and clamp
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let newLeft = left;
    let newTop = top;

    if (rect.right > vw - margin) newLeft = Math.max(margin, vw - rect.width - margin);
    if (rect.left < margin) newLeft = margin;
    if (rect.bottom > vh - margin) newTop = Math.max(margin, vh - rect.height - margin);
    if (rect.top < margin) newTop = margin;

    setPos({ left: Math.round(newLeft), top: Math.round(newTop) });

    // focus management: move focus into tooltip for keyboard users
    el.focus();
  }, [visible, left, top, children]);

  // handle key events for escape & simple focus trap
  React.useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseAction?.();
      }
      if (e.key === 'Tab') {
        // basic trap: keep focus on tooltip container
        e.preventDefault();
        const el = elRef.current;
        if (el) el.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, onCloseAction]);

  if (!visible) return null;

  return createPortal(
    <div
      ref={elRef}
      role="dialog"
      aria-modal={false}
      tabIndex={0}
      className="z-[20000]"
      style={{ position: 'fixed', left: pos.left, top: pos.top, maxWidth, outline: 'none' }}
    >
      {/* visually styled container */}
      <div
        style={{
          background: 'white',
          padding: 8,
          borderRadius: 8,
          boxShadow: '0 6px 16px rgba(2,6,23,0.12)',
          maxWidth,
          color: '#0f172a',
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          fontSize: 13,
        }}
        aria-live="polite"
      >
        {/* announcement for SR */}
        {announcement ? <span className="sr-only" aria-live="polite">{announcement}</span> : null}
        {children}
      </div>
    </div>,
    document.body
  );
}
