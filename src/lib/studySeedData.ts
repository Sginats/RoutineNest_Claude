// RoutineNest — Study Plan seed data
// Client-side static arrays for curriculum content. No server/database dependency.

import type {
  YearCategory,
  ClassLevel,
  SubjectArea,
  StudyModule,
  Lesson,
  Activity,
  ActivityType,
} from "./studyTypes";

// ---------------------------------------------------------------------------
// Seed types — exclude server-generated timestamps
// ---------------------------------------------------------------------------

type SeedYearCategory = Omit<YearCategory, "created_at" | "updated_at">;
type SeedClassLevel = Omit<ClassLevel, "created_at" | "updated_at">;
type SeedSubjectArea = Omit<SubjectArea, "created_at" | "updated_at">;
type SeedModule = Omit<StudyModule, "created_at" | "updated_at">;
type SeedLesson = Omit<Lesson, "created_at" | "updated_at">;
type SeedActivity = Omit<Activity, "created_at" | "updated_at">;

// ---------------------------------------------------------------------------
// Year Categories (5)
// ---------------------------------------------------------------------------

export const SEED_YEAR_CATEGORIES: SeedYearCategory[] = [
  {
    id: "yc-early-learners",
    title: "Early Learners",
    description:
      "A gentle introduction for our youngest learners. Activities focus on sensory exploration, basic communication, and building comfort with routines.",
    icon: "🌱",
    order: 1,
    age_min: 3,
    age_max: 5,
  },
  {
    id: "yc-foundation-stage",
    title: "Foundation Stage",
    description:
      "Building core skills in reading, numbers, and social interaction through structured, supportive play and guided practice.",
    icon: "🏗️",
    order: 2,
    age_min: 5,
    age_max: 7,
  },
  {
    id: "yc-primary-stage",
    title: "Primary Stage",
    description:
      "Strengthening literacy, numeracy, and daily-living skills with increasing independence and confidence.",
    icon: "📚",
    order: 3,
    age_min: 7,
    age_max: 9,
  },
  {
    id: "yc-intermediate-stage",
    title: "Intermediate Stage",
    description:
      "Expanding academic knowledge and self-management skills. Learners tackle multi-step problems and longer reading passages.",
    icon: "🚀",
    order: 4,
    age_min: 9,
    age_max: 11,
  },
  {
    id: "yc-advanced-primary",
    title: "Advanced Primary",
    description:
      "Preparing learners for middle school with advanced reasoning, independent study habits, and community participation skills.",
    icon: "🎓",
    order: 5,
    age_min: 11,
    age_max: 13,
  },
];

// ---------------------------------------------------------------------------
// Class Levels (8)
// ---------------------------------------------------------------------------

export const SEED_CLASS_LEVELS: SeedClassLevel[] = [
  {
    id: "cl-prek",
    year_category_id: "yc-early-learners",
    title: "Pre-K",
    description:
      "Pre-kindergarten readiness — learning through play, basic shapes, colors, and first words.",
    icon: "🧸",
    order: 1,
  },
  {
    id: "cl-kindergarten",
    year_category_id: "yc-foundation-stage",
    title: "Kindergarten",
    description:
      "First formal learning year — letter sounds, counting to 20, sharing, and classroom routines.",
    icon: "🎒",
    order: 2,
  },
  {
    id: "cl-grade1",
    year_category_id: "yc-foundation-stage",
    title: "Grade 1",
    description:
      "Beginning reading and writing, addition and subtraction, and learning how to work with others.",
    icon: "✏️",
    order: 3,
  },
  {
    id: "cl-grade2",
    year_category_id: "yc-primary-stage",
    title: "Grade 2",
    description:
      "Growing readers and mathematicians — short stories, place value, and community awareness.",
    icon: "📖",
    order: 4,
  },
  {
    id: "cl-grade3",
    year_category_id: "yc-primary-stage",
    title: "Grade 3",
    description:
      "Developing fluency in reading, multiplication basics, and collaborative projects.",
    icon: "🔬",
    order: 5,
  },
  {
    id: "cl-grade4",
    year_category_id: "yc-intermediate-stage",
    title: "Grade 4",
    description:
      "Multi-paragraph writing, fractions, and beginning research skills.",
    icon: "🗺️",
    order: 6,
  },
  {
    id: "cl-grade5",
    year_category_id: "yc-intermediate-stage",
    title: "Grade 5",
    description:
      "Deeper comprehension, decimals and percentages, and increased personal responsibility.",
    icon: "💡",
    order: 7,
  },
  {
    id: "cl-grade6",
    year_category_id: "yc-advanced-primary",
    title: "Grade 6",
    description:
      "Transition year — essay writing, pre-algebra, and independent project management.",
    icon: "🎯",
    order: 8,
  },
];

// ---------------------------------------------------------------------------
// Subject Areas (7)
// ---------------------------------------------------------------------------

export const SEED_SUBJECT_AREAS: SeedSubjectArea[] = [
  {
    id: "sa-communication",
    title: "Communication",
    description:
      "Expressing needs, wants, and feelings using words, pictures, and AAC tools. Builds functional communication for everyday situations.",
    icon: "💬",
    order: 1,
    is_premium: false,
  },
  {
    id: "sa-reading",
    title: "Reading/Language",
    description:
      "Letter recognition, phonics, sight words, and reading comprehension at every level. Stories chosen for clarity and positive themes.",
    icon: "📖",
    order: 2,
    is_premium: false,
  },
  {
    id: "sa-math",
    title: "Math",
    description:
      "Numbers, counting, shapes, and operations presented with visual supports and hands-on activities.",
    icon: "🔢",
    order: 3,
    is_premium: false,
  },
  {
    id: "sa-daily-living",
    title: "Daily Living Skills",
    description:
      "Practical life skills — dressing, hygiene, meal routines, and household tasks — taught step-by-step with visual schedules.",
    icon: "🏠",
    order: 4,
    is_premium: false,
  },
  {
    id: "sa-social",
    title: "Social Skills",
    description:
      "Turn-taking, greetings, understanding emotions, and friendship skills through role-play and social stories.",
    icon: "🤝",
    order: 5,
    is_premium: false,
  },
  {
    id: "sa-fine-motor",
    title: "Fine Motor/Cognitive",
    description:
      "Hand-eye coordination, tracing, puzzles, and sorting tasks that strengthen thinking and motor control.",
    icon: "✋",
    order: 6,
    is_premium: true,
  },
  {
    id: "sa-creative",
    title: "Creative/Calm Activities",
    description:
      "Coloring, music, sensory play, and mindfulness activities for self-regulation and joyful expression.",
    icon: "🎨",
    order: 7,
    is_premium: true,
  },
];

// ---------------------------------------------------------------------------
// Helper — keeps module/lesson/activity builders concise
// ---------------------------------------------------------------------------

const mod = (
  id: string,
  subject_area_id: string,
  title: string,
  description: string,
  icon: string,
  order: number,
  difficulty: number,
  is_premium: boolean,
  class_level_id: string = "cl-kindergarten",
): SeedModule => ({
  id,
  subject_area_id,
  class_level_id,
  title,
  description,
  icon,
  order,
  difficulty,
  is_premium,
});

const les = (
  id: string,
  module_id: string,
  title: string,
  description: string,
  icon: string,
  order: number,
  difficulty: number,
  duration_minutes: number,
  reward_points: number,
  is_premium: boolean,
  requires_parent_help = false,
): SeedLesson => ({
  id,
  module_id,
  title,
  description,
  icon,
  order,
  difficulty,
  duration_minutes,
  reward_points,
  is_premium,
  calm_mode_safe: true,
  requires_parent_help,
});

const act = (
  id: string,
  lesson_id: string,
  title: string,
  description: string,
  icon: string,
  order: number,
  difficulty: number,
  duration_minutes: number,
  reward_points: number,
  activity_type: ActivityType,
  instructions: string,
  is_premium: boolean,
  opts: {
    audio_cue?: string | null;
    aac_support?: boolean | null;
    requires_parent_help?: boolean;
  } = {},
): SeedActivity => ({
  id,
  lesson_id,
  title,
  description,
  icon,
  order,
  difficulty,
  duration_minutes,
  reward_points,
  activity_type,
  instructions,
  audio_cue: opts.audio_cue ?? null,
  aac_support: opts.aac_support ?? null,
  is_premium,
  calm_mode_safe: true,
  requires_parent_help: opts.requires_parent_help ?? false,
});

// ---------------------------------------------------------------------------
// Modules (21 — 3 per subject, scoped to Foundation Stage / Kindergarten)
// ---------------------------------------------------------------------------

