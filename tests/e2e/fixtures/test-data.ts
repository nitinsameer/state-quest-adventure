/**
 * Test Data Fixtures
 * Constants and test data for all tests
 */

export const TEST_USERS = {
  newUser: {
    avatar: 0, // First avatar
    ageBand: "8-9",
    acceptAudio: false,
  },
  youngUser: {
    avatar: 1,
    ageBand: "3-5",
    acceptAudio: false,
  },
  olderUser: {
    avatar: 2,
    ageBand: "10-12",
    acceptAudio: false,
  },
};

export const TEST_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
];

export const EXPECTED_XP_VALUES = {
  perCard: 25,
  cardsPerState: 6,
  totalCardsXP: 150, // 25 * 6
  perQuizQuestion: 20,
  perFunFactQuestion: 25, // Fun fact is worth more
  stateCompletion: 100,
};

export const EXPECTED_QUIZ_FORMAT = {
  questionsFor_3_5: 3,
  questionsFor_6_7: 5,
  questionsFor_8_9: 7,
  questionsFor_10_12: 10,
  optionsPerQuestion: 4,
};

export const EXPECTED_BADGES_PER_STATE = {
  coreCount: 3, // monument, animal, explorer
  performanceCount: 6, // perfect-quiz, speed-demon, bookworm, first-try, streak-builder, master-learner
};

export const EXPECTED_CARDS = [
  { icon: "🏛️", title: "Capital" },
  { icon: "🗣️", title: "Language" },
  { icon: "🍽️", title: "Famous Food" },
  { icon: "🏰", title: "Places" },
  { icon: "🐘", title: "State Animal" },
  { icon: "💡", title: "Fun Fact" },
];

export const EXPECTED_ACHIEVEMENTS = {
  tier1: ["explorers-awakening", "reader", "quiz-starter", "stamp-collector", "fired-up"],
  tier2: [
    "five-explorer",
    "knowledge-keeper",
    "quiz-master",
    "artist",
    "week-warrior",
    "regional-champ",
  ],
  tier3: ["ten-champion", "master-reader", "quiz-legend", "unstoppable", "postcard-master"],
  tier4: ["india-conqueror", "level-master", "badge-collector", "world-guardian"],
};

export const EXPECTED_LEVELS = {
  xpPerLevel: 400,
  level1To2: 400,
  level2To3: 800,
  level3To4: 1200,
  level4To5: 1600,
};

export const EXPECTED_STAMP_TOTAL = 36;

export const EXPECTED_STATES_TOTAL = 36;

// LocalStorage keys
export const STORAGE_KEYS = {
  progress: "india-explorer:progress:v2",
  sound: "india-explorer:sound:v1",
  celebrated: "india-explorer:celebrated:v1",
  tutorialSeen: "india-explorer:tutorial-seen:v1",
  appVersion: "india-explorer:app-version",
};

// Expected timestamps format
export const TIMESTAMP_FORMATS = {
  dateOnly: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
  iso8601: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
};

// Test timeouts
export const TIMEOUTS = {
  short: 3000,
  normal: 5000,
  medium: 10000,
  long: 15000,
  verylang: 30000,
};

// Test URLs
export const TEST_URLS = {
  base: "http://localhost:5173",
  home: "/home",
  welcome: "/welcome",
  create: "/create",
  journey: "/journey",
  explorer: "/explorer",
  badges: "/badges",
  achievements: "/achievements",
  profile: "/me",
};
