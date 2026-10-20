"use client";
import { useEffect, useRef, type KeyboardEvent } from "react";
import styles from "./ui.module.css";

export function SegmentedControl<T extends string>({ label, value, onValueChange, options }: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  const group = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const selected = group.current?.querySelector<HTMLElement>("[aria-checked=true]");
    if (selected && group.current?.contains(document.activeElement)) selected.focus();
  }, [value]);
  function move(event: KeyboardEvent<HTMLDivElement>, direction: 1 | -1) {
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next = options[(index + direction + options.length) % options.length];
    if (next) onValueChange(next.value);
  }
  return (
    <div ref={group} role="radiogroup" aria-label={label} className={styles.segments} onKeyDown={(event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") move(event, 1);
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") move(event, -1);
    }}>
      {options.map((option) => {
        const selected = option.value === value;
        return <button key={option.value} type="button" role="radio" aria-checked={selected} tabIndex={selected ? 0 : -1} className={styles.segment} onClick={() => onValueChange(option.value)}>{option.label}</button>;
      })}
    </div>
  );
}
