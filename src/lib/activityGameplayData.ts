/**
 * Generates gameplay data for activities based on their type and context.
 * This maps the static seed data activity definitions to interactive content
 * used by the activity components.
 */

import type { ActivityType } from "@/lib/studyTypes";

// ---------------------------------------------------------------------------
// Tap-correct data
// ---------------------------------------------------------------------------

/** Predefined choice sets keyed by activity ID for tap_correct activities */
const TAP_CORRECT_DATA: Record<
  string,
  { label: string; emoji: string }[]
> = {
  "act-water-tap": [
    { label: "Water", emoji: "💧" },
    { label: "Ball", emoji: "⚽" },
    { label: "Book", emoji: "📖" },
    { label: "Hat", emoji: "🎩" },
  ],
  "act-break-tap": [
    { label: "Quiet space", emoji: "🧘" },
    { label: "Running", emoji: "🏃" },
    { label: "Drum", emoji: "🥁" },
    { label: "TV", emoji: "📺" },
  ],
  "act-happy-sad-tap": [
    { label: "Happy", emoji: "😊" },
    { label: "Sad", emoji: "😢" },
    { label: "Angry", emoji: "😠" },
    { label: "Sleepy", emoji: "😴" },
  ],
  "act-calm-identify": [
    { label: "Calm", emoji: "😌" },
    { label: "Angry", emoji: "😠" },
    { label: "Scared", emoji: "😨" },
    { label: "Excited", emoji: "🤩" },
  ],
  "act-hello-tap": [
    { label: "Waving hello", emoji: "👋" },
    { label: "Sleeping", emoji: "😴" },
    { label: "Eating", emoji: "🍎" },
    { label: "Reading", emoji: "📚" },
  ],
  "act-please-tap": [
    { label: "Please", emoji: "🙏" },
    { label: "Go away", emoji: "🚫" },
    { label: "Mine", emoji: "👊" },
    { label: "No", emoji: "❌" },
  ],
};

// ---------------------------------------------------------------------------
// Visual matching data
// ---------------------------------------------------------------------------

const VISUAL_MATCHING_DATA: Record<
  string,
  { id: string; label: string; emoji: string; matchLabel: string; matchEmoji: string }[]
> = {
  "act-help-match": [
    { id: "1", label: "Blocks fell", emoji: "🧱", matchLabel: "Help", matchEmoji: "🆘" },
    { id: "2", label: "Can't reach", emoji: "📦", matchLabel: "Help", matchEmoji: "🙋" },
    { id: "3", label: "Feeling OK", emoji: "😊", matchLabel: "No help", matchEmoji: "👍" },
  ],
  "act-happy-sad-match": [
    { id: "1", label: "Got a gift", emoji: "🎁", matchLabel: "Happy", matchEmoji: "😊" },
    { id: "2", label: "Lost toy", emoji: "🧸", matchLabel: "Sad", matchEmoji: "😢" },
    { id: "3", label: "Birthday", emoji: "🎂", matchLabel: "Happy", matchEmoji: "😄" },
  ],
  "act-goodbye-match": [
    { id: "1", label: "School", emoji: "🏫", matchLabel: "Wave bye", matchEmoji: "👋" },
    { id: "2", label: "Park", emoji: "🌳", matchLabel: "See you", matchEmoji: "🤗" },
    { id: "3", label: "Store", emoji: "🏪", matchLabel: "Bye bye", matchEmoji: "🤚" },
  ],
  "act-abc-match": [
    { id: "1", label: "A", emoji: "🅰️", matchLabel: "a", matchEmoji: "🔤" },
    { id: "2", label: "B", emoji: "🅱️", matchLabel: "b", matchEmoji: "🔤" },
    { id: "3", label: "C", emoji: "©️", matchLabel: "c", matchEmoji: "🔤" },
  ],
  "act-def-match": [
    { id: "1", label: "D", emoji: "🇩", matchLabel: "d", matchEmoji: "🔤" },
    { id: "2", label: "E", emoji: "🇪", matchLabel: "e", matchEmoji: "🔤" },
    { id: "3", label: "F", emoji: "🇫", matchLabel: "f", matchEmoji: "🔤" },
  ],
};

// ---------------------------------------------------------------------------
// Sequencing data
// ---------------------------------------------------------------------------

const SEQUENCING_DATA: Record<
  string,
  { label: string; emoji: string }[]
> = {
  "act-break-sequence": [
    { label: "Ask for a break", emoji: "🗣️" },
    { label: "Go to quiet spot", emoji: "🧘" },
    { label: "Take deep breaths", emoji: "🌬️" },
    { label: "Come back", emoji: "🚶" },
  ],
  "act-angry-scared-calm": [
    { label: "Stop", emoji: "✋" },
    { label: "Take 3 breaths", emoji: "🌬️" },
    { label: "Count to 5", emoji: "🔢" },
    { label: "Tell a grown-up", emoji: "🗣️" },
  ],
  "act-goodbye-sequence": [
    { label: "Wave", emoji: "👋" },
    { label: "Say 'Goodbye'", emoji: "🗣️" },
    { label: "Smile", emoji: "😊" },
  ],
};

// ---------------------------------------------------------------------------
// Listen-choose data
// ---------------------------------------------------------------------------

/** Predefined choice sets for listen_choose activities (first = correct) */
const LISTEN_CHOOSE_DATA: Record<
  string,
  { label: string; emoji: string }[]
