/**
 * @deprecated
 * This file is a legacy stub — do NOT use.
 *
 * Use `src/lib/tts.ts` instead, which provides a real cross-platform TTS
 * implementation using:
 *   - @capacitor-community/text-to-speech on native (iOS/Android)
 *   - window.speechSynthesis on web
 *
 * Example:
 *   import { speak } from "@/lib/tts";
 *   speak("Hello!", soundEnabled);
 *
 * This file is kept to avoid breaking any accidental imports, but the
 * console.log() stub below does nothing useful. It will be removed in a
 * future cleanup pass.
 */

/**
 * @deprecated Use `speak` from `@/lib/tts` instead.
 */
export function speak(text: string): void {
  // This stub does nothing useful. Use tts.ts instead.
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[speak.ts] Deprecated stub called. Use tts.ts instead.",
      text,
    );
  }
}