export const SEED_MODULES: SeedModule[] = [
  // ── Communication ──────────────────────────────────────────────────────
  // Basic needs: earliest level — appropriate from Pre-K onward
  mod("mod-comm-basic-needs", "sa-communication", "Expressing Basic Needs", "Learn to ask for help, food, drink, and a break using words and picture cards.", "🗣️", 1, 1, false, "cl-prek"),
  // Feelings: kindergarten level
  mod("mod-comm-feelings", "sa-communication", "Naming My Feelings", "Identify and express happy, sad, angry, scared, and calm using visual supports.", "😊", 2, 2, false, "cl-kindergarten"),
  // Greetings: kindergarten level
  mod("mod-comm-greetings", "sa-communication", "Greetings & Goodbyes", "Practice saying hello, goodbye, please, and thank you in everyday situations.", "👋", 3, 1, false, "cl-kindergarten"),

  // ── Reading/Language ───────────────────────────────────────────────────
  // Letter recognition: kindergarten
  mod("mod-read-letter-id", "sa-reading", "Letter Recognition", "Identify uppercase and lowercase letters through fun matching and tracing games.", "🔤", 1, 1, false, "cl-kindergarten"),
  // Phonics: Grade 1
  mod("mod-read-phonics", "sa-reading", "Beginning Phonics", "Connect letters to their sounds and start blending simple CVC words.", "🔊", 2, 2, false, "cl-grade1"),
  // Sight words: Grade 2 (premium)
  mod("mod-read-sight-words", "sa-reading", "First Sight Words", "Recognize and read 20 high-frequency sight words with picture support.", "👀", 3, 2, true, "cl-grade2"),

  // ── Math ───────────────────────────────────────────────────────────────
  // Counting: Pre-K (very early math)
  mod("mod-math-counting", "sa-math", "Counting 1–10", "Count objects, match quantities, and write numerals from 1 to 10.", "🔢", 1, 1, false, "cl-prek"),
  // Shapes: kindergarten
  mod("mod-math-shapes", "sa-math", "Shapes All Around", "Identify circles, squares, triangles, and rectangles in the world around us.", "🔷", 2, 1, false, "cl-kindergarten"),
  // Patterns: Grade 1 (premium)
  mod("mod-math-patterns", "sa-math", "Simple Patterns", "Recognize and extend AB and ABC color and shape patterns.", "🔁", 3, 2, true, "cl-grade1"),

  // ── Daily Living Skills ────────────────────────────────────────────────
  // Morning routine: Pre-K (foundational life skill)
  mod("mod-daily-morning", "sa-daily-living", "My Morning Routine", "Follow a visual schedule to get ready in the morning — wake up, wash, dress, eat.", "🌅", 1, 1, false, "cl-prek"),
  // Hygiene: Pre-K (foundational)
  mod("mod-daily-hygiene", "sa-daily-living", "Healthy Hygiene Habits", "Learn handwashing, tooth brushing, and toileting steps with visual checklists.", "🧼", 2, 1, false, "cl-prek"),
  // Mealtime: kindergarten (premium)
  mod("mod-daily-mealtime", "sa-daily-living", "Mealtime Manners", "Practice setting a place, using utensils, and cleaning up after eating.", "🍽️", 3, 2, true, "cl-kindergarten"),

  // ── Social Skills ──────────────────────────────────────────────────────
  // Turn-taking: kindergarten
  mod("mod-social-turn-taking", "sa-social", "Taking Turns", "Learn to wait, share, and take turns during games and conversations.", "🔄", 1, 1, false, "cl-kindergarten"),
  // Reading faces: Grade 1
  mod("mod-social-emotions", "sa-social", "Reading Faces", "Look at faces and body language to understand how others feel.", "🎭", 2, 2, false, "cl-grade1"),
  // Making friends: Grade 1 (premium)
  mod("mod-social-friendship", "sa-social", "Making Friends", "Practice joining play, sharing toys, and being a kind friend.", "💛", 3, 2, true, "cl-grade1"),

  // ── Fine Motor/Cognitive ───────────────────────────────────────────────
  // Tracing: kindergarten (premium)
  mod("mod-motor-tracing", "sa-fine-motor", "Tracing Lines & Curves", "Strengthen pencil control by tracing straight, curved, and zigzag lines.", "✏️", 1, 1, true, "cl-kindergarten"),
  // Puzzles: Grade 1 (premium)
  mod("mod-motor-puzzles", "sa-fine-motor", "Simple Puzzles", "Build problem-solving skills by completing 4- to 9-piece visual puzzles.", "🧩", 2, 2, true, "cl-grade1"),
  // Sorting: Grade 2 (premium)
  mod("mod-motor-sorting", "sa-fine-motor", "Sort & Classify", "Sort objects by color, shape, and size to develop logical thinking.", "📦", 3, 2, true, "cl-grade2"),

  // ── Creative/Calm Activities ───────────────────────────────────────────
  // All creative modules: Pre-K onward (accessible to all levels)
  mod("mod-creative-coloring", "sa-creative", "Calm Coloring", "Relax with guided coloring pages featuring friendly animals and nature scenes.", "🖍️", 1, 1, true, "cl-prek"),
  mod("mod-creative-music", "sa-creative", "Music & Movement", "Listen, clap, and move to simple songs that build rhythm and body awareness.", "🎵", 2, 1, true, "cl-prek"),
  mod("mod-creative-sensory", "sa-creative", "Sensory Exploration", "Explore textures, sounds, and visuals in calming, low-stimulation activities.", "🫧", 3, 1, true, "cl-prek"),
];

// ---------------------------------------------------------------------------
// Lessons (63+ — 3 per module)
// ---------------------------------------------------------------------------

