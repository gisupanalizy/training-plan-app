"use client";
import { useEffect, useRef, type ReactNode } from 'react';
export function WorkoutDialog({ title, onClose, children, locked = false }: { title: string; onClose: () => void; children: ReactNode; locked?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal?.();
    return () => { dialog?.close?.(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={ref} className="workout-dialog" aria-label={title} onCancel={event => { event.preventDefault(); if (!locked) onClose(); }}>
    <h2>{title}</h2>{children}<button type="button" className="button button-outline" disabled={locked} onClick={onClose}>Zostań</button>
  </dialog>;
}
