// RoutineNest — Cross-platform TTS service
// Mobile (Capacitor): @capacitor-community/text-to-speech
// Web: SpeechSynthesis API fallback

import { Capacitor } from "@capacitor/core";

export interface TtsOptions {
  /** Speech rate, 1.0 = normal */
  rate?: number;
  /** Pitch, 1.0 = normal */
  pitch?: number;
  /** Volume 0.0–1.0 */
  volume?: number;
  /** BCP-47 language tag, e.g. "en-US" */
  lang?: string;
}

/**
 * Speak the given text aloud.
 *
 * Rules:
 *  - If soundEnabled is false, this is a no-op.
 *  - On native Capacitor, uses @capacitor-community/text-to-speech.
 *  - On web, uses window.speechSynthesis if available.
 */
export async function speak(
  text: string,
  soundEnabled: boolean,
  options: TtsOptions = {},
): Promise<void> {
  if (!soundEnabled || !text.trim()) return;

  if (Capacitor.isNativePlatform()) {
    // Dynamic import to avoid SSR issues with Capacitor modules
    try {
      const { TextToSpeech } = await import(
        "@capacitor-community/text-to-speech"
      );
      await TextToSpeech.speak({
        text,
        rate: options.rate ?? 1.0,
        pitch: options.pitch ?? 1.0,
        volume: options.volume ?? 1.0,
        lang: options.lang ?? "en-US",
      });
    } catch (err) {
      console.warn("[tts] Native TTS failed:", err);
    }
  } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    if (options.lang) {
      utterance.lang = options.lang;
    }
    window.speechSynthesis.speak(utterance);
  }
  // If neither is available, silently do nothing
}

/**
 * Stop any currently playing TTS.
 */
export async function stop(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { TextToSpeech } = await import(
        "@capacitor-community/text-to-speech"
      );
      await TextToSpeech.stop();
    } catch (err) {
      console.warn("[tts] Native TTS stop failed:", err);
    }
  } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
