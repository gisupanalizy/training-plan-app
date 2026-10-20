import { resolveExerciseAsset, type ExerciseAssetContext } from "@/lib/ui/exercise-assets";
import styles from "./ui.module.css";

function GenericExerciseMark() {
  return <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false"><circle cx="32" cy="12" r="6" fill="currentColor" /><path fill="currentColor" d="M20 28c1-6 6-9 12-9s11 3 12 9l6 3-2 4-6-2v7l7 16h-6l-5-12-5 12h-6l7-16v-7l-6 2-2-4z" /></svg>;
}

export function ExerciseIllustration({ name, variant, equipment, canonicalKey, assetFile, decorative = true, className = "" }: { name: string; decorative?: boolean; className?: string } & ExerciseAssetContext) {
  const src = resolveExerciseAsset(name, { variant, equipment, canonicalKey, assetFile });
  return <span className={`${styles.illustration} ${className}`}>
    {src ? <img src={src} width={64} height={64} loading="lazy" draggable={false} alt={decorative ? "" : `Ilustracja: ${name}`} /> : <span className={styles.neutral} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `Brak dokładnej ilustracji: ${name}`}><GenericExerciseMark /></span>}
  </span>;
}