> = {
  "act-water-listen": [
    { label: "Water", emoji: "💧" },
    { label: "Apple", emoji: "🍎" },
    { label: "Book", emoji: "📖" },
    { label: "Car", emoji: "🚗" },
  ],
  "act-help-listen": [
    { label: "I need help", emoji: "🆘" },
    { label: "I am happy", emoji: "😊" },
    { label: "I want food", emoji: "🍞" },
    { label: "Let's play", emoji: "🎮" },
  ],
  "act-feelings-listen": [
    { label: "Happy", emoji: "😊" },
    { label: "Sad", emoji: "😢" },
    { label: "Angry", emoji: "😠" },
    { label: "Tired", emoji: "😴" },
  ],
  "act-greet-listen": [
    { label: "Hello!", emoji: "👋" },
    { label: "Goodbye!", emoji: "🤚" },
    { label: "Please", emoji: "🙏" },
    { label: "Thank you", emoji: "💛" },
  ],
  "act-shapes-listen": [
    { label: "Circle", emoji: "⭕" },
    { label: "Square", emoji: "🟦" },
    { label: "Triangle", emoji: "🔺" },
    { label: "Rectangle", emoji: "📄" },
  ],
  "act-numbers-listen": [
    { label: "Three", emoji: "3️⃣" },
    { label: "One", emoji: "1️⃣" },
    { label: "Five", emoji: "5️⃣" },
    { label: "Seven", emoji: "7️⃣" },
  ],
};

// ---------------------------------------------------------------------------
// Speak-tap AAC data
// ---------------------------------------------------------------------------

/** Predefined AAC response option sets for speak_tap_aac activities (first = correct) */
const SPEAK_TAP_AAC_DATA: Record<
  string,
  { label: string; emoji: string; speakText?: string }[]
> = {
  "act-want-water-aac": [
    { label: "Water", emoji: "💧", speakText: "I want water please" },
    { label: "Food", emoji: "🍎" },
    { label: "Break", emoji: "🧘" },
    { label: "Play", emoji: "🎮" },
  ],
  "act-need-help-aac": [
    { label: "Help", emoji: "🆘", speakText: "I need help please" },
    { label: "No", emoji: "❌" },
    { label: "Done", emoji: "✅" },
    { label: "More", emoji: "➕" },
  ],
  "act-feeling-happy-aac": [
    { label: "Happy", emoji: "😊", speakText: "I feel happy" },
    { label: "Sad", emoji: "😢" },
    { label: "Angry", emoji: "😠" },
    { label: "Tired", emoji: "😴" },
  ],
  "act-say-hello-aac": [
    { label: "Hello!", emoji: "👋", speakText: "Hello!" },
    { label: "Goodbye", emoji: "🤚" },
    { label: "Please", emoji: "🙏" },
    { label: "Thank you", emoji: "💛" },
  ],
  "act-please-aac": [
    { label: "Please", emoji: "🙏", speakText: "Yes please" },
    { label: "No thank you", emoji: "🙅" },
    { label: "Maybe", emoji: "🤔" },
    { label: "Stop", emoji: "✋" },
  ],
  "act-break-aac": [
    { label: "Break", emoji: "⏸️", speakText: "I need a break" },
    { label: "Play", emoji: "🎮" },
    { label: "Eat", emoji: "🍎" },
    { label: "Sleep", emoji: "😴" },
  ],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type ActivityGameplayData =
  | {
      type: "tap_correct";
      choices: { label: string; emoji: string }[];
    }
  | {
      type: "visual_matching";
      pairs: { id: string; label: string; emoji: string; matchLabel: string; matchEmoji: string }[];
    }
  | {
      type: "sequencing";
      steps: { label: string; emoji: string }[];
    }
  | {
      type: "listen_choose";
      choices: { label: string; emoji: string }[];
    }
  | {
      type: "speak_tap_aac";
      options: { label: string; emoji: string; speakText?: string }[];
    }
  | {
      type: "simple";
    };

/**
 * Returns gameplay data for a given activity, or a simple "done" fallback
 * for activity types that don't yet have interactive gameplay.
 */
export function getActivityGameplayData(
  activityId: string,
  activityType: ActivityType,
): ActivityGameplayData {
  switch (activityType) {
    case "tap_correct": {
      const choices = TAP_CORRECT_DATA[activityId];
      if (choices) return { type: "tap_correct", choices };
      // Fallback generic choices
      return {
        type: "tap_correct",
        choices: [
          { label: "Yes ✓", emoji: "✅" },
          { label: "No ✗", emoji: "❌" },
          { label: "Maybe", emoji: "🤔" },
        ],
      };
    }
    case "visual_matching": {
      const pairs = VISUAL_MATCHING_DATA[activityId];
      if (pairs) return { type: "visual_matching", pairs };
      return { type: "simple" };
    }
    case "sequencing": {
      const steps = SEQUENCING_DATA[activityId];
      if (steps) return { type: "sequencing", steps };
      return { type: "simple" };
    }
    case "listen_choose": {
      const choices = LISTEN_CHOOSE_DATA[activityId];
      if (choices) return { type: "listen_choose", choices };
      // Fallback generic listen-choose
      return {
        type: "listen_choose",
        choices: [
          { label: "Yes", emoji: "✅" },
          { label: "No", emoji: "❌" },
          { label: "Maybe", emoji: "🤔" },
        ],
      };
    }
    case "speak_tap_aac": {
      const options = SPEAK_TAP_AAC_DATA[activityId];
      if (options) return { type: "speak_tap_aac", options };
      // Fallback generic AAC options
      return {
        type: "speak_tap_aac",
        options: [
          { label: "Yes", emoji: "✅", speakText: "Yes" },
          { label: "No", emoji: "❌", speakText: "No" },
          { label: "Help", emoji: "🆘", speakText: "I need help" },
        ],
      };
    }
    default:
      return { type: "simple" };
  }
}