export const SEED_LESSONS: SeedLesson[] = [
  // ── Communication · Expressing Basic Needs ─────────────────────────────
  les("les-basic-needs-water", "mod-comm-basic-needs", "I Want Water", "Use a picture card or words to ask for a drink of water.", "💧", 1, 1, 5, 10, false),
  les("les-basic-needs-help", "mod-comm-basic-needs", "I Need Help", "Practice asking a grown-up for help when something is hard.", "🆘", 2, 1, 5, 10, false),
  les("les-basic-needs-break", "mod-comm-basic-needs", "I Need a Break", "Learn to tell someone when you need a quiet break.", "⏸️", 3, 1, 5, 10, false),

  // ── Communication · Naming My Feelings ─────────────────────────────────
  les("les-feelings-happy-sad", "mod-comm-feelings", "Happy & Sad", "Identify when you feel happy and when you feel sad using face pictures.", "😊", 1, 1, 8, 15, false),
  les("les-feelings-angry-scared", "mod-comm-feelings", "Angry & Scared", "Recognize angry and scared feelings and learn a calming strategy.", "😠", 2, 2, 8, 15, false),
  les("les-feelings-calm", "mod-comm-feelings", "Feeling Calm", "Practice deep breaths and learn to describe feeling calm and relaxed.", "😌", 3, 2, 8, 15, false),

  // ── Communication · Greetings & Goodbyes ───────────────────────────────
  les("les-greetings-hello", "mod-comm-greetings", "Saying Hello", "Wave and say hello when you see a friend or teacher.", "👋", 1, 1, 5, 10, false),
  les("les-greetings-goodbye", "mod-comm-greetings", "Saying Goodbye", "Wave and say goodbye when it is time to leave.", "🤚", 2, 1, 5, 10, false),
  les("les-greetings-please-thanks", "mod-comm-greetings", "Please & Thank You", "Use polite words when asking for something and when receiving help.", "🙏", 3, 1, 5, 10, false),

  // ── Reading/Language · Letter Recognition ──────────────────────────────
  les("les-letter-id-abc", "mod-read-letter-id", "Letters A, B, C", "Find and name the letters A, B, and C in uppercase and lowercase.", "🅰️", 1, 1, 8, 15, false),
  les("les-letter-id-def", "mod-read-letter-id", "Letters D, E, F", "Find and name the letters D, E, and F in uppercase and lowercase.", "🅱️", 2, 1, 8, 15, false),
  les("les-letter-id-ghi", "mod-read-letter-id", "Letters G, H, I", "Find and name the letters G, H, and I in uppercase and lowercase.", "🔠", 3, 1, 8, 15, false),

  // ── Reading/Language · Beginning Phonics ───────────────────────────────
  les("les-phonics-s-a-t", "mod-read-phonics", "Sounds: S, A, T", "Listen to and say the sounds for S, A, and T. Blend them into 'sat'.", "🔊", 1, 2, 10, 20, false),
  les("les-phonics-p-i-n", "mod-read-phonics", "Sounds: P, I, N", "Listen to and say the sounds for P, I, and N. Blend them into 'pin'.", "📌", 2, 2, 10, 20, false),
  les("les-phonics-c-o-g", "mod-read-phonics", "Sounds: C, O, G", "Listen to and say the sounds for C, O, and G. Blend them into 'cog'.", "⚙️", 3, 2, 10, 20, false),

  // ── Reading/Language · First Sight Words ───────────────────────────────
  les("les-sight-the-is", "mod-read-sight-words", "Words: the, is", "Read and recognize the sight words 'the' and 'is' in simple sentences.", "👁️", 1, 2, 8, 15, true),
  les("les-sight-and-it", "mod-read-sight-words", "Words: and, it", "Read and recognize the sight words 'and' and 'it' in simple sentences.", "📝", 2, 2, 8, 15, true),
  les("les-sight-can-we", "mod-read-sight-words", "Words: can, we", "Read and recognize the sight words 'can' and 'we' in simple sentences.", "📗", 3, 2, 8, 15, true),

  // ── Math · Counting 1–10 ───────────────────────────────────────────────
  les("les-counting-1-3", "mod-math-counting", "Counting 1, 2, 3", "Count groups of 1 to 3 objects and match them to the correct numeral.", "1️⃣", 1, 1, 8, 15, false),
  les("les-counting-4-6", "mod-math-counting", "Counting 4, 5, 6", "Count groups of 4 to 6 objects and match them to the correct numeral.", "4️⃣", 2, 1, 8, 15, false),
  les("les-counting-7-10", "mod-math-counting", "Counting 7 to 10", "Count groups of 7 to 10 objects and match them to the correct numeral.", "🔟", 3, 2, 10, 20, false),

  // ── Math · Shapes All Around ───────────────────────────────────────────
  les("les-shapes-circle-square", "mod-math-shapes", "Circles & Squares", "Identify circles and squares in pictures and in the real world.", "⭕", 1, 1, 8, 15, false),
  les("les-shapes-triangle-rect", "mod-math-shapes", "Triangles & Rectangles", "Identify triangles and rectangles and compare them to circles and squares.", "🔺", 2, 1, 8, 15, false),
  les("les-shapes-find-them", "mod-math-shapes", "Shape Hunt", "Go on a shape hunt — find circles, squares, triangles, and rectangles at home.", "🔍", 3, 1, 10, 20, false, true),

  // ── Math · Simple Patterns ─────────────────────────────────────────────
  les("les-patterns-ab", "mod-math-patterns", "AB Patterns", "Build and continue patterns like red-blue-red-blue.", "🔴", 1, 2, 8, 15, true),
  les("les-patterns-abc", "mod-math-patterns", "ABC Patterns", "Build and continue patterns like circle-square-triangle-circle-square-triangle.", "🟢", 2, 2, 10, 20, true),
  les("les-patterns-create", "mod-math-patterns", "Make Your Own Pattern", "Create an original pattern using stickers, stamps, or objects.", "🌈", 3, 2, 10, 20, true, true),

  // ── Daily Living · My Morning Routine ──────────────────────────────────
  les("les-morning-wake-up", "mod-daily-morning", "Time to Wake Up", "Follow the visual schedule: hear the alarm, stretch, and get out of bed.", "⏰", 1, 1, 5, 10, false),
  les("les-morning-get-dressed", "mod-daily-morning", "Getting Dressed", "Pick weather-appropriate clothes and practice the dressing sequence.", "👕", 2, 1, 8, 15, false),
  les("les-morning-breakfast", "mod-daily-morning", "Eating Breakfast", "Follow steps to prepare a simple breakfast and sit nicely to eat.", "🥣", 3, 1, 8, 15, false),

  // ── Daily Living · Healthy Hygiene Habits ──────────────────────────────
  les("les-hygiene-handwash", "mod-daily-hygiene", "Washing My Hands", "Follow the 6-step handwashing routine with soap and water.", "🧴", 1, 1, 5, 10, false),
  les("les-hygiene-teeth", "mod-daily-hygiene", "Brushing My Teeth", "Brush top teeth, bottom teeth, and tongue using a visual timer.", "🦷", 2, 1, 8, 15, false),
  les("les-hygiene-bathroom", "mod-daily-hygiene", "Using the Bathroom", "Follow the bathroom routine checklist step-by-step.", "🚽", 3, 1, 8, 15, false, true),

  // ── Daily Living · Mealtime Manners ────────────────────────────────────
  les("les-mealtime-set-table", "mod-daily-mealtime", "Setting the Table", "Put a plate, cup, fork, and napkin in the right spots.", "🍽️", 1, 2, 8, 15, true),
  les("les-mealtime-utensils", "mod-daily-mealtime", "Using Utensils", "Practice holding a fork and spoon to eat different foods.", "🥄", 2, 2, 10, 15, true),
  les("les-mealtime-cleanup", "mod-daily-mealtime", "Cleaning Up", "Carry your plate to the sink and wipe the table after eating.", "🧹", 3, 2, 8, 15, true),

  // ── Social Skills · Taking Turns ───────────────────────────────────────
  les("les-turns-my-turn", "mod-social-turn-taking", "My Turn, Your Turn", "Learn the words 'my turn' and 'your turn' while playing a simple game.", "🎲", 1, 1, 8, 15, false),
  les("les-turns-waiting", "mod-social-turn-taking", "Waiting Nicely", "Practice waiting without grabbing while a friend takes a turn.", "⏳", 2, 1, 8, 15, false),
  les("les-turns-sharing", "mod-social-turn-taking", "Sharing Toys", "Practice giving a toy to a friend and asking for a turn.", "🧸", 3, 1, 8, 15, false),

  // ── Social Skills · Reading Faces ──────────────────────────────────────
  les("les-faces-happy", "mod-social-emotions", "Happy Faces", "Look at photos and drawings of happy faces and describe what you see.", "😀", 1, 1, 8, 15, false),
  les("les-faces-sad-angry", "mod-social-emotions", "Sad & Angry Faces", "Spot the differences between sad faces and angry faces.", "😢", 2, 2, 8, 15, false),
  les("les-faces-surprised", "mod-social-emotions", "Surprised & Scared Faces", "Identify surprised and scared expressions and talk about what might cause them.", "😲", 3, 2, 8, 15, false),

  // ── Social Skills · Making Friends ─────────────────────────────────────
  les("les-friends-join-play", "mod-social-friendship", "Joining In", "Practice saying 'Can I play?' and waiting for an answer.", "🙋", 1, 2, 8, 15, true),
  les("les-friends-kind-words", "mod-social-friendship", "Kind Words", "Learn compliments like 'Nice job!' and 'I like your picture!'.", "💬", 2, 2, 8, 15, true),
  les("les-friends-helping", "mod-social-friendship", "Helping a Friend", "Notice when a friend needs help and offer to assist.", "🤲", 3, 2, 10, 20, true),

  // ── Fine Motor · Tracing Lines & Curves ────────────────────────────────
  les("les-tracing-straight", "mod-motor-tracing", "Straight Lines", "Trace horizontal and vertical straight lines from dot to dot.", "➖", 1, 1, 8, 15, true),
  les("les-tracing-curves", "mod-motor-tracing", "Curvy Lines", "Trace gentle curves and wavy lines to build hand control.", "〰️", 2, 1, 8, 15, true),
  les("les-tracing-zigzag", "mod-motor-tracing", "Zigzag Lines", "Trace zigzag and diagonal lines that prepare you for letter writing.", "⚡", 3, 2, 10, 20, true),

  // ── Fine Motor · Simple Puzzles ────────────────────────────────────────
  les("les-puzzles-4piece", "mod-motor-puzzles", "4-Piece Puzzles", "Complete friendly animal puzzles with 4 large pieces.", "🐱", 1, 1, 8, 15, true),
  les("les-puzzles-6piece", "mod-motor-puzzles", "6-Piece Puzzles", "Put together nature scene puzzles with 6 pieces.", "🌻", 2, 2, 10, 20, true),
  les("les-puzzles-9piece", "mod-motor-puzzles", "9-Piece Puzzles", "Challenge yourself with 9-piece puzzles of vehicles and buildings.", "🚗", 3, 2, 10, 20, true),

  // ── Fine Motor · Sort & Classify ───────────────────────────────────────
  les("les-sorting-colors", "mod-motor-sorting", "Sort by Color", "Drag items into the correct color group — red, blue, yellow, green.", "🎨", 1, 1, 8, 15, true),
  les("les-sorting-shapes", "mod-motor-sorting", "Sort by Shape", "Place each shape into the matching shape bucket.", "🔷", 2, 2, 8, 15, true),
  les("les-sorting-size", "mod-motor-sorting", "Sort by Size", "Arrange objects from smallest to biggest or biggest to smallest.", "📏", 3, 2, 10, 20, true),

  // ── Creative · Calm Coloring ───────────────────────────────────────────
  les("les-coloring-animals", "mod-creative-coloring", "Friendly Animals", "Color a gentle cat, dog, or bunny using your favorite colors.", "🐶", 1, 1, 10, 15, true),
  les("les-coloring-nature", "mod-creative-coloring", "Nature Scenes", "Color trees, flowers, and a bright sun in a peaceful garden.", "🌳", 2, 1, 10, 15, true),
  les("les-coloring-under-sea", "mod-creative-coloring", "Under the Sea", "Color friendly fish, starfish, and bubbles in an ocean scene.", "🐠", 3, 1, 10, 15, true),

  // ── Creative · Music & Movement ────────────────────────────────────────
  les("les-music-clap-along", "mod-creative-music", "Clap Along", "Listen to a simple beat and clap your hands to match the rhythm.", "👏", 1, 1, 8, 10, true),
  les("les-music-freeze-dance", "mod-creative-music", "Freeze Dance", "Dance when the music plays and freeze like a statue when it stops!", "🕺", 2, 1, 8, 10, true),
  les("les-music-instruments", "mod-creative-music", "Make Some Music", "Tap, shake, and strum virtual instruments to create your own song.", "🥁", 3, 1, 10, 15, true),

  // ── Creative · Sensory Exploration ─────────────────────────────────────
  les("les-sensory-textures", "mod-creative-sensory", "Touch & Feel", "Explore smooth, bumpy, soft, and rough textures on screen and with real objects.", "🧸", 1, 1, 8, 10, true, true),
  les("les-sensory-sounds", "mod-creative-sensory", "Calming Sounds", "Listen to rain, ocean waves, and birds. Pick the sound that feels best.", "🌊", 2, 1, 8, 10, true),
  les("les-sensory-visuals", "mod-creative-sensory", "Gentle Lights", "Watch slow-moving colors and shapes designed to soothe and relax.", "🌈", 3, 1, 8, 10, true),
];

