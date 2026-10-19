import { resolveExerciseAsset, type ExerciseAssetContext } from "@/lib/ui/exercise-assets";
import styles from "./ui.module.css";

export function ExerciseIllustration({ name, variant, equipment, decorative = true, className = "" }: { name: string; decorative?: boolean; className?: string } & ExerciseAssetContext) {
  const src = resolveExerciseAsset(name, { variant, equipment });
  return <span className={`${styles.illustration} ${className}`}>
    {src ? <img src={src} width={64} height={64} loading="lazy" draggable={false} alt={decorative ? "" : `Ilustracja: ${name}`} /> : <span className={styles.neutral} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : `Brak dokładnej ilustracji: ${name}`}>ĆW<span>WŁASNE</span></span>}
  </span>;
}
