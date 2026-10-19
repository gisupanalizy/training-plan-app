import type { SVGProps } from "react";

// Oryginalne ikony Forma: jeden viewBox, obrys i grubość dla wszystkich akcji.
const paths = {
  training: "M6 3v18M18 3v18M3 7v10M21 7v10M6 12h12",
  plans: "M5 3h14v18H5zM9 7h6M9 11h6M9 15h4",
  history: "M3 11a9 9 0 1 1 3 7M3 4v7h7M12 7v5l3 2",
  progress: "M4 3v17h17M7 15l4-5 4 3 6-8",
  profile: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2",
  arrowRight: "M4 12h16M14 6l6 6-6 6",
  arrowLeft: "M20 12H4M10 6l-6 6 6 6",
  chevronRight: "M9 5l7 7-7 7",
  chevronLeft: "M15 5l-7 7 7 7",
  chevronDown: "M5 9l7 7 7-7",
  plus: "M12 4v16M4 12h16",
  close: "M5 5l14 14M19 5 5 19",
  check: "M4 12l5 5L20 6",
  edit: "m15 4 5 5M4 20l1-6L17 2l5 5L10 19z",
  info: "M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  upload: "M12 16V3M6 9l6-6 6 6M4 16v5h16v-5",
  file: "M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h5",
  camera: "M3 6h4l2-3h6l2 3h4v15H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  microphone: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0zM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2",
  logout: "M9 3H3v18h6M9 12h12M16 7l5 5-5 5",
  trash: "M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
} satisfies Record<string, string>;

export type IconName = keyof typeof paths;
export function Icon({ name, size = 22, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d={paths[name]} /></svg>;
}