// ---------------------------------------------------------------------------
// Activities (126+ — at least 2 per lesson)
// ---------------------------------------------------------------------------

export const SEED_ACTIVITIES: SeedActivity[] = [
  // ── Communication · Expressing Basic Needs ─────────────────────────────

  // I Want Water
  act("act-water-tap", "les-basic-needs-water", "Tap for Water", "Tap the correct picture card to request water.", "💧", 1, 1, 3, 5, "tap_correct", "Look at the picture cards. Tap the one that shows a glass of water to ask for a drink.", false, { aac_support: true }),
  act("act-water-speak", "les-basic-needs-water", "Say 'Water Please'", "Practice saying or tapping 'water please' on the AAC board.", "🗣️", 2, 1, 3, 5, "speak_tap_aac", "Press the 'water' button, then press 'please'. Great job asking nicely!", false, { aac_support: true }),

  // I Need Help
  act("act-help-match", "les-basic-needs-help", "Match the Help Sign", "Match the 'help' picture card to the correct situation.", "🆘", 1, 1, 3, 5, "visual_matching", "Look at each picture. Which child needs help? Drag the 'help' card to the right picture.", false, { aac_support: true }),
  act("act-help-aac", "les-basic-needs-help", "Ask for Help", "Use the AAC board to say 'I need help' in a pretend situation.", "🙋", 2, 1, 3, 5, "speak_tap_aac", "Oh no, the blocks fell down! Press 'I' then 'need' then 'help' to ask a grown-up.", false, { aac_support: true }),

  // I Need a Break
  act("act-break-tap", "les-basic-needs-break", "Tap for a Break", "Choose the 'break' card when you feel overwhelmed.", "⏸️", 1, 1, 3, 5, "tap_correct", "When things feel too much, you can ask for a break. Tap the card that shows a quiet space.", false, { aac_support: true }),
  act("act-break-sequence", "les-basic-needs-break", "Break Routine", "Put the break-time steps in order: ask, go to quiet spot, breathe, come back.", "🔢", 2, 1, 3, 5, "sequencing", "Put these steps in order: 1) Ask for a break 2) Go to your quiet spot 3) Take deep breaths 4) Come back when ready.", false),

  // ── Communication · Naming My Feelings ─────────────────────────────────

  // Happy & Sad
  act("act-happy-sad-match", "les-feelings-happy-sad", "Match the Feeling", "Match happy and sad face cards to the correct situation pictures.", "😊", 1, 1, 4, 8, "visual_matching", "Look at each picture. Is the child happy or sad? Drag the right face to each picture.", false),
  act("act-happy-sad-tap", "les-feelings-happy-sad", "How Does She Feel?", "Look at a scene and tap whether the character is happy or sad.", "😢", 2, 1, 4, 7, "tap_correct", "The girl just got a present! Tap the face that shows how she feels — happy or sad?", false),

  // Angry & Scared
  act("act-angry-scared-listen", "les-feelings-angry-scared", "Listen & Choose", "Listen to a short story and choose whether the character feels angry or scared.", "😠", 1, 2, 4, 8, "listen_choose", "Listen carefully to the story. When it's done, tap the face that matches how the boy feels.", false, { audio_cue: "audio/feelings-angry-scared-story.mp3" }),
  act("act-angry-scared-calm", "les-feelings-angry-scared", "Calm Down Steps", "Put calming-down steps in order when feeling angry or scared.", "🧘", 2, 2, 4, 7, "sequencing", "When you feel angry or scared, try these steps in order: 1) Stop 2) Take 3 breaths 3) Count to 5 4) Tell a grown-up.", false),

  // Feeling Calm
  act("act-calm-breathe", "les-feelings-calm", "Breathing Buddy", "Follow the expanding circle to take slow, calming breaths.", "🌬️", 1, 1, 4, 8, "parent_guided", "Breathe in as the circle gets bigger. Breathe out as it gets smaller. Do this 5 times with a grown-up.", false, { requires_parent_help: true }),
  act("act-calm-identify", "les-feelings-calm", "Spot the Calm Face", "Pick the calm face from a group of emotion faces.", "😌", 2, 1, 3, 7, "tap_correct", "Look at all the faces. Which one looks calm and relaxed? Tap it!", false),

  // ── Communication · Greetings & Goodbyes ───────────────────────────────

  // Saying Hello
  act("act-hello-tap", "les-greetings-hello", "Wave Hello", "Tap the character who is saying hello.", "👋", 1, 1, 3, 5, "tap_correct", "Look at the playground. Tap the child who is waving hello to a friend.", false),
  act("act-hello-aac", "les-greetings-hello", "Say Hello", "Use the AAC board to greet someone.", "🗣️", 2, 1, 3, 5, "speak_tap_aac", "A new friend just arrived! Press 'Hello' on the board to greet them.", false, { aac_support: true }),

  // Saying Goodbye
  act("act-goodbye-sequence", "les-greetings-goodbye", "Goodbye Steps", "Put the goodbye routine in the right order.", "🤚", 1, 1, 3, 5, "sequencing", "When it is time to leave, put the steps in order: 1) Wave 2) Say 'Goodbye' 3) Smile.", false),
  act("act-goodbye-match", "les-greetings-goodbye", "Match Goodbye Scenes", "Match each goodbye picture to the right setting — school, park, store.", "🏫", 2, 1, 3, 5, "visual_matching", "Where is each child saying goodbye? Drag each picture to the right place — school, park, or store.", false),

  // Please & Thank You
  act("act-please-tap", "les-greetings-please-thanks", "Say Please", "Tap 'please' at the right moment in a short scene.", "🙏", 1, 1, 3, 5, "tap_correct", "The boy wants a cookie. Tap the word he should say to ask nicely. Hint: it starts with P!", false),
  act("act-thanks-aac", "les-greetings-please-thanks", "Say Thank You", "Use the AAC board to say 'thank you' after receiving something.", "💛", 2, 1, 3, 5, "speak_tap_aac", "The teacher gave you a sticker! Press 'Thank' then 'you' on the board.", false, { aac_support: true }),

  // ── Reading/Language · Letter Recognition ──────────────────────────────

  // Letters A, B, C
  act("act-abc-match", "les-letter-id-abc", "Match A, B, C", "Match uppercase letters to their lowercase partners.", "🅰️", 1, 1, 4, 8, "visual_matching", "Drag each big letter to its matching small letter: A→a, B→b, C→c.", false),
  act("act-abc-trace", "les-letter-id-abc", "Trace A, B, C", "Trace each letter by following the dotted lines with your finger.", "✏️", 2, 1, 4, 7, "trace", "Put your finger on the green dot and follow the arrows to trace the letter A. Then do B and C!", false),

  // Letters D, E, F
  act("act-def-match", "les-letter-id-def", "Match D, E, F", "Match uppercase D, E, F to their lowercase forms.", "🔤", 1, 1, 4, 8, "visual_matching", "Drag each big letter to its matching small letter: D→d, E→e, F→f.", false),
  act("act-def-tap", "les-letter-id-def", "Find the Letter", "Tap the correct letter when you hear its name.", "👆", 2, 1, 4, 7, "listen_choose", "Listen! Which letter did you hear? Tap it on the screen.", false, { audio_cue: "audio/letters-def.mp3" }),

  // Letters G, H, I
  act("act-ghi-trace", "les-letter-id-ghi", "Trace G, H, I", "Trace each letter carefully along the dotted path.", "✏️", 1, 1, 4, 8, "trace", "Start at the green dot. Follow the arrows to trace G, then H, then I. Take your time!", false),
  act("act-ghi-match", "les-letter-id-ghi", "Match G, H, I", "Match uppercase G, H, I to their lowercase forms.", "🔠", 2, 1, 4, 7, "visual_matching", "Drag each big letter to its matching small letter: G→g, H→h, I→i.", false),

  // ── Reading/Language · Beginning Phonics ───────────────────────────────

  // Sounds: S, A, T
  act("act-sat-listen", "les-phonics-s-a-t", "Hear the Sound", "Listen to each letter sound and tap the matching letter.", "🔊", 1, 2, 5, 10, "listen_choose", "Listen to the sound. Is it 'sss', 'aaa', or 'ttt'? Tap the right letter!", false, { audio_cue: "audio/phonics-sat.mp3" }),
  act("act-sat-blend", "les-phonics-s-a-t", "Blend 'sat'", "Put the sounds in order to make the word 'sat'.", "📖", 2, 2, 5, 10, "sequencing", "Put the letter sounds in order to make a word: s-a-t. Say each sound, then say the whole word: sat!", false),

  // Sounds: P, I, N
  act("act-pin-listen", "les-phonics-p-i-n", "Hear the Sound", "Listen and match each sound to the correct letter.", "🔊", 1, 2, 5, 10, "listen_choose", "Listen to the sound. Is it 'p', 'iii', or 'nnn'? Tap the right letter!", false, { audio_cue: "audio/phonics-pin.mp3" }),
  act("act-pin-blend", "les-phonics-p-i-n", "Blend 'pin'", "Put the sounds in order to spell 'pin'.", "📌", 2, 2, 5, 10, "sequencing", "Put the letter sounds in order: p-i-n. Say each sound, then say the whole word: pin!", false),

  // Sounds: C, O, G
  act("act-cog-listen", "les-phonics-c-o-g", "Hear the Sound", "Listen and identify the letter sounds C, O, G.", "🔊", 1, 2, 5, 10, "listen_choose", "Listen carefully. Which sound did you hear — 'c', 'ooo', or 'ggg'? Tap the right letter!", false, { audio_cue: "audio/phonics-cog.mp3" }),
  act("act-cog-blend", "les-phonics-c-o-g", "Blend 'cog'", "Sequence the sounds to form the word 'cog'.", "⚙️", 2, 2, 5, 10, "sequencing", "Put the letter sounds in order: c-o-g. Say each sound, then blend them together: cog!", false),

  // ── Reading/Language · First Sight Words ───────────────────────────────

  // Words: the, is
  act("act-the-is-match", "les-sight-the-is", "Find 'the' and 'is'", "Tap each time you see the word 'the' or 'is' in a sentence.", "👁️", 1, 2, 4, 8, "tap_correct", "Read the sentence slowly. Tap every time you see the word 'the' or 'is'. The cat is big.", true),
  act("act-the-is-trace", "les-sight-the-is", "Trace 'the' and 'is'", "Trace the sight words to help you remember them.", "✏️", 2, 2, 4, 7, "trace", "Trace the word 'the' by following the dotted letters. Then trace 'is'. Great reading!", true),

  // Words: and, it
  act("act-and-it-tap", "les-sight-and-it", "Spot 'and' & 'it'", "Tap the words 'and' and 'it' when they appear on screen.", "📝", 1, 2, 4, 8, "tap_correct", "Words will appear on the screen. Tap only the words 'and' or 'it'. Be quick!", true),
  act("act-and-it-listen", "les-sight-and-it", "Listen for 'and' & 'it'", "Listen to a sentence and tap the words 'and' or 'it'.", "🔊", 2, 2, 4, 7, "listen_choose", "Listen to the sentence. Then tap the sight words you heard — 'and' or 'it'.", true, { audio_cue: "audio/sight-and-it.mp3" }),

  // Words: can, we
  act("act-can-we-match", "les-sight-can-we", "Match Sentences", "Match the sentence to the picture using the words 'can' and 'we'.", "📗", 1, 2, 4, 8, "visual_matching", "Read each sentence with 'can' or 'we'. Drag it to the matching picture. 'We can run!'", true),
  act("act-can-we-trace", "les-sight-can-we", "Trace 'can' and 'we'", "Trace the words 'can' and 'we' to practice writing them.", "✏️", 2, 2, 4, 7, "trace", "Follow the dotted letters to trace 'can'. Then trace 'we'. You're becoming a great reader!", true),

  // ── Math · Counting 1–10 ───────────────────────────────────────────────

  // Counting 1, 2, 3
  act("act-count-123-tap", "les-counting-1-3", "Count & Tap", "Count the objects and tap the matching number.", "1️⃣", 1, 1, 4, 8, "tap_correct", "How many apples do you see? Count them carefully, then tap the number that matches.", false),
  act("act-count-123-match", "les-counting-1-3", "Match Groups", "Match a group of objects to the correct numeral.", "🔢", 2, 1, 4, 7, "visual_matching", "Drag each group of stars to the correct number — 1, 2, or 3.", false),

  // Counting 4, 5, 6
  act("act-count-456-tap", "les-counting-4-6", "Count & Tap", "Count the objects and tap the matching number.", "4️⃣", 1, 1, 4, 8, "tap_correct", "How many butterflies do you see? Count carefully, then tap 4, 5, or 6.", false),
  act("act-count-456-sequence", "les-counting-4-6", "Number Order", "Put the numbers 4, 5, 6 in order from smallest to biggest.", "🔢", 2, 1, 4, 7, "sequencing", "These numbers are mixed up! Drag them into order: 4, then 5, then 6.", false),

  // Counting 7 to 10
  act("act-count-710-tap", "les-counting-7-10", "Count & Tap", "Count larger groups and tap the correct number.", "🔟", 1, 2, 5, 10, "tap_correct", "How many fish are in the pond? Count them one by one, then tap the right number.", false),
  act("act-count-710-match", "les-counting-7-10", "Match Big Groups", "Match groups of 7–10 objects to the correct numeral.", "🐟", 2, 2, 5, 10, "visual_matching", "Drag each group of animals to the correct number: 7, 8, 9, or 10.", false),

  // ── Math · Shapes All Around ───────────────────────────────────────────

  // Circles & Squares
  act("act-circle-square-tap", "les-shapes-circle-square", "Find the Shape", "Tap all the circles, then tap all the squares in the picture.", "⭕", 1, 1, 4, 8, "tap_correct", "Look at the picture carefully. First tap all the circles you can find. Then tap all the squares!", false),
  act("act-circle-square-match", "les-shapes-circle-square", "Shape Match", "Match each shape to an object that looks like it — clock to circle, window to square.", "🔲", 2, 1, 4, 7, "visual_matching", "A clock looks like a circle. A window looks like a square. Drag each object to its shape!", false),

  // Triangles & Rectangles
  act("act-tri-rect-tap", "les-shapes-triangle-rect", "Find Triangles & Rectangles", "Tap the triangles and rectangles hiding in the playground scene.", "🔺", 1, 1, 4, 8, "tap_correct", "Look at the playground. Can you find the triangles on the roof? Tap them! Now find the rectangles.", false),
  act("act-tri-rect-sort", "les-shapes-triangle-rect", "Sort the Shapes", "Drag each shape into the triangle box or rectangle box.", "📦", 2, 1, 4, 7, "visual_matching", "Look at each shape. Is it a triangle or a rectangle? Drag it to the right box.", false),

  // Shape Hunt
  act("act-shape-hunt-checklist", "les-shapes-find-them", "Shape Hunt Checklist", "Find shapes around your home and check them off the list.", "🔍", 1, 1, 5, 10, "routine_checkoff", "Go on a shape hunt! Find something round, something square, something triangle-shaped, and something rectangular. Check each off when you find it!", false, { requires_parent_help: true }),
  act("act-shape-hunt-printable", "les-shapes-find-them", "Shape Hunt Sheet", "Print and complete a shape hunt activity sheet with a grown-up.", "🖨️", 2, 1, 5, 10, "printable", "Print this fun shape hunt sheet. Walk around your home with a grown-up and circle every shape you find!", false, { requires_parent_help: true }),

  // ── Math · Simple Patterns ─────────────────────────────────────────────

  // AB Patterns
  act("act-ab-sequence", "les-patterns-ab", "Continue the Pattern", "Drag the next item to continue the AB pattern.", "🔴", 1, 2, 4, 8, "sequencing", "Red, blue, red, blue… What comes next? Drag the right color to continue the pattern!", true),
  act("act-ab-tap", "les-patterns-ab", "Pick the Missing Piece", "One piece of the pattern is missing! Tap the correct one.", "🔵", 2, 2, 4, 7, "tap_correct", "Uh oh! Part of the pattern is missing. Red, blue, ___, blue. Tap the color that fills the gap.", true),

  // ABC Patterns
  act("act-abc-sequence", "les-patterns-abc", "Continue ABC Pattern", "Add the next shape to complete the ABC pattern.", "🟢", 1, 2, 5, 10, "sequencing", "Circle, square, triangle, circle, square… What comes next? Drag the right shape!", true),
  act("act-abc-match", "les-patterns-abc", "Match the Pattern", "Match each pattern strip to a description.", "🔷", 2, 2, 5, 10, "visual_matching", "Look at each pattern. Drag it to the label that describes it — AB or ABC.", true),

  // Make Your Own Pattern
  act("act-pattern-create-parent", "les-patterns-create", "Create with a Grown-Up", "Use real objects at home to build your very own pattern.", "🌈", 1, 2, 5, 10, "parent_guided", "Gather some toys or snacks with a grown-up. Make a pattern like car-block-car-block. Show your grown-up!", true, { requires_parent_help: true }),
  act("act-pattern-create-print", "les-patterns-create", "Pattern Printable", "Print a sheet and draw or stamp your own pattern.", "🖨️", 2, 2, 5, 10, "printable", "Print this pattern sheet. Use crayons or stamps to make your own patterns in each row!", true, { requires_parent_help: true }),

  // ── Daily Living · My Morning Routine ──────────────────────────────────

  // Time to Wake Up
  act("act-wakeup-sequence", "les-morning-wake-up", "Wake Up Steps", "Put the waking-up steps in order: hear alarm, stretch, sit up, stand.", "⏰", 1, 1, 3, 5, "sequencing", "What do you do first when you wake up? Put the steps in order: hear the alarm, stretch your arms, sit up, stand up!", false),
  act("act-wakeup-checkoff", "les-morning-wake-up", "Morning Check", "Check off each step as you do it in real life.", "✅", 2, 1, 3, 5, "routine_checkoff", "Time to wake up! Check off each step as you do it: ☐ Hear alarm ☐ Stretch ☐ Sit up ☐ Stand up.", false),

  // Getting Dressed
  act("act-dressed-sequence", "les-morning-get-dressed", "Dressing Order", "Put clothes on in the right order — underwear first, then shirt, pants, socks, shoes.", "👕", 1, 1, 4, 8, "sequencing", "What do you put on first? Drag the clothes into the right order to get dressed.", false),
  act("act-dressed-match", "les-morning-get-dressed", "Weather Clothes", "Match the right clothes to sunny, rainy, or cold weather.", "🌤️", 2, 1, 4, 7, "visual_matching", "Is it sunny, rainy, or cold? Drag the right clothes to the weather picture. Sunglasses for sunny days!", false),

  // Eating Breakfast
  act("act-breakfast-sequence", "les-morning-breakfast", "Breakfast Steps", "Put breakfast steps in order: get bowl, pour cereal, add milk, eat, clean up.", "🥣", 1, 1, 4, 8, "sequencing", "Let's make breakfast! Put the steps in order: get a bowl, pour cereal, add milk, eat up, then clean up.", false),
  act("act-breakfast-checkoff", "les-morning-breakfast", "Breakfast Checklist", "Check off each breakfast step as you do it at home.", "✅", 2, 1, 4, 7, "routine_checkoff", "Follow your breakfast checklist: ☐ Sit at the table ☐ Eat your food ☐ Drink your milk ☐ Wipe your mouth ☐ Put dishes in the sink.", false),

  // ── Daily Living · Healthy Hygiene Habits ──────────────────────────────

  // Washing My Hands
  act("act-handwash-sequence", "les-hygiene-handwash", "Handwashing Steps", "Put the 6 handwashing steps in order.", "🧴", 1, 1, 3, 5, "sequencing", "Put the handwashing steps in order: wet hands, add soap, scrub 20 seconds, rinse, turn off tap, dry hands.", false),
  act("act-handwash-checkoff", "les-hygiene-handwash", "Wash & Check", "Check off each handwashing step as you do it at the sink.", "✅", 2, 1, 3, 5, "routine_checkoff", "Go to the sink and wash your hands! Check off each step as you do it. Sing 'Happy Birthday' while you scrub!", false),

  // Brushing My Teeth
  act("act-teeth-sequence", "les-hygiene-teeth", "Brushing Steps", "Put the tooth-brushing steps in order.", "🦷", 1, 1, 4, 8, "sequencing", "Time to brush! Put the steps in order: put toothpaste on brush, brush top teeth, brush bottom teeth, brush tongue, rinse, spit.", false),
  act("act-teeth-tap", "les-hygiene-teeth", "Where to Brush?", "Tap each part of the mouth to brush — top, bottom, tongue.", "👆", 2, 1, 4, 7, "tap_correct", "Look at the picture of the mouth. Tap the top teeth to brush them first. Then tap bottom teeth. Then the tongue!", false),

  // Using the Bathroom
  act("act-bathroom-sequence", "les-hygiene-bathroom", "Bathroom Steps", "Put the bathroom routine in the right order.", "🚽", 1, 1, 4, 8, "sequencing", "Put the bathroom steps in order: go to bathroom, sit down, use toilet, wipe, flush, wash hands.", false, { requires_parent_help: true }),
  act("act-bathroom-checkoff", "les-hygiene-bathroom", "Bathroom Checklist", "Check off each step as you follow the bathroom routine.", "✅", 2, 1, 4, 7, "routine_checkoff", "Follow the bathroom checklist. Check off each step when you finish it. Don't forget to wash your hands!", false, { requires_parent_help: true }),

  // ── Daily Living · Mealtime Manners ────────────────────────────────────

  // Setting the Table
  act("act-set-table-match", "les-mealtime-set-table", "Place the Items", "Drag each item to its correct spot on the table — plate in the middle, fork on the left, cup on the right.", "🍽️", 1, 2, 4, 8, "visual_matching", "Where does each item go? Drag the plate to the middle, the fork to the left, the cup to the right, and the napkin beside the fork.", true),
  act("act-set-table-checkoff", "les-mealtime-set-table", "Set the Real Table", "Set a real table and check off each item as you place it.", "✅", 2, 2, 4, 7, "routine_checkoff", "Help set the real table! Check off: ☐ Plate ☐ Fork ☐ Cup ☐ Napkin. Ask a grown-up if you need help.", true, { requires_parent_help: true }),

  // Using Utensils
  act("act-utensils-tap", "les-mealtime-utensils", "Pick the Right Tool", "Look at the food and tap the correct utensil — fork for pasta, spoon for soup.", "🥄", 1, 2, 5, 8, "tap_correct", "What do you use to eat soup — a fork or a spoon? Tap the right utensil for each food!", true),
  act("act-utensils-parent", "les-mealtime-utensils", "Practice with a Grown-Up", "Practice holding a fork and spoon with a grown-up during a meal.", "👨‍👧", 2, 2, 5, 7, "parent_guided", "At your next meal, practice holding your fork like a pencil. Ask your grown-up to show you first, then try it yourself!", true, { requires_parent_help: true }),

  // Cleaning Up
  act("act-cleanup-sequence", "les-mealtime-cleanup", "Clean-Up Steps", "Put the after-meal steps in order.", "🧹", 1, 2, 4, 8, "sequencing", "Meal is done! Put the steps in order: pick up your plate, carry it to the sink, wipe the table, push in your chair.", true),
  act("act-cleanup-checkoff", "les-mealtime-cleanup", "Clean-Up Checklist", "Check off each step as you tidy up after a real meal.", "✅", 2, 2, 4, 7, "routine_checkoff", "Time to clean up! Check off: ☐ Plate to sink ☐ Cup to sink ☐ Wipe table ☐ Push in chair. You're such a great helper!", true),

  // ── Social Skills · Taking Turns ───────────────────────────────────────

  // My Turn, Your Turn
  act("act-turn-tap", "les-turns-my-turn", "Whose Turn?", "Watch the animation and tap 'my turn' or 'your turn' at the right time.", "🎲", 1, 1, 4, 8, "tap_correct", "Two friends are playing a board game. Watch carefully — when the arrow points to you, tap 'my turn'. When it points to your friend, tap 'your turn'.", false),
  act("act-turn-aac", "les-turns-my-turn", "Say My Turn", "Use the AAC board to say 'my turn' or 'your turn'.", "🗣️", 2, 1, 4, 7, "speak_tap_aac", "It's time to play! Press 'my turn' when it's your go. Press 'your turn' to let your friend go.", false, { aac_support: true }),

  // Waiting Nicely
  act("act-waiting-tap", "les-turns-waiting", "Good Waiting", "Tap the child who is waiting nicely — hands in lap, body still.", "⏳", 1, 1, 4, 8, "tap_correct", "Look at the two children. One is waiting nicely with hands in their lap. The other is grabbing. Tap the child who is waiting nicely!", false),
  act("act-waiting-sequence", "les-turns-waiting", "Waiting Steps", "Put the waiting steps in order: hands down, count to 5, breathe, wait for your name.", "🔢", 2, 1, 4, 7, "sequencing", "When you need to wait, follow these steps. Put them in order: put hands in your lap, take a deep breath, count to 5 quietly, wait until you hear your name.", false),

  // Sharing Toys
  act("act-sharing-match", "les-turns-sharing", "Sharing Scenes", "Match each sharing action to the right picture.", "🧸", 1, 1, 4, 8, "visual_matching", "Look at each picture. Drag the sharing action to the matching scene: giving a toy, asking 'Can I have a turn?', saying 'Here you go!'", false),
  act("act-sharing-parent", "les-turns-sharing", "Practice Sharing", "Play a sharing game with a grown-up or sibling at home.", "👨‍👧", 2, 1, 4, 7, "parent_guided", "Pick a toy to share with someone at home. Practice saying 'Would you like a turn?' and 'Here you go!' Take turns for 5 minutes.", false, { requires_parent_help: true }),

  // ── Social Skills · Reading Faces ──────────────────────────────────────

  // Happy Faces
  act("act-happy-faces-tap", "les-faces-happy", "Find the Happy Face", "Look at several faces and tap all the happy ones.", "😀", 1, 1, 4, 8, "tap_correct", "Look at all the faces. Some are happy and some are not. Tap every face that looks happy! Look for big smiles and bright eyes.", false),
  act("act-happy-faces-match", "les-faces-happy", "What Makes Us Happy?", "Match happy faces to things that might make someone happy — presents, hugs, playing.", "🎁", 2, 1, 4, 7, "visual_matching", "Why is each person happy? Drag the happy face to the picture that shows what made them smile — a present, a hug, or playing with friends.", false),

  // Sad & Angry Faces
  act("act-sad-angry-tap", "les-faces-sad-angry", "Sad or Angry?", "Look at each face and decide if it's sad or angry.", "😢", 1, 2, 4, 8, "tap_correct", "Is this face sad or angry? Look at the mouth and eyebrows for clues. Tap 'sad' or 'angry' for each face.", false),
  act("act-sad-angry-listen", "les-faces-sad-angry", "Hear the Feeling", "Listen to a voice and decide if the speaker sounds sad or angry.", "🔊", 2, 2, 4, 7, "listen_choose", "Listen to how the person is talking. Do they sound sad or angry? Tap the matching face.", false, { audio_cue: "audio/emotions-sad-angry.mp3" }),

  // Surprised & Scared Faces
  act("act-surprised-scared-tap", "les-faces-surprised", "Surprised or Scared?", "Look at faces with wide eyes and decide if they are surprised or scared.", "😲", 1, 2, 4, 8, "tap_correct", "Both surprised and scared faces have wide eyes! Look closely at the mouth. Tap 'surprised' or 'scared' for each face.", false),
  act("act-surprised-scared-match", "les-faces-surprised", "Match the Situation", "Match each face to a situation — surprise party or thunder storm.", "⚡", 2, 2, 4, 7, "visual_matching", "Drag the surprised face to the surprise party picture. Drag the scared face to the thunderstorm picture. Great detective work!", false),

  // ── Social Skills · Making Friends ─────────────────────────────────────

  // Joining In
  act("act-join-listen", "les-friends-join-play", "Listen & Choose", "Listen to a scene and choose the best way to join in.", "🙋", 1, 2, 4, 8, "listen_choose", "Some children are playing with blocks. Listen to the choices. Tap the best way to join: A) Grab the blocks B) Say 'Can I play?' C) Walk away.", true, { audio_cue: "audio/joining-in.mp3" }),
  act("act-join-sequence", "les-friends-join-play", "Joining Steps", "Put the steps for joining play in order.", "🔢", 2, 2, 4, 7, "sequencing", "Put the steps in order: 1) Walk over 2) Watch for a moment 3) Say 'Can I play?' 4) Wait for an answer 5) Join in!", true),

  // Kind Words
  act("act-kind-tap", "les-friends-kind-words", "Pick the Kind Words", "Tap the kind words and avoid the unkind ones.", "💬", 1, 2, 4, 8, "tap_correct", "Words will appear on screen. Tap the kind words like 'Great job!' and 'I like your picture!' Don't tap unkind words.", true),
  act("act-kind-aac", "les-friends-kind-words", "Say Something Kind", "Use the AAC board to give a compliment.", "🗣️", 2, 2, 4, 7, "speak_tap_aac", "Your friend drew a picture! Press words on the board to say something kind, like 'I' 'like' 'your' 'picture'.", true, { aac_support: true }),

  // Helping a Friend
  act("act-helping-tap", "les-friends-helping", "Who Needs Help?", "Look at the scene and tap the friend who needs help.", "🤲", 1, 2, 5, 10, "tap_correct", "Look at the playground. One friend dropped their books. Another friend is having trouble reaching something. Tap the friend who needs help first!", true),
  act("act-helping-parent", "les-friends-helping", "Practice Helping", "Do a helping activity at home with a grown-up.", "👨‍👧", 2, 2, 5, 10, "parent_guided", "With a grown-up, find three ways to help at home today — maybe carry groceries, pick up toys, or hold the door. Check off each one!", true, { requires_parent_help: true }),

  // ── Fine Motor · Tracing Lines & Curves ────────────────────────────────

  // Straight Lines
  act("act-straight-horiz", "les-tracing-straight", "Trace Across", "Trace a horizontal line from the bee to the flower.", "➡️", 1, 1, 4, 8, "trace", "Help the bee reach the flower! Put your finger on the bee and trace the straight line all the way to the flower.", true),
  act("act-straight-vert", "les-tracing-straight", "Trace Down", "Trace a vertical line from the rain cloud to the puddle.", "⬇️", 2, 1, 4, 7, "trace", "Make the rain fall! Put your finger on the cloud and trace straight down to the puddle.", true),

  // Curvy Lines
  act("act-curves-wave", "les-tracing-curves", "Trace the Wave", "Trace a gentle wavy line across the ocean.", "🌊", 1, 1, 4, 8, "trace", "Trace the gentle ocean wave from one side to the other. Follow the dotted line slowly and carefully.", true),
  act("act-curves-hill", "les-tracing-curves", "Over the Hills", "Trace the bumpy hills from the house to the school.", "⛰️", 2, 1, 4, 7, "trace", "Help the bus drive over the hills! Trace the curvy road from the house to the school.", true),

  // Zigzag Lines
  act("act-zigzag-mountain", "les-tracing-zigzag", "Mountain Zigzag", "Trace a zigzag path over the mountain tops.", "⚡", 1, 2, 5, 10, "trace", "Trace the zigzag path over the pointy mountains. Go up, then down, then up, then down!", true),
  act("act-zigzag-fence", "les-tracing-zigzag", "Fence Pattern", "Trace the zigzag pattern along the top of a fence.", "🏡", 2, 2, 5, 10, "trace", "Draw the zigzag pattern along the top of the fence. Start at the green dot and follow the arrows carefully.", true),

  // ── Fine Motor · Simple Puzzles ────────────────────────────────────────

  // 4-Piece Puzzles
  act("act-4puzzle-cat", "les-puzzles-4piece", "Cat Puzzle", "Complete the friendly cat picture by dragging 4 pieces into place.", "🐱", 1, 1, 4, 8, "visual_matching", "A cute cat picture is broken into 4 pieces. Drag each piece to the right spot to complete the picture!", true),
  act("act-4puzzle-dog", "les-puzzles-4piece", "Dog Puzzle", "Put together a happy dog picture with 4 puzzle pieces.", "🐶", 2, 1, 4, 7, "visual_matching", "What a friendly dog! Drag the 4 pieces into place to see the whole picture.", true),

  // 6-Piece Puzzles
  act("act-6puzzle-flower", "les-puzzles-6piece", "Flower Puzzle", "Assemble a bright flower image from 6 pieces.", "🌻", 1, 2, 5, 10, "visual_matching", "This beautiful flower is in 6 pieces. Drag each one to the right spot. Look at the colors for clues!", true),
  act("act-6puzzle-tree", "les-puzzles-6piece", "Tree Puzzle", "Complete a big friendly tree from 6 puzzle pieces.", "🌳", 2, 2, 5, 10, "visual_matching", "Put the tree back together! Match the green leaves to the top and the brown trunk to the bottom.", true),

  // 9-Piece Puzzles
  act("act-9puzzle-car", "les-puzzles-9piece", "Car Puzzle", "Build a colorful car image from 9 pieces.", "🚗", 1, 2, 5, 10, "visual_matching", "This red car is broken into 9 pieces. Drag each piece carefully to rebuild the whole picture!", true),
  act("act-9puzzle-house", "les-puzzles-9piece", "House Puzzle", "Assemble a cozy house from 9 puzzle pieces.", "🏠", 2, 2, 5, 10, "visual_matching", "Put the house back together! Start with the corners and work your way in. You can do it!", true),

  // ── Fine Motor · Sort & Classify ───────────────────────────────────────

  // Sort by Color
  act("act-sort-color-drag", "les-sorting-colors", "Color Sorting", "Drag each object into the matching color bucket.", "🎨", 1, 1, 4, 8, "visual_matching", "Look at each item's color. Drag the red items to the red bucket, blue items to the blue bucket, and yellow items to the yellow bucket!", true),
  act("act-sort-color-tap", "les-sorting-colors", "Odd Color Out", "Tap the item that does not match the color group.", "👆", 2, 1, 4, 7, "tap_correct", "Look at the group of items. Most are the same color, but one is different. Tap the item that doesn't belong!", true),

  // Sort by Shape
  act("act-sort-shape-drag", "les-sorting-shapes", "Shape Sorting", "Drag each shape into the matching shape box.", "🔷", 1, 2, 4, 8, "visual_matching", "Look at each shape. Drag circles to the circle box and squares to the square box!", true),
  act("act-sort-shape-tap", "les-sorting-shapes", "Which Shape?", "Tap the shape that matches the label.", "👆", 2, 2, 4, 7, "tap_correct", "The label says 'triangle'. Tap all the triangles you can find among the shapes!", true),

  // Sort by Size
  act("act-sort-size-sequence", "les-sorting-size", "Smallest to Biggest", "Arrange animals from smallest to biggest.", "📏", 1, 2, 5, 10, "sequencing", "Put the animals in order from the smallest to the biggest: mouse, cat, dog, horse.", true),
  act("act-sort-size-tap", "les-sorting-size", "Pick the Biggest", "Tap the biggest object in each group.", "👆", 2, 2, 5, 10, "tap_correct", "Look at the group of objects. Which one is the biggest? Tap it! Then we'll try another group.", true),

  // ── Creative · Calm Coloring ───────────────────────────────────────────

  // Friendly Animals
  act("act-color-cat", "les-coloring-animals", "Color the Cat", "Choose colors and tap to fill in a friendly cat picture.", "🐱", 1, 1, 5, 8, "tap_correct", "Pick your favorite color from the palette, then tap each part of the cat to color it in. There's no wrong color — make it yours!", true),
  act("act-color-cat-print", "les-coloring-animals", "Print & Color Cat", "Print the cat coloring page and use real crayons.", "🖨️", 2, 1, 5, 7, "printable", "Print this friendly cat coloring page. Use your crayons or colored pencils to color it however you like!", true),

  // Nature Scenes
  act("act-color-garden", "les-coloring-nature", "Color the Garden", "Tap to color flowers, trees, and a bright sun.", "🌳", 1, 1, 5, 8, "tap_correct", "What color should the flowers be? Tap a color, then tap the flower to fill it in. Color the whole garden!", true),
  act("act-color-garden-print", "les-coloring-nature", "Print & Color Garden", "Print the garden scene and color it with real supplies.", "🖨️", 2, 1, 5, 7, "printable", "Print this peaceful garden scene. Color the trees green, the flowers any color you like, and make the sun bright yellow!", true),

  // Under the Sea
  act("act-color-fish", "les-coloring-under-sea", "Color the Fish", "Tap to color friendly fish and ocean creatures.", "🐠", 1, 1, 5, 8, "tap_correct", "The ocean needs some color! Pick your favorite colors and tap each fish and starfish to color them in.", true),
  act("act-color-fish-print", "les-coloring-under-sea", "Print & Color Ocean", "Print the underwater scene and color it at your desk.", "🖨️", 2, 1, 5, 7, "printable", "Print this underwater coloring page. Color the fish, the starfish, and the bubbles. What color is your favorite fish?", true),

  // ── Creative · Music & Movement ────────────────────────────────────────

  // Clap Along
  act("act-clap-listen", "les-music-clap-along", "Listen & Clap", "Listen to the beat and clap along in time.", "👏", 1, 1, 4, 5, "listen_choose", "Listen to the drum beat. Clap your hands every time you hear a beat. Can you keep up? Great rhythm!", true, { audio_cue: "audio/clap-beat.mp3" }),
  act("act-clap-tap", "les-music-clap-along", "Tap the Beat", "Tap the drum on screen to match the rhythm.", "🥁", 2, 1, 4, 5, "tap_correct", "Watch the bouncing ball. Tap the drum every time the ball bounces. Try to keep a steady beat!", true),

  // Freeze Dance
  act("act-freeze-listen", "les-music-freeze-dance", "Dance & Freeze", "Dance when you hear music. Freeze when it stops!", "🕺", 1, 1, 4, 5, "listen_choose", "Stand up and get ready! Dance when the music plays. When the music stops, FREEZE like a statue! Can you hold still?", true, { audio_cue: "audio/freeze-dance.mp3" }),
  act("act-freeze-tap", "les-music-freeze-dance", "Freeze Tap", "Tap the screen only when the music is playing.", "🎵", 2, 1, 4, 5, "tap_correct", "Tap the dancing star only when you hear music. When the music stops, lift your finger and freeze! Don't tap during silence.", true, { audio_cue: "audio/freeze-dance-tap.mp3" }),

  // Make Some Music
  act("act-instruments-tap", "les-music-instruments", "Play an Instrument", "Tap different instruments to hear their sounds.", "🎸", 1, 1, 5, 8, "tap_correct", "Tap each instrument to hear what it sounds like! Try the drum, the xylophone, and the tambourine. Which is your favorite?", true),
  act("act-instruments-parent", "les-music-instruments", "Kitchen Band", "Make instruments from kitchen items with a grown-up.", "🍳", 2, 1, 5, 7, "parent_guided", "With a grown-up, find things in the kitchen to make music — a pot and spoon drum, rice in a jar for a shaker. Play a song together!", true, { requires_parent_help: true }),

  // ── Creative · Sensory Exploration ─────────────────────────────────────

  // Touch & Feel
  act("act-textures-match", "les-sensory-textures", "Match Textures", "Match each texture word to the correct picture — smooth, bumpy, soft, rough.", "🧸", 1, 1, 4, 5, "visual_matching", "Drag each word to the matching picture: 'smooth' to the glass, 'bumpy' to the pinecone, 'soft' to the blanket, 'rough' to the sandpaper.", true, { requires_parent_help: true }),
  act("act-textures-parent", "les-sensory-textures", "Texture Hunt", "Find real objects with different textures around your home.", "🏠", 2, 1, 4, 5, "parent_guided", "With a grown-up, find something smooth, something bumpy, something soft, and something rough in your home. Talk about how each one feels!", true, { requires_parent_help: true }),

  // Calming Sounds
  act("act-sounds-listen", "les-sensory-sounds", "Pick Your Sound", "Listen to calming sounds and tap the one you like most.", "🌊", 1, 1, 4, 5, "listen_choose", "Listen to three calming sounds: rain, ocean waves, and birds singing. Tap the one that makes you feel the most relaxed.", true, { audio_cue: "audio/calming-sounds.mp3" }),
  act("act-sounds-tap", "les-sensory-sounds", "Sound or Silence", "Tap to play a calming sound. Tap again for quiet. Notice how each feels.", "🔇", 2, 1, 4, 5, "tap_correct", "Tap the speaker to hear a sound. Tap the moon for silence. Try each sound and each silence. Which feels better right now?", true),

  // Gentle Lights
  act("act-visuals-tap", "les-sensory-visuals", "Choose Your Light", "Tap to pick a gentle light pattern — slow bubbles, soft swirls, or twinkling stars.", "✨", 1, 1, 4, 5, "tap_correct", "Tap each option to see a gentle light show. Which one do you like? Tap your favorite and watch it for a while.", true),
  act("act-visuals-breathe", "les-sensory-visuals", "Breathe with the Light", "Watch the light grow and shrink. Breathe in as it grows. Breathe out as it shrinks.", "🌬️", 2, 1, 4, 5, "parent_guided", "Watch the glowing circle. Breathe in slowly as it gets bigger. Breathe out slowly as it gets smaller. Do this 5 times with a grown-up nearby.", true, { requires_parent_help: true }),
];


// ---------------------------------------------------------------------------
// Class-level filtering utilities
// ---------------------------------------------------------------------------

/**
 * Returns the order (1-based integer) of a class level, used for
 * cumulative-progression filtering. Lower order = earlier/foundational level.
 * Returns 0 if the class level is not found (no filtering restriction).
 */
export function getClassLevelOrder(classLevelId: string): number {
  const level = SEED_CLASS_LEVELS.find((cl) => cl.id === classLevelId);
  return level?.order ?? 0;
}

/**
 * Filters modules to those at or below the given class level.
 * This implements a cumulative learning model: higher-level learners can
 * still access foundational content.
 *
 * If classLevelId is null/undefined or not found in SEED_CLASS_LEVELS,
 * all modules are returned (no restriction).
 *
 * @param modules - The module list to filter
 * @param classLevelId - The learner's current class level ID
 */
export function filterModulesByClassLevel<
  T extends { class_level_id: string },
>(modules: T[], classLevelId: string | null | undefined): T[] {
  if (!classLevelId) return modules;
  const maxOrder = getClassLevelOrder(classLevelId);
  if (maxOrder === 0) return modules;
  return modules.filter((m) => getClassLevelOrder(m.class_level_id) <= maxOrder);
}
