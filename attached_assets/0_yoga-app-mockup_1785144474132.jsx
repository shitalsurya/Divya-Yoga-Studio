import React, { useState, useEffect } from "react";
import {
  Home as HomeIcon,
  Calendar,
  Activity,
  PlayCircle,
  User,
  ChevronLeft,
  Check,
  QrCode,
  Users,
  Gift,
  ShoppingBag,
  Clock,
  Flame,
  Pause,
  ChevronRight,
  Star,
  MapPin,
  Menu,
  MessageCircle,
  Lock,
  Sparkles,
  Copy,
  Share2,
  Award,
  Trophy,
  Wallet,
  Bell,
  Bookmark,
  CreditCard,
  ShieldCheck,
  FileText,
  Info,
  LogOut,
  ListChecks,
} from "lucide-react";

// ---- Design tokens — matched to Divya Yoga Studio's live site ----------
// L = the site's real theme: warm cream pages, deep forest-green accents,
//     gold "Recommended" highlights. Used for Home / Workshops / Practice / Library / Profile.
// D = the site's dark "Choose Your Preferred Time" section. Used only for
//     batch check-in / batch-switching screens, mirroring the real page.
const L = {
  bg: "#F5F0E3",
  surface: "#FBF8F0",
  ink: "#2A2118",
  inkSoft: "#8C8272",
  line: "#E7DFCB",
  green: "#3F5942",
  greenSoft: "#E3EADD",
  gold: "#C79A46",
  goldSoft: "#F3E7CC",
  danger: "#B5563E",
  whatsapp: "#25D366",
  white: "#FFFFFF",
};

const D = {
  bg: "#1B140E",
  surface: "#2A2019",
  cream: "#F3ECDE",
  muted: "#A6987F",
  line: "rgba(255,255,255,0.08)",
  gold: "#C79A46",
  goldSoft: "#3A2E17",
  offlineBg: "#465331",
  offlineText: "#DDE7C6",
  onlineBg: "#6B5323",
  onlineText: "#EBCF87",
  danger: "#C97A5E",
  white: "#FFFFFF",
};

// Local, network-free font stacks — no external fetch, so nothing here can
// be blocked by the artifact sandbox. Georgia/Times give the same warm,
// high-contrast serif feel as Playfair Display; the system UI sans stands
// in for Poppins.
const display = { fontFamily: "Georgia, 'Times New Roman', serif" };
const body = { fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" };

// ---- Real studio data (from ishika2323.github.io/index) -----------------
// Every batch is a mixed group — Weight Loss, PCOS, Prenatal & Fitness all
// practice together in the same slot, with personalised guidance.
const BATCHES = [
  { id: 1, time: "6:30 – 7:30 AM", slotKey: "6:30 AM", label: "Morning Batch", days: "Mon–Sat", mode: "Offline", spots: 4, total: 15 },
  { id: 2, time: "7:30 – 8:30 AM", slotKey: "7:30 AM", label: "Morning Batch", days: "Mon–Sat", mode: "Offline", spots: 3, total: 15 },
  { id: 3, time: "8:30 – 9:30 AM", slotKey: "8:30 AM", label: "Morning Batch", days: "Mon–Sat", mode: "Offline", spots: 6, total: 15 },
  { id: 4, time: "5:30 – 6:30 PM", slotKey: "5:30 PM", label: "Evening Batch", days: "Mon–Sat", mode: "Offline", spots: 0, total: 15 },
  { id: 5, time: "7:00 – 8:00 PM", slotKey: "7:00 PM", label: "Evening Online", days: "Mon–Sat", mode: "Online", spots: 11, total: 20 },
];

// Weekly exercise sequence per day/slot, from Archana's printed timetable.
const TIMETABLE = {
  Monday: { "6:30 AM": "Aerobics", "7:30 AM": "Surya Namaskar", "8:30 AM": "Chandra Namaskar", "5:30 PM": "Sanjeevan", "7:00 PM": "Aerobics" },
  Tuesday: { "6:30 AM": "Chandra Namaskar", "7:30 AM": "Aerobics", "8:30 AM": "Sanjeevan", "5:30 PM": "Surya Namaskar", "7:00 PM": "Chandra Namaskar" },
  Wednesday: { "6:30 AM": "Surya Namaskar", "7:30 AM": "Sanjeevan", "8:30 AM": "Aerobics", "5:30 PM": "Chandra Namaskar", "7:00 PM": "Sanjeevan" },
  Thursday: { "6:30 AM": "Sanjeevan", "7:30 AM": "Chandra Namaskar", "8:30 AM": "Surya Namaskar", "5:30 PM": "Aerobics", "7:00 PM": "Surya Namaskar" },
  Friday: { "6:30 AM": "Core (All Batches)", "7:30 AM": "Core (All Batches)", "8:30 AM": "Core (All Batches)", "5:30 PM": "Core (All Batches)", "7:00 PM": "Core (All Batches)" },
};

function todaysFocus(slotKey) {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const exercise = TIMETABLE[day]?.[slotKey];
  return { day, exercise };
}

const SPECIALISATIONS = ["Weight Loss", "PCOS", "Prenatal", "Fitness"];
const MODES = ["All", "Offline", "Online"];

// The logged-in member's own enrolled batch, and this week's attendance.
const ENROLLED_BATCH_ID = 2;
const WEEK_ATTENDANCE = [
  { d: "M", status: "attended" },
  { d: "T", status: "attended" },
  { d: "W", status: "missed" },
  { d: "T", status: "attended" },
  { d: "F", status: "today" },
  { d: "S", status: "upcoming" },
];

// =========================================================================
// MEMBERSHIP & STUDIO POLICIES — Profile tab data
// =========================================================================

const MEMBERSHIP = {
  plan: "Offline Batch · Morning",
  status: "Active",
  renewalDate: "4 Aug 2026",
  monthlyFee: 1200,
};

// Verbatim studio policies, supplied by the studio itself — displayed as-is
// in the Rules screen, not third-party content.
const STUDIO_RULES = [
  "Carry your own yoga mat, napkin, and water bottle",
  "Keep phones silent",
  "Fees paid in advance",
  "Non-refundable and non-transferable fees",
  "No carry-forward or missed class adjustments",
  "Payment window between 1st and 8th of every month",
  "Be punctual and check in before class",
  "Stay home when unwell",
  "Avoid eating two hours before class",
  "Inform instructor about injuries or health concerns",
  "No yoga during first three days of menstrual cycle",
  "Maintain silence before and after class",
  "No classes on Saturdays, Sundays, national holidays, and festivals",
];

const VIDEOS = [
  { id: 1, title: "Weight Loss Flow", tag: "Weight Loss", length: "30 min", progress: 100, completed: true },
  { id: 2, title: "PCOS Hormone Balance", tag: "PCOS", length: "35 min", progress: 40, completed: false },
  { id: 3, title: "Gentle Prenatal Flow", tag: "Prenatal", length: "25 min", progress: 100, completed: true },
  { id: 4, title: "Full Body Fitness", tag: "Fitness", length: "40 min", progress: 0, completed: false },
  { id: 5, title: "Weight Loss HIIT Yoga", tag: "Weight Loss", length: "20 min", progress: 20, completed: false },
  { id: 6, title: "Pranayama for PCOS", tag: "PCOS", length: "15 min", progress: 100, completed: true },
];

// =========================================================================
// LIBRARY TAB DATA — turns the catalog into a personalized learning hub:
// a rotating daily pick pool, multi-video programs, workshop tie-in
// content, and a library-specific consistency streak (independent of the
// batch-attendance streak used elsewhere in the app).
// =========================================================================

// A larger pool than we show at once — 2 are surfaced per day, rotating
// deterministically so "today's picks" feel curated rather than random.
const DAILY_PICK_POOL = [
  { id: 1, title: "5-Min Morning Pranayama", duration: "5 min", ic: "🌬️" },
  { id: 2, title: "10-Min Gentle Flow", duration: "10 min", ic: "🧘" },
  { id: 3, title: "Quick Hip Openers", duration: "8 min", ic: "🤸" },
  { id: 4, title: "Evening Wind-Down", duration: "12 min", ic: "🌙" },
  { id: 5, title: "Posture Reset", duration: "6 min", ic: "🪷" },
  { id: 6, title: "Energising Sun Breaths", duration: "7 min", ic: "🌅" },
];
function getDailyPracticePicks(count = 2) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((new Date() - start) / 86400000);
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push(DAILY_PICK_POOL[(dayOfYear + i) % DAILY_PICK_POOL.length]);
  }
  return picks;
}

// Multi-video "programs" — the course-like structure that drives
// completion rates far better than a flat video list.
const FEATURED_PROGRAMS = [
  { id: 1, title: "21-Day Weight Loss Program", ic: "🔥", tag: "Weight Loss", modulesCompleted: 6, modulesTotal: 21 },
  { id: 2, title: "PCOS Balance Program", ic: "🌸", tag: "PCOS", modulesCompleted: 2, modulesTotal: 14 },
  { id: 3, title: "Prenatal Wellness Program", ic: "🤰", tag: "Prenatal", modulesCompleted: 0, modulesTotal: 10 },
  { id: 4, title: "Flexibility Builder", ic: "🤸", tag: "Fitness", modulesCompleted: 4, modulesTotal: 12 },
];

// Companion videos tied to specific workshops — prep beforehand, recap
// afterward. workshopId maps back into WORKSHOPS below.
const WORKSHOP_COMPANION_CONTENT = [
  { id: 1, workshopId: 1, title: "Prep for Face Yoga Workshop", type: "Pre-workshop", duration: "5 min", ic: "🧖‍♀️" },
  { id: 2, workshopId: 4, title: "Pranayama Warm-Up", type: "Pre-workshop", duration: "6 min", ic: "🌬️" },
  { id: 3, workshopId: 3, title: "Yoga Nidra: Deepen Your Practice", type: "Post-workshop", duration: "10 min", ic: "🌙" },
];

// Library-specific consistency streak — watching/practicing from the
// library on consecutive days, separate from batch attendance.
const LEARNING_STREAK = { days: 5 };

// ---- Workshops — special, ticketed sessions distinct from daily batches.
// This is the data model the Workshops tab, Home preview card, and
// Workshop Detail screen all read from.
const WORKSHOPS = [
  {
    id: 1,
    title: "Face Yoga Workshop",
    ic: "🧖‍♀️",
    day: "Sunday",
    date: "26 Jul",
    time: "10:00 AM",
    duration: "90 min",
    instructor: "Archana ji",
    price: 499,
    seatsLeft: 18,
    seatsTotal: 30,
    category: "Beauty",
    recommendedFor: ["Fitness"],
    featured: true,
    benefits: ["Natural facial toning", "Improves circulation", "Reduces puffiness"],
    description:
      "A focused facial-yoga session using targeted holds and massage strokes to tone the muscles beneath the skin — no equipment, just breath and technique.",
    whatToBring: "A hand mirror, hair tie, and a clean face (no heavy makeup).",
    faq: [
      { q: "Is this suitable for beginners?", a: "Yes — every hold is demonstrated and adapted for first-timers." },
      { q: "Will I see results after one session?", a: "Most students feel a glow and lightness right away; visible toning builds with repeated practice." },
    ],
  },
  {
    id: 2,
    title: "Laghu Shankh Prakshalan",
    ic: "💧",
    day: "Saturday",
    date: "1 Aug",
    time: "7:00 AM",
    duration: "120 min",
    instructor: "Archana ji",
    price: 999,
    seatsLeft: 4,
    seatsTotal: 12,
    category: "Detox",
    recommendedFor: ["Weight Loss"],
    featured: false,
    benefits: ["Deep gut cleanse", "Better digestion", "Lightness and clarity"],
    description:
      "A traditional Hatha-yoga cleansing kriya combining warm saline water with specific asanas to gently clear and reset the digestive tract.",
    whatToBring: "Wear loose clothing and arrive on an empty stomach.",
    faq: [
      { q: "Do I need to prepare in advance?", a: "Avoid heavy meals the night before and come well rested." },
      { q: "Is it safe for everyone?", a: "Let Archana ji know about any digestive conditions before booking." },
    ],
  },
  {
    id: 3,
    title: "Yoga Nidra",
    ic: "🌙",
    day: "Wednesday",
    date: "5 Aug",
    time: "8:00 PM",
    duration: "45 min",
    instructor: "Archana ji",
    price: 349,
    seatsLeft: 9,
    seatsTotal: 20,
    category: "Relaxation",
    recommendedFor: ["Stress Relief"],
    featured: false,
    benefits: ["Deep rest", "Lower anxiety", "Better sleep"],
    description:
      "A guided lying-down meditation that walks the body through complete relaxation — often described as the equivalent of hours of sleep in 45 minutes.",
    whatToBring: "A mat, blanket, and eye pillow if you have one.",
    faq: [
      { q: "Will I fall asleep?", a: "That's fine — the guidance still works even if you drift off." },
      { q: "What should I wear?", a: "Warm, comfortable clothing, since the body cools down at rest." },
    ],
  },
  {
    id: 4,
    title: "Pranayama Masterclass",
    ic: "🌬️",
    day: "Friday",
    date: "7 Aug",
    time: "6:00 PM",
    duration: "60 min",
    instructor: "Archana ji",
    price: 449,
    seatsLeft: 7,
    seatsTotal: 15,
    category: "Breathwork",
    recommendedFor: ["Stress Relief", "Fitness"],
    featured: false,
    benefits: ["Calmer mind", "More energy", "Sharper focus"],
    description:
      "A structured session of classical breathing techniques — Nadi Shodhana, Bhastrika, and Ujjayi — building breath control and steadiness.",
    whatToBring: "A mat and a notebook for the practice sequence.",
    faq: [
      { q: "Any prerequisites?", a: "None — techniques are taught step by step from the basics." },
      { q: "Can I practice these daily?", a: "Yes, and Archana ji will share a home routine to follow." },
    ],
  },
  {
    id: 5,
    title: "Stress Relief Workshop",
    ic: "🌿",
    day: "Saturday",
    date: "8 Aug",
    time: "5:00 PM",
    duration: "75 min",
    instructor: "Archana ji",
    price: 599,
    seatsLeft: 0,
    seatsTotal: 15,
    category: "Stress Relief",
    recommendedFor: ["Stress Relief"],
    featured: false,
    benefits: ["Lower cortisol", "Emotional balance", "Release tension"],
    description:
      "A blend of restorative asana, breathwork, and guided reflection designed to unwind accumulated tension from the week.",
    whatToBring: "A mat and a journal.",
    faq: [{ q: "It's full — can I still join?", a: "Yes, join the waitlist and we'll message you if a seat opens." }],
  },
  {
    id: 6,
    title: "Meditation Intensive",
    ic: "🪷",
    day: "Sunday",
    date: "9 Aug",
    time: "9:00 AM",
    duration: "60 min",
    instructor: "Archana ji",
    price: 399,
    seatsLeft: 10,
    seatsTotal: 20,
    category: "Meditation",
    recommendedFor: ["Stress Relief"],
    featured: false,
    benefits: ["Sharper focus", "Inner calm", "A daily practice habit"],
    description:
      "An introduction to seated meditation techniques with guided practice, building toward a sustainable daily habit.",
    whatToBring: "A mat or cushion to sit on.",
    faq: [{ q: "I've never meditated before — okay?", a: "This session is built for beginners." }],
  },
];

// Nearest upcoming session — drives the Home preview card and the
// featured slot at the top of the Workshops tab.
const NEAREST_WORKSHOP = WORKSHOPS.reduce((a, b) => (b.featured ? b : a), WORKSHOPS[0]);

const RECOMMENDATION_TAGS = ["Weight Loss", "Stress Relief"];

// Premium, members-only recordings of past workshops.
const PAST_RECORDINGS = [
  { id: 1, title: "Face Yoga Recording", ic: "🧖‍♀️" },
  { id: 2, title: "Yoga Nidra Recording", ic: "🌙" },
  { id: 3, title: "Pranayama Recording", ic: "🌬️" },
];

// =========================================================================
// REFERRAL SYSTEM — data model, mock API, and analytics
//
// This file is plain JSX (no build-time TS checking), so the interfaces
// below are documented as JSDoc typedefs — they describe exactly the same
// shapes a .ts version of this file would export, and every mock object
// is written to satisfy its typedef. Swapping this file to .tsx later is
// just adding "interface" keywords in front of these comments.
// =========================================================================

/**
 * @typedef {Object} Referral
 * @property {number} id
 * @property {string} friendName
 * @property {"joined"|"pending"} status
 * @property {number} rewardAmount        - ₹ credited for this referral, 0 if pending
 * @property {string} invitedOn           - ISO date
 * @property {string|null} joinedOn       - ISO date, null if still pending
 */

/**
 * @typedef {Object} ReferralReward
 * @property {number} id
 * @property {string} label               - e.g. "₹300 Credit", "Free Workshop"
 * @property {"credit"|"workshop"|"membership"|"status"} type
 * @property {number} value               - ₹ value, or 0 for non-monetary rewards
 */

/**
 * @typedef {Object} ReferralWallet
 * @property {number} availableCredits    - ₹ redeemable now
 * @property {number} lifetimeCredits     - ₹ earned all-time
 */

/**
 * @typedef {Object} ReferralTransaction
 * @property {number} id
 * @property {string} label
 * @property {number} amount              - positive = earned, negative = redeemed
 * @property {string} date                - ISO date
 */

/**
 * @typedef {Object} ReferralCampaign
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} ic                  - emoji icon
 */

/**
 * @typedef {Object} ReferralMilestone
 * @property {number} id
 * @property {number} referralsRequired
 * @property {ReferralReward} reward
 * @property {"completed"|"in_progress"|"locked"} status
 */

/**
 * @typedef {Object} AchievementBadge
 * @property {number} id
 * @property {string} name
 * @property {string} ic                  - emoji icon
 * @property {boolean} earned
 * @property {string} requirement          - human-readable unlock condition
 */

// The signed-in member's referral identity — one code, one shareable link.
const REFERRAL_CODE = "SHITAL300";
const referralUrl = (code) => `https://divyayoga.app/ref/${code}`;

/** @type {ReferralWallet} */
const REFERRAL_WALLET = {
  availableCredits: 900,
  lifetimeCredits: 1500,
};

const REFERRAL_STATS = {
  totalReferrals: 8,
  successfulJoins: 5,
  pendingInvites: 3,
  creditsEarned: 1500,
};

/** @type {ReferralMilestone[]} */
const REFERRAL_MILESTONES = [
  { id: 1, referralsRequired: 1, reward: { id: 1, label: "₹300 Credit", type: "credit", value: 300 }, status: "completed" },
  { id: 2, referralsRequired: 3, reward: { id: 2, label: "Free Workshop", type: "workshop", value: 0 }, status: "completed" },
  { id: 3, referralsRequired: 5, reward: { id: 3, label: "1 Month Free Membership", type: "membership", value: 0 }, status: "in_progress" },
  { id: 4, referralsRequired: 10, reward: { id: 4, label: "VIP Wellness Member", type: "status", value: 0 }, status: "locked" },
];

/** @type {Referral[]} */
const REFERRAL_HISTORY = [
  { id: 1, friendName: "Priya Sharma", status: "joined", rewardAmount: 300, invitedOn: "2026-06-02", joinedOn: "2026-06-05" },
  { id: 2, friendName: "Neha Patel", status: "pending", rewardAmount: 0, invitedOn: "2026-07-10", joinedOn: null },
  { id: 3, friendName: "Rahul Mehta", status: "joined", rewardAmount: 300, invitedOn: "2026-05-20", joinedOn: "2026-05-24" },
];

/** @type {ReferralTransaction[]} */
const REFERRAL_TRANSACTIONS = [
  { id: 1, label: "Referral reward — Priya Sharma joined", amount: 300, date: "2026-06-05" },
  { id: 2, label: "Referral reward — Rahul Mehta joined", amount: 300, date: "2026-05-24" },
  { id: 3, label: "Applied to July membership renewal", amount: -300, date: "2026-06-28" },
  { id: 4, label: "Referral reward — 3rd successful referral bonus", amount: 300, date: "2026-05-24" },
];

/** @type {ReferralCampaign[]} */
const REFERRAL_CAMPAIGNS = [
  { id: 1, ic: "🧖‍♀️", title: "Refer 2 friends this month", description: "Get a free Face Yoga workshop." },
  { id: 2, ic: "🪷", title: "Refer 5 friends", description: "Unlock one month membership." },
];

/** @type {AchievementBadge[]} */
const ACHIEVEMENT_BADGES = [
  { id: 1, name: "First Referral", ic: "🌱", earned: true, requirement: "Refer your first friend" },
  { id: 2, name: "Wellness Ambassador", ic: "🧘", earned: true, requirement: "3 successful referrals" },
  { id: 3, name: "Community Builder", ic: "🤝", earned: true, requirement: "5 successful referrals" },
  { id: 4, name: "Yoga Influencer", ic: "✨", earned: false, requirement: "10 successful referrals" },
  { id: 5, name: "Gold Referrer", ic: "🏆", earned: false, requirement: "₹3,000 lifetime credits earned" },
];

// In-app notification events — a real build would push these from the
// backend when a referral event fires; here they just seed the UI.
const REFERRAL_NOTIFICATIONS = [
  { id: 1, text: "Your friend Priya joined. ₹300 credit has been added." },
  { id: 2, text: "Only 1 referral left to unlock a free workshop." },
  { id: 3, text: "You earned ₹300 referral credit." },
];

// ---- Analytics -----------------------------------------------------------
// Mock event tracker. In production this posts to the analytics pipeline;
// here it just logs, so every call site below is already wired for real
// tracking once a backend exists.
function trackEvent(name, payload = {}) {
  // eslint-disable-next-line no-console
  console.log("[analytics]", name, payload);
}

// ---- Share helpers ---------------------------------------------------
async function shareReferral({ code, channel }) {
  const url = referralUrl(code);
  const text = `I've been practicing at Divya Yoga Studio and thought you'd love it! Join with my code ${code} and we both get ₹300 credit: ${url}`;

  if (channel === "whatsapp") {
    trackEvent("referral_whatsapp_shared", { code });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({ title: "Join me at Divya Yoga Studio", text, url });
      trackEvent("referral_link_shared", { code, method: "native" });
      return;
    } catch (e) {
      // user cancelled the native share sheet — fall through to clipboard
    }
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(url);
  }
  trackEvent("referral_link_shared", { code, method: "clipboard" });
}

async function copyReferralCode(code) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(code);
  }
  trackEvent("referral_link_copied", { code });
}

// =========================================================================
// PUSH NOTIFICATION SYSTEM — data model
//
// This mockup runs in a browser artifact, so there is no real FCM device
// token or OS notification tray here. This section models the same
// architecture a production build would use (categories, copy, triggers,
// per-notification analytics + deep-link target) so the in-app Notification
// Center and Preferences screen below behave exactly like the real system
// would, minus the OS-level delivery. The companion React Native + FCM
// module (delivered as separate files) implements the real scheduling and
// push handling against this same data shape.
// =========================================================================

/**
 * @typedef {Object} NotificationCategory
 * @property {string} id
 * @property {string} label
 * @property {string} sub
 * @property {boolean} defaultEnabled
 */

/** @type {NotificationCategory[]} */
const NOTIFICATION_CATEGORIES = [
  { id: "classReminders", label: "Class Reminders", sub: "30 & 5 minute reminders before your batch", defaultEnabled: true },
  { id: "workshopUpdates", label: "Workshop Updates", sub: "New workshops, day-before and start-soon alerts", defaultEnabled: true },
  { id: "newVideos", label: "New Videos", sub: "New uploads and personalised recommendations", defaultEnabled: true },
  { id: "streakAchievements", label: "Streak & Achievements", sub: "Streak protection and badge unlocks", defaultEnabled: true },
  { id: "membershipReminders", label: "Membership Reminders", sub: "Renewal reminders before expiry", defaultEnabled: true },
  { id: "wellnessInspiration", label: "Wellness Inspiration", sub: "Today's Intention and gentle wellness tips", defaultEnabled: true },
  { id: "referralUpdates", label: "Referral Updates", sub: "Referral rewards and invite nudges", defaultEnabled: true },
];

/**
 * @typedef {Object} NotificationTemplate
 * @property {string} id
 * @property {string} category      - matches a NotificationCategory.id
 * @property {string} trigger       - human-readable scheduling condition
 * @property {string} ic            - emoji used as the notification icon
 * @property {string} title
 * @property {string} body
 * @property {string} action        - deep-link target: home | library | practice | profile | workshop | referral
 * @property {string} analyticsEvent
 */

// The full copy library — every notification moment from the spec, in the
// calm/encouraging voice the studio wants. The RN scheduler module reads
// straight from this same list.
const NOTIFICATION_COPY_LIBRARY = [
  { id: "class_30min", category: "classReminders", trigger: "30 minutes before class", ic: "🧘", title: "Your yoga session starts in 30 minutes", body: "Prepare your mat, water bottle, and take a few calming breaths.", action: "home", analyticsEvent: "class_reminder_opened" },
  { id: "class_5min", category: "classReminders", trigger: "5 minutes before class", ic: "🌿", title: "Class begins in 5 minutes", body: "It's time to begin today's practice.", action: "home", analyticsEvent: "class_reminder_opened" },
  { id: "class_missed", category: "classReminders", trigger: "7:00 PM if no check-in today", ic: "🌱", title: "We missed you today", body: "A short practice is waiting for you in the Library.", action: "library", analyticsEvent: "class_reminder_opened" },
  { id: "workshop_open", category: "workshopUpdates", trigger: "when registration opens", ic: "✨", title: "New Workshop Available", body: "Face Yoga Workshop registrations are now open.", action: "workshop", analyticsEvent: "workshop_notification_opened" },
  { id: "workshop_1day", category: "workshopUpdates", trigger: "1 day before workshop", ic: "🌸", title: "Workshop Reminder", body: "Your Face Yoga Workshop is tomorrow.", action: "workshop", analyticsEvent: "workshop_notification_opened" },
  { id: "workshop_1hr", category: "workshopUpdates", trigger: "1 hour before workshop", ic: "⏰", title: "Starting Soon", body: "Your workshop begins in 1 hour.", action: "workshop", analyticsEvent: "workshop_notification_opened" },
  { id: "video_new", category: "newVideos", trigger: "on new upload", ic: "🎥", title: "New Practice Added", body: "5-Min Morning Pranayama is now available.", action: "library", analyticsEvent: "video_notification_opened" },
  { id: "video_recommendation", category: "newVideos", trigger: "inactive for 2 days", ic: "🌿", title: "Recommended Practice", body: "A 10-minute guided session is waiting for you.", action: "library", analyticsEvent: "video_notification_opened" },
  { id: "video_continue", category: "newVideos", trigger: "progress > 30% and unfinished", ic: "▶", title: "Continue Your Practice", body: "Pick up where you left off.", action: "library", analyticsEvent: "video_notification_opened" },
  { id: "streak_protect", category: "streakAchievements", trigger: "8 PM, active streak, no check-in today", ic: "🔥", title: "Protect Your Streak", body: "Don't lose your 12-day streak.", action: "practice", analyticsEvent: "streak_notification_opened" },
  { id: "streak_achieved", category: "streakAchievements", trigger: "on new streak milestone", ic: "🎉", title: "Great Job", body: "Your streak is now 12 days.", action: "practice", analyticsEvent: "streak_notification_opened" },
  { id: "achievement_10day", category: "streakAchievements", trigger: "10-day streak reached", ic: "🏅", title: "Achievement Unlocked", body: "You earned the Consistency Champion badge.", action: "practice", analyticsEvent: "achievement_notification_opened" },
  { id: "achievement_25classes", category: "streakAchievements", trigger: "25 classes completed", ic: "🏆", title: "Achievement Unlocked", body: "You completed 25 yoga sessions.", action: "practice", analyticsEvent: "achievement_notification_opened" },
  { id: "achievement_workshop", category: "streakAchievements", trigger: "first workshop attended", ic: "🌸", title: "New Badge Earned", body: "You attended your first workshop.", action: "practice", analyticsEvent: "achievement_notification_opened" },
  { id: "wellness_intention", category: "wellnessInspiration", trigger: "daily at 7:00 AM", ic: "🌿", title: "Today's Intention", body: "Move with awareness and gratitude.", action: "home", analyticsEvent: "notification_opened" },
  { id: "wellness_tip", category: "wellnessInspiration", trigger: "occasional, optional", ic: "💡", title: "Wellness Tip", body: "Stay hydrated before and after practice.", action: "home", analyticsEvent: "notification_opened" },
  { id: "weekly_summary", category: "streakAchievements", trigger: "every Sunday at 7 PM", ic: "📊", title: "Your Week at Divya Yoga Studio", body: "You completed 4 of 5 classes this week.", action: "practice", analyticsEvent: "notification_opened" },
  { id: "membership_7day", category: "membershipReminders", trigger: "7 days before expiry", ic: "📅", title: "Membership Renewal Due", body: "Renew your membership before 4 Aug.", action: "profile", analyticsEvent: "renewal_notification_opened" },
  { id: "membership_3day", category: "membershipReminders", trigger: "3 days before expiry", ic: "⚠", title: "Membership Expiring Soon", body: "Your membership expires in 3 days.", action: "profile", analyticsEvent: "renewal_notification_opened" },
  { id: "membership_expired", category: "membershipReminders", trigger: "on expiry day", ic: "🚨", title: "Membership Expired", body: "Renew now to continue your yoga journey.", action: "profile", analyticsEvent: "renewal_notification_opened" },
  { id: "referral_success", category: "referralUpdates", trigger: "on successful referral", ic: "🎉", title: "Referral Successful", body: "You earned ₹300 referral reward.", action: "referral", analyticsEvent: "referral_notification_opened" },
  { id: "referral_motivation", category: "referralUpdates", trigger: "no referrals in 30 days", ic: "🎁", title: "Invite Friends & Earn", body: "Share your referral code and earn rewards.", action: "referral", analyticsEvent: "referral_notification_opened" },
];

// A small, already-arrived feed for the in-app Notification Center demo —
// one representative example per category, newest first.
const NOTIFICATION_FEED = [
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "class_30min"), feedId: 1, time: "6:00 AM" },
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "streak_protect"), feedId: 2, time: "8:00 PM" },
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "workshop_open"), feedId: 3, time: "Yesterday", workshopId: 1 },
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "video_new"), feedId: 4, time: "Yesterday" },
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "achievement_10day"), feedId: 5, time: "2 days ago" },
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "referral_success"), feedId: 6, time: "5 days ago" },
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "membership_7day"), feedId: 7, time: "3 days ago" },
  { ...NOTIFICATION_COPY_LIBRARY.find((n) => n.id === "wellness_intention"), feedId: 8, time: "7:00 AM" },
];

// =========================================================================
// HOME SCREEN ENGAGEMENT DATA — practice detail, live session, learning
// rails, and YouTube growth surfaces. Kept separate from the studio's core
// batch/workshop data above since this is presentation/marketing content.
// =========================================================================

// Extra detail per exercise type, layered onto the existing TIMETABLE/
// todaysFocus() lookup so "Today's Practice" can show duration, difficulty,
// and an intention line without duplicating the schedule itself.
const PRACTICE_DETAILS = {
  "Surya Namaskar": { duration: "60 Minutes", difficulty: "Beginner Friendly", intention: "Build energy, improve posture, and strengthen your core." },
  "Chandra Namaskar": { duration: "60 Minutes", difficulty: "All Levels", intention: "Cool the body, calm the mind, and improve flexibility." },
  "Sanjeevan": { duration: "60 Minutes", difficulty: "All Levels", intention: "Restore balance with slow, therapeutic movement." },
  "Aerobics": { duration: "60 Minutes", difficulty: "Beginner Friendly", intention: "Raise your heart rate and burn energy to start the day strong." },
  "Core (All Batches)": { duration: "60 Minutes", difficulty: "All Levels", intention: "Strengthen your core and improve overall stability." },
};
const DEFAULT_PRACTICE_DETAIL = { duration: "60 Minutes", difficulty: "Beginner Friendly", intention: "Move with intention and breathe with awareness today." };

function getTodaysPractice(slotKey) {
  const focus = todaysFocus(slotKey);
  const detail = PRACTICE_DETAILS[focus.exercise] || DEFAULT_PRACTICE_DETAIL;
  return { ...focus, ...detail };
}

// Mock video-call link for the day's live batch — a real build would fetch
// this per-batch from the backend.
const LIVE_CLASS_MEET_LINK = "https://meet.google.com/abc-defg-hij";

// Parses a "7:30 AM" style slot label into a Date for today, so the live
// session card can compute "starts in X minutes" / "Live Now" / "Completed".
function slotToTodayDate(slotKey) {
  const match = slotKey.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return null;
  let [, h, m, meridiem] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (meridiem.toUpperCase() === "PM" && h !== 12) h += 12;
  if (meridiem.toUpperCase() === "AM" && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function getLiveClassStatus(slotKey, durationMinutes = 60) {
  const start = slotToTodayDate(slotKey);
  if (!start) return { state: "upcoming", label: `Starts at ${slotKey}` };
  const now = new Date();
  const diffMin = (start.getTime() - now.getTime()) / 60000;
  if (diffMin > 15) return { state: "upcoming", label: `Starts at ${slotKey}` };
  if (diffMin > 0) return { state: "starting_soon", label: `Starts in ${Math.ceil(diffMin)} minutes` };
  if (diffMin > -durationMinutes) return { state: "live", label: "Live Now" };
  return { state: "completed", label: "Completed" };
}

// "Continue Learning" — last video the member was partway through.
const CONTINUE_WATCHING = {
  title: "Yoga for Lower Back Pain",
  progressPercent: 65,
  duration: "12 min",
  ic: "🧘‍♀️",
};

// "Recommended for You" rail — separate from the Library's full VIDEOS
// catalogue since this is a curated marketing rail on Home.
const RECOMMENDED_VIDEOS = [
  { id: 1, title: "Face Yoga Basics", length: "5 min", ic: "🧖‍♀️" },
  { id: 2, title: "Morning Stretch Routine", length: "10 min", ic: "🌅" },
  { id: 3, title: "Pranayama for Stress Relief", length: "8 min", ic: "🌬️" },
  { id: 4, title: "Yoga for Better Sleep", length: "12 min", ic: "🌙" },
];

// "Featured This Week" — drives YouTube views/subscribers from inside the app.
const FEATURED_YOUTUBE_VIDEO = {
  title: "5 Pranayama Mistakes Beginners Make",
  duration: "8 Minutes",
  views: "12.5K",
  youtubeUrl: "https://youtu.be/1Wef9gVjhkQ?si=B9z2ugBYcgTZIU_H",
  channelUrl: "https://www.youtube.com/@divyayogastudio?sub_confirmation=1",
};

// "From Archana ji" — a personal note/update from the instructor.
const ARCHANA_UPDATE = {
  label: "New Video Released",
  title: "Benefits of Laghu Shankh Prakshalan",
  description: "Learn how this cleansing practice supports digestive health and energy levels.",
  destination: "youtube",
  youtubeUrl: "https://youtu.be/9GfASuxcfpg?si=_-ustcNbsFGj9Qn7",
};

// Rotates daily — deterministic by day-of-year so it's stable for a given day.
const WELLNESS_TIPS = [
  "Drink warm water before practice.",
  "Spend 5 minutes on deep breathing today.",
  "Practice gratitude before sleeping.",
  "Roll your shoulders back — notice your posture right now.",
  "Put your phone down 30 minutes before bed tonight.",
];
function getDailyWellnessTip() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return WELLNESS_TIPS[dayOfYear % WELLNESS_TIPS.length];
}

// =========================================================================
// PRACTICE TAB DATA — the member's personal progress hub. Motivation and
// habit-formation surfaces, deliberately light on raw historical stats.
// =========================================================================

const WEEKLY_GOAL = { completed: 4, target: 5 };

// Gamified level system — computed from attendance, workshops, library
// consumption, and streaks in a real backend; hardcoded here for the mockup.
const PRACTICE_LEVELS = [
  { level: 1, label: "Beginner" },
  { level: 2, label: "Committed Practitioner" },
  { level: 3, label: "Dedicated Yogi" },
  { level: 4, label: "Wellness Champion" },
  { level: 5, label: "Master Practitioner" },
];
const CURRENT_LEVEL = PRACTICE_LEVELS[2]; // Level 3

const GOAL_JOURNEY = {
  goal: "Weight Loss",
  progress: 68,
  weeklyTarget: 5,
  monthlyTarget: 20,
};

const RECOMMENDED_PRACTICE = {
  title: "15-Min Morning Stretch",
  reason: "Recommended because you missed yesterday's mobility session.",
  duration: "15 Minutes",
  ic: "🌅",
};

// Continue Learning — mirrors Home's rail but scoped to the Practice tab,
// capped at 3 items per spec.
const CONTINUE_LEARNING_LIST = [
  { id: 1, title: "Yoga for Lower Back Pain", progressPercent: 65, duration: "12 min", ic: "🧘‍♀️" },
  { id: 2, title: "Pranayama for Stress Relief", progressPercent: 40, duration: "8 min", ic: "🌬️" },
  { id: 3, title: "Full Body Fitness", progressPercent: 20, duration: "40 min", ic: "💪" },
];

const PRACTICE_BADGES = [
  { id: 1, name: "First Week Complete", ic: "🏅", earned: true },
  { id: 2, name: "10-Day Streak", ic: "🏅", earned: true },
  { id: 3, name: "First Workshop Attended", ic: "🏅", earned: true },
  { id: 4, name: "Wellness Explorer", ic: "🏅", earned: true },
  { id: 5, name: "30-Day Streak", ic: "🏅", earned: false },
  { id: 6, name: "100 Classes Completed", ic: "🏅", earned: false },
];

const MONTHLY_INSIGHTS = [
  "You attended 18 sessions this month.",
  "Your consistency improved by 15%.",
  "You completed 4 more classes than last month.",
  "You are among the top 20% most consistent members.",
];

const PRACTICE_MILESTONES = [
  { id: 1, current: 12, target: 30, unit: "Days", unlock: "30-Day Consistency Badge" },
  { id: 2, current: 18, target: 50, unit: "Classes", unlock: "50 Classes Achievement" },
];

const REFLECTION_PROMPTS = [
  "How do you feel after today's practice?",
  "What improved this week?",
  "What is your intention for tomorrow?",
];

// Compact mock calendar for the current month — present / missed / workshop /
// upcoming, in the spirit of the studio's real attendance tracking.
function buildAttendanceCalendar() {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    let status = "upcoming";
    if (day < today) {
      if (day % 10 === 0) status = "workshop";
      else if (day % 6 === 0) status = "missed";
      else status = "present";
    } else if (day === today) {
      status = "today";
    }
    return { day, status };
  });
}
const ATTENDANCE_CALENDAR = buildAttendanceCalendar();

// ---- Small building blocks -------------------------------------------
function BreathRing({ size = 110, label, sub }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }} className="shrink-0">
      <style>{`
        @keyframes breatheOuter { 0%,100% { transform: scale(0.86); opacity: 0.35;} 50% { transform: scale(1); opacity: 0.7;} }
        @keyframes breatheInner { 0%,100% { transform: scale(0.94); } 50% { transform: scale(1.06); } }
      `}</style>
      <div style={{ position: "absolute", inset: 0, borderRadius: "9999px", background: L.green, animation: "breatheOuter 8s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: size * 0.16, borderRadius: "9999px", background: L.gold, animation: "breatheInner 8s ease-in-out infinite" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ ...display, color: L.ink, fontSize: size * 0.22, lineHeight: 1 }}>{label}</span>
        {sub && <span style={{ ...body, color: L.ink, fontSize: size * 0.09, opacity: 0.85 }}>{sub}</span>}
      </div>
    </div>
  );
}

function FakeQR({ dark }) {
  const cells = Array.from({ length: 49 }, (_, i) => [3, 10, 17, 24, 31, 38, 45, 6, 13, 20, 27, 34, 41, 48].includes(i) || i % 5 === 0 || i % 7 === 2);
  return (
    <div className="grid grid-cols-7 gap-[3px] p-3 rounded-xl" style={{ background: "#FFFFFF", width: 168, height: 168 }}>
      {cells.map((on, i) => (
        <div key={i} style={{ background: on ? "#241B12" : "transparent", borderRadius: 1 }} />
      ))}
    </div>
  );
}

function ModeBadge({ mode }) {
  const on = mode === "Online";
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs shrink-0"
      style={{ ...body, background: on ? D.onlineBg : D.offlineBg, color: on ? D.onlineText : D.offlineText, fontWeight: 600 }}
    >
      {mode}
    </span>
  );
}

function SeatBadge({ seatsLeft }) {
  const full = seatsLeft === 0;
  return (
    <span
      className="px-2 py-0.5 rounded-full shrink-0"
      style={{ ...body, fontSize: 10, fontWeight: 700, background: full ? "#F3E1DB" : L.greenSoft, color: full ? L.danger : L.green }}
    >
      {full ? "Waitlist" : `${seatsLeft} seats left`}
    </span>
  );
}

// Reusable prompt shown after a conversion moment (workshop booked, membership
// purchased) — the highest-intent point to ask for a referral.
function ReferralPromptCard({ text, onInvite, source }) {
  return (
    <div className="mt-6 rounded-2xl p-4 flex items-center gap-3" style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}>
      <div className="p-2.5 rounded-full shrink-0" style={{ background: L.gold }}>
        <Gift size={18} color="#FFFFFF" />
      </div>
      <div className="flex-1">
        <p style={{ ...body, color: L.ink, fontSize: 13, lineHeight: 1.4 }}>{text}</p>
      </div>
      <button
        onClick={() => {
          trackEvent(source === "workshop" ? "workshop_referral_click" : "membership_referral_click");
          onInvite();
        }}
        className="px-3 py-2 rounded-full shrink-0"
        style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600, fontSize: 12 }}
      >
        Invite Friends
      </button>
    </div>
  );
}

function DarkPageTitle({ eyebrow, title, onBack }) {
  return (
    <div className="px-5 pt-4 pb-3">
      {onBack && (
        <button onClick={onBack} className="mb-1 -ml-1 p-1 rounded-full" style={{ color: D.cream }}>
          <ChevronLeft size={20} />
        </button>
      )}
      {eyebrow && <p style={{ ...body, color: D.gold, fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>{eyebrow}</p>}
      <h1 style={{ ...display, color: D.cream, fontSize: 26, marginTop: 4 }}>{title}</h1>
    </div>
  );
}

function LightPageTitle({ eyebrow, title, subtitle, onBack }) {
  return (
    <div className="px-5 pt-4 pb-3">
      {onBack && (
        <button onClick={onBack} className="mb-1 -ml-1 p-1 rounded-full" style={{ color: L.ink }}>
          <ChevronLeft size={20} />
        </button>
      )}
      {eyebrow && <p style={{ ...body, color: L.green, fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>{eyebrow}</p>}
      <h1 style={{ ...display, color: L.ink, fontSize: 24, marginTop: 4 }}>{title}</h1>
      {subtitle && <p style={{ ...body, color: L.inkSoft, fontSize: 12.5, marginTop: 4, lineHeight: 1.4 }}>{subtitle}</p>}
    </div>
  );
}

function Chip({ theme = "light", active, children, onClick }) {
  const t = theme === "dark" ? D : L;
  const activeBg = theme === "dark" ? D.gold : L.green;
  const activeText = theme === "dark" ? "#241B12" : "#FFFFFF";
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-sm shrink-0 transition-colors"
      style={{
        ...body,
        background: active ? activeBg : t.surface,
        color: active ? activeText : (theme === "dark" ? D.muted : L.inkSoft),
        border: `1px solid ${active ? activeBg : t.line}`,
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

function CreamHeader({ onOpenNotifications, unreadCount = 0 }) {
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ background: L.bg, borderBottom: `1px solid ${L.line}` }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 18 }}>🧘‍♀️</span>
        <span>
          <span style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive", color: L.gold, fontSize: 19 }}>Archana's </span>
          <span style={{ ...display, color: L.ink, fontSize: 17 }}>Divya Yoga Studio</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onOpenNotifications} className="relative">
          <Bell size={19} color={L.ink} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
              style={{ width: 15, height: 15, background: L.danger, color: "#FFFFFF", fontSize: 9, fontWeight: 700 }}
            >
              {unreadCount}
            </span>
          )}
        </button>
        <Menu size={20} color={L.ink} />
      </div>
    </div>
  );
}

function Row({ icon: Icon, title, sub, tag, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
      <div className="p-2 rounded-full" style={{ background: L.greenSoft }}>
        <Icon size={16} color={L.green} />
      </div>
      <div className="flex-1">
        <p style={{ ...display, color: L.ink, fontSize: 14 }}>{title}</p>
        {sub && <p style={{ ...body, color: L.inkSoft, fontSize: 11 }}>{sub}</p>}
      </div>
      {tag && (
        <span className="px-2 py-0.5 rounded-full" style={{ ...body, background: L.goldSoft, color: L.gold, fontWeight: 700, fontSize: 10 }}>
          {tag}
        </span>
      )}
      <ChevronRight size={16} color={L.inkSoft} />
    </button>
  );
}

function TodaysPracticeCard({ practice, onOpenTimetable }) {
  return (
    <div className="px-5 mt-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ fontSize: 14 }}>🧘</span>
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Today's Practice</h2>
      </div>
      <div className="rounded-3xl p-4" style={{ background: L.surface, border: `1px solid ${L.line}`, boxShadow: "0 6px 18px rgba(63,89,66,0.08)" }}>
        <div className="rounded-2xl p-4" style={{ background: L.green }}>
          <p style={{ ...body, color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: 1 }}>{practice.day.toUpperCase()}'S FOCUS</p>
          <p style={{ ...display, color: "#FFFFFF", fontSize: 19, marginTop: 3, lineHeight: 1.25 }}>
            {practice.exercise || "Check with Archana ji"}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Clock size={13} color="rgba(255,255,255,0.75)" />
              <span style={{ ...body, color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{practice.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} color="rgba(255,255,255,0.75)" />
              <span style={{ ...body, color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{practice.difficulty}</span>
            </div>
          </div>
        </div>

        <div className="mt-3.5">
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>TODAY'S INTENTION</p>
          <p style={{ ...display, color: L.ink, fontSize: 14.5, marginTop: 4, lineHeight: 1.4 }}>{practice.intention}</p>
        </div>

        <button
          onClick={onOpenTimetable}
          className="w-full flex items-center justify-between mt-4 pt-3.5"
          style={{ borderTop: `1px solid ${L.line}` }}
        >
          <span style={{ ...body, color: L.green, fontSize: 13, fontWeight: 600 }}>📅 View Weekly Timetable</span>
          <ChevronRight size={16} color={L.green} />
        </button>
      </div>
    </div>
  );
}

function LiveClassSection({ batch }) {
  const [status, setStatus] = useState(() => getLiveClassStatus(batch.slotKey));
  const [joined, setJoined] = useState(false);

  const statusStyle = {
    upcoming: { bg: L.goldSoft, fg: L.gold, dot: false },
    starting_soon: { bg: L.goldSoft, fg: L.gold, dot: true },
    live: { bg: "#F3E1DB", fg: L.danger, dot: true },
    completed: { bg: L.line, fg: L.inkSoft, dot: false },
  }[status.state];

  const handleJoin = () => {
    trackEvent("join_live_class_clicked", { batchId: batch.id });
    setJoined(true);
    trackEvent("attendance_marked", { batchId: batch.id });
    window.open(LIVE_CLASS_MEET_LINK, "_blank");
    setStatus(getLiveClassStatus(batch.slotKey));
  };

  return (
    <div className="px-5 mt-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ fontSize: 14 }}>🔴</span>
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Today's Live Session</h2>
      </div>
      <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ ...display, color: L.ink, fontSize: 16 }}>Morning Yoga Flow</p>
            <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginTop: 2 }}>Starts at {batch.slotKey} · {batch.mode}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0" style={{ ...body, fontSize: 11, fontWeight: 700, background: statusStyle.bg, color: statusStyle.fg }}>
            {statusStyle.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusStyle.fg }} />}
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-2.5">
          <Clock size={13} color={L.inkSoft} />
          <span style={{ ...body, color: L.inkSoft, fontSize: 12 }}>Duration: 60 Minutes</span>
        </div>

        <button
          onClick={handleJoin}
          disabled={status.state === "completed"}
          className="w-full mt-4 py-3 rounded-full text-sm"
          style={{
            ...body,
            fontWeight: 700,
            background: status.state === "completed" ? L.line : L.green,
            color: status.state === "completed" ? L.inkSoft : "#FFFFFF",
          }}
        >
          {joined ? "You're checked in ✓" : status.state === "completed" ? "Session Completed" : "Join Live Class"}
        </button>
      </div>
    </div>
  );
}

function AttendanceStreakSummary() {
  const attended = WEEK_ATTENDANCE.filter((d) => d.status === "attended").length;
  return (
    <div className="px-5 mt-5">
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}>
        <BreathRing size={58} label="12" sub="streak" />
        <div className="flex-1">
          <p style={{ ...display, color: L.ink, fontSize: 15 }}>🔥 12 Day Streak</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginTop: 2 }}>Monthly Attendance · 18 / 22 Sessions</p>
          <div className="h-1.5 rounded-full mt-2" style={{ background: L.line }}>
            <div className="h-1.5 rounded-full" style={{ width: `${(18 / 22) * 100}%`, background: L.gold }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            {WEEK_ATTENDANCE.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: d.status === "today" ? L.gold : d.status === "upcoming" ? L.surface : L.greenSoft,
                    border: d.status === "today" ? `2px solid ${L.green}` : "none",
                  }}
                >
                  {d.status === "attended" && <Check size={10} color={L.green} />}
                </div>
                <span style={{ ...body, color: L.inkSoft, fontSize: 8 }}>{d.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContinueLearningCard({ onNav }) {
  return (
    <div className="px-5 mt-6">
      <div className="flex items-center gap-1.5 mb-2">
        <PlayCircle size={15} color={L.green} />
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Continue Learning</h2>
      </div>
      <button
        onClick={() => {
          trackEvent("continue_learning_clicked");
          trackEvent("continue_watching_clicked", { title: CONTINUE_WATCHING.title });
          onNav("library");
        }}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left"
        style={{ background: L.surface, border: `1px solid ${L.line}` }}
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: L.greenSoft }}>
          <span style={{ fontSize: 24 }}>{CONTINUE_WATCHING.ic}</span>
        </div>
        <div className="flex-1">
          <p style={{ ...display, color: L.ink, fontSize: 14 }}>{CONTINUE_WATCHING.title}</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, marginTop: 2 }}>{CONTINUE_WATCHING.progressPercent}% Complete · {CONTINUE_WATCHING.duration}</p>
          <div className="h-1.5 rounded-full mt-2" style={{ background: L.line }}>
            <div className="h-1.5 rounded-full" style={{ width: `${CONTINUE_WATCHING.progressPercent}%`, background: L.green }} />
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full shrink-0" style={{ ...body, fontSize: 11, fontWeight: 600, background: L.green, color: "#FFFFFF" }}>
          Continue
        </span>
      </button>
    </div>
  );
}

function RecommendedVideosRail({ onNav }) {
  return (
    <div className="mt-6">
      <div className="px-5 flex items-baseline justify-between mb-2">
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Recommended for You</h2>
        <button
          onClick={() => onNav("library")}
          style={{ ...body, color: L.green, fontSize: 12, fontWeight: 600 }}
        >
          View Library
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 px-5">
        {RECOMMENDED_VIDEOS.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              trackEvent("recommended_video_clicked", { title: v.title });
              trackEvent("video_started", { title: v.title });
              onNav("library");
            }}
            className="text-left rounded-2xl overflow-hidden shrink-0"
            style={{ background: L.surface, width: 130, border: `1px solid ${L.line}` }}
          >
            <div className="h-16 flex items-center justify-center" style={{ background: L.greenSoft }}>
              <span style={{ fontSize: 22 }}>{v.ic}</span>
            </div>
            <div className="p-2.5">
              <p style={{ ...display, color: L.ink, fontSize: 12, lineHeight: 1.25 }}>{v.title}</p>
              <p style={{ ...body, color: L.inkSoft, fontSize: 10.5, marginTop: 3 }}>{v.length}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FeaturedYoutubeCard() {
  const v = FEATURED_YOUTUBE_VIDEO;
  return (
    <div className="px-5 mt-6">
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ fontSize: 14 }}>📺</span>
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Featured This Week</h2>
      </div>
      <div className="rounded-2xl p-4" style={{ background: D.bg, border: `1px solid ${D.line}` }}>
        <div className="w-full h-28 rounded-xl flex items-center justify-center" style={{ background: D.surface }}>
          <PlayCircle size={34} color={D.gold} />
        </div>
        <p style={{ ...display, color: D.cream, fontSize: 15, marginTop: 10, lineHeight: 1.3 }}>{v.title}</p>
        <p style={{ ...body, color: D.muted, fontSize: 11.5, marginTop: 3 }}>{v.duration} · {v.views} views</p>
        <div className="flex gap-2 mt-3.5">
          <button
            onClick={() => {
              trackEvent("youtube_watch_clicked", { title: v.title });
              trackEvent("youtube_video_opened", { title: v.title });
              window.open(v.youtubeUrl, "_blank");
            }}
            className="flex-1 py-2.5 rounded-full text-sm"
            style={{ ...body, background: D.gold, color: "#241B12", fontWeight: 700 }}
          >
            Watch on YouTube
          </button>
          <button
            onClick={() => {
              trackEvent("youtube_subscribe_clicked");
              window.open(v.channelUrl, "_blank");
            }}
            className="px-4 py-2.5 rounded-full text-sm"
            style={{ ...body, background: "transparent", color: D.cream, fontWeight: 600, border: `1px solid ${D.line}` }}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

function FromArchanaCard() {
  const u = ARCHANA_UPDATE;
  return (
    <div className="px-5 mt-6">
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ fontSize: 14 }}>🌿</span>
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>From Archana Ji</h2>
      </div>
      <div className="rounded-2xl p-4 flex gap-3" style={{ background: L.greenSoft }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: L.green }}>
          <User size={20} color="#FFFFFF" />
        </div>
        <div className="flex-1">
          <p style={{ ...body, color: L.green, fontSize: 10.5, fontWeight: 700, letterSpacing: 1 }}>{u.label.toUpperCase()}</p>
          <p style={{ ...display, color: L.ink, fontSize: 14.5, marginTop: 2, lineHeight: 1.3 }}>{u.title}</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>{u.description}</p>
          <button
            onClick={() => {
              trackEvent("youtube_video_opened", { source: "archana_update" });
              window.open(u.youtubeUrl, "_blank");
            }}
            className="mt-3 px-3.5 py-1.5 rounded-full"
            style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600, fontSize: 12 }}
          >
            Watch Now
          </button>
        </div>
      </div>
    </div>
  );
}

function DailyWellnessTip() {
  const tip = getDailyWellnessTip();
  return (
    <div className="px-5 mt-6 pb-2">
      <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: L.surface, border: `1px dashed ${L.gold}` }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div>
          <p style={{ ...body, color: L.gold, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>DAILY WELLNESS TIP</p>
          <p style={{ ...display, color: L.ink, fontSize: 13, marginTop: 2, lineHeight: 1.35 }}>{tip}</p>
        </div>
      </div>
    </div>
  );
}

// Weekly timetable — a secondary, on-demand modal (not a bottom-nav tab).
function WeeklyTimetableModal({ onClose }) {
  const days = Object.keys(TIMETABLE);
  const slots = ["6:30 AM", "7:30 AM", "8:30 AM", "5:30 PM", "7:00 PM"];
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <LightPageTitle eyebrow="MON–SAT · KOTHRUD" title="Weekly Timetable" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
        {days.map((day) => (
          <div key={day} className="rounded-2xl p-3.5" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
            <p style={{ ...display, color: L.ink, fontSize: 14, marginBottom: 6 }}>{day}</p>
            <div className="space-y-1.5">
              {slots.map((slot) => (
                <div key={slot} className="flex items-center justify-between">
                  <span style={{ ...body, color: L.inkSoft, fontSize: 11.5 }}>{slot}</span>
                  <span style={{ ...body, color: L.ink, fontSize: 11.5, fontWeight: 600 }}>{TIMETABLE[day][slot]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative shrink-0"
      style={{ width: 42, height: 24, borderRadius: 999, background: on ? L.green : L.line, transition: "background 0.15s" }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#FFFFFF",
          transition: "left 0.15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

function NotificationCenterScreen({ prefs, onClose, onOpenTarget }) {
  const [readIds, setReadIds] = useState([]);

  useEffect(() => {
    NOTIFICATION_FEED.forEach((n) => trackEvent("notification_received", { id: n.id }));
  }, []);

  const visible = NOTIFICATION_FEED.filter((n) => prefs[n.category]);

  const handleTap = (n) => {
    setReadIds((r) => [...r, n.feedId]);
    trackEvent("notification_opened", { id: n.id, category: n.category });
    trackEvent(n.analyticsEvent, { id: n.id });
    onOpenTarget(n);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <LightPageTitle eyebrow="STAY CONNECTED" title="Notifications" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
        {visible.length === 0 && (
          <p style={{ ...body, color: L.inkSoft, fontSize: 13, textAlign: "center", marginTop: 40 }}>
            All notification categories are turned off. Adjust this anytime in Profile → Notification Preferences.
          </p>
        )}
        {visible.map((n) => {
          const unread = !readIds.includes(n.feedId);
          return (
            <button
              key={n.feedId}
              onClick={() => handleTap(n)}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left"
              style={{ background: unread ? L.goldSoft : L.surface, border: `1px solid ${unread ? L.gold : L.line}` }}
            >
              <span style={{ fontSize: 20 }} className="shrink-0">{n.ic}</span>
              <div className="flex-1">
                <p style={{ ...display, color: L.ink, fontSize: 13.5, lineHeight: 1.3 }}>{n.title}</p>
                <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, marginTop: 2, lineHeight: 1.4 }}>{n.body}</p>
                <p style={{ ...body, color: L.inkSoft, fontSize: 10, marginTop: 4 }}>{n.time}</p>
              </div>
              {unread && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: L.gold }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NotificationPreferencesScreen({ prefs, onTogglePref, onClose }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <LightPageTitle
        eyebrow="PROFILE"
        title="Notification Preferences"
        subtitle="Choose what you'd like to hear from us — calm and supportive, never spammy."
        onBack={onClose}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2.5">
        {NOTIFICATION_CATEGORIES.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
            <div className="flex-1">
              <p style={{ ...display, color: L.ink, fontSize: 14 }}>{c.label}</p>
              <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, marginTop: 2, lineHeight: 1.35 }}>{c.sub}</p>
            </div>
            <ToggleSwitch on={prefs[c.id]} onChange={(next) => onTogglePref(c.id, next)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Screens ------------------------------------------------------------

function HomeScreen({ onOpenWorkshop, onOpenReferralHub, onOpenTimetable, onNav }) {
  const myBatch = BATCHES.find((b) => b.id === ENROLLED_BATCH_ID);
  const practice = getTodaysPractice(myBatch.slotKey);
  const nearest = NEAREST_WORKSHOP;
  const full = nearest.seatsLeft === 0;

  useEffect(() => {
    trackEvent("home_opened");
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pb-4" style={{ background: L.bg }}>
      {/* 1. Greeting header */}
      <div className="px-5 pt-4">
        <p style={{ ...body, color: L.green, fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>KOTHRUD, PUNE</p>
        <h1 style={{ ...display, color: L.ink, fontSize: 24, marginTop: 4 }}>Good Morning, Shital 🌞</h1>
      </div>

      {/* 2–3. Today's Practice + weekly timetable link */}
      <TodaysPracticeCard practice={practice} onOpenTimetable={onOpenTimetable} />

      {/* 6. Upcoming workshop */}
      <div className="px-5 mt-5">
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ fontSize: 14 }}>🌟</span>
          <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Upcoming Workshop</h2>
        </div>
        <button
          onClick={() => {
            trackEvent("workshop_clicked", { workshopId: nearest.id });
            onOpenWorkshop(nearest);
          }}
          className="w-full text-left rounded-2xl p-4"
          style={{ background: L.surface, border: `1.5px solid ${L.gold}`, boxShadow: "0 6px 16px rgba(199,154,70,0.15)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 26 }}>{nearest.ic}</span>
              <div>
                <p style={{ ...display, color: L.ink, fontSize: 16, lineHeight: 1.25 }}>{nearest.title}</p>
                <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginTop: 2 }}>
                  {nearest.day} · {nearest.time} · {nearest.duration}
                </p>
              </div>
            </div>
            <SeatBadge seatsLeft={nearest.seatsLeft} />
          </div>
          <ul className="mt-3 space-y-1">
            {nearest.benefits.map((b) => (
              <li key={b} style={{ ...body, color: L.inkSoft, fontSize: 12 }}>
                • {b}
              </li>
            ))}
          </ul>
          <div
            className="mt-3 py-2 rounded-full text-center"
            style={{ ...body, fontSize: 13, fontWeight: 600, background: L.green, color: "#FFFFFF" }}
          >
            {full ? "Join Waitlist" : "View Workshop"}
          </div>
        </button>
      </div>

      {/* 7. Refer & Earn */}
      <div className="px-5 mt-5">
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ fontSize: 14 }}>🎁</span>
          <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Refer Friends &amp; Earn Rewards</h2>
        </div>
        <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1.5px solid ${L.gold}`, boxShadow: "0 6px 16px rgba(199,154,70,0.15)" }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>AVAILABLE CREDITS</p>
              <p style={{ ...display, color: L.ink, fontSize: 20, marginTop: 2 }}>₹{REFERRAL_WALLET.availableCredits}</p>
            </div>
            <div>
              <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>SUCCESSFUL REFERRALS</p>
              <p style={{ ...display, color: L.ink, fontSize: 20, marginTop: 2 }}>{REFERRAL_STATS.successfulJoins}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${L.line}` }}>
            <span style={{ ...body, color: L.inkSoft, fontSize: 11 }}>Your referral code</span>
            <span style={{ ...display, color: L.gold, fontSize: 15, letterSpacing: 1 }}>{REFERRAL_CODE}</span>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                trackEvent("referral_clicked", { source: "home_share" });
                shareReferral({ code: REFERRAL_CODE, channel: "native" });
              }}
              className="flex-1 py-2.5 rounded-full text-sm"
              style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600 }}
            >
              Share Referral Link
            </button>
            <button
              onClick={() => {
                trackEvent("referral_clicked", { source: "home_view_rewards" });
                onOpenReferralHub();
              }}
              className="px-4 py-2.5 rounded-full text-sm"
              style={{ ...body, background: L.goldSoft, color: L.gold, fontWeight: 600, border: `1px solid ${L.gold}` }}
            >
              View Rewards
            </button>
          </div>
        </div>
      </div>

      {/* 8. Continue Learning */}
      <ContinueLearningCard onNav={onNav} />

      {/* 9. Featured Video of the Week */}
      <FeaturedYoutubeCard />

      {/* 10. Recommended for You */}
      <RecommendedVideosRail onNav={onNav} />

      {/* 11. From Archana Ji */}
      <FromArchanaCard />

      {/* 12. Daily Wellness Tip */}
      <DailyWellnessTip />
    </div>
  );
}

function FeaturedWorkshopCard({ workshop, onOpen }) {
  const full = workshop.seatsLeft === 0;
  return (
    <div className="px-5">
      <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: L.green }}>
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} color={L.gold} />
          <span style={{ ...body, color: L.gold, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>FEATURED WORKSHOP</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span style={{ fontSize: 32 }}>{workshop.ic}</span>
          <div>
            <p style={{ ...display, color: "#FFFFFF", fontSize: 20, lineHeight: 1.2 }}>{workshop.title}</p>
            <p style={{ ...body, color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
              {workshop.day} · {workshop.time} · {workshop.duration}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-1">
          {workshop.benefits.map((b) => (
            <li key={b} style={{ ...body, color: "rgba(255,255,255,0.85)", fontSize: 12.5 }}>
              • {b}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div>
            <p style={{ ...body, color: "rgba(255,255,255,0.65)", fontSize: 10, letterSpacing: 1 }}>SEATS LEFT</p>
            <p style={{ ...display, color: "#FFFFFF", fontSize: 17 }}>{workshop.seatsLeft}</p>
          </div>
          <div className="text-right">
            <p style={{ ...body, color: "rgba(255,255,255,0.65)", fontSize: 10, letterSpacing: 1 }}>PRICE</p>
            <p style={{ ...display, color: L.gold, fontSize: 17 }}>₹{workshop.price}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onOpen(workshop)}
            className="flex-1 py-2.5 rounded-full text-sm"
            style={{ ...body, background: L.gold, color: "#241B12", fontWeight: 700 }}
          >
            {full ? "Join Waitlist" : "Reserve Seat"}
          </button>
          <button
            onClick={() => onOpen(workshop)}
            className="flex-1 py-2.5 rounded-full text-sm"
            style={{ ...body, background: "transparent", color: "#FFFFFF", fontWeight: 600, border: "1px solid rgba(255,255,255,0.4)" }}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkshopsScreen({ onOpenWorkshop, onOpenRecordings }) {
  const featured = NEAREST_WORKSHOP;
  const rest = WORKSHOPS.filter((w) => w.id !== featured.id);

  return (
    <div className="flex-1 overflow-y-auto pb-6" style={{ background: L.bg }}>
      <LightPageTitle eyebrow="SPECIAL SESSIONS" title="Upcoming Workshops" subtitle="Deepen your practice with special guided sessions." />

      <div className="mt-1">
        <FeaturedWorkshopCard workshop={featured} onOpen={onOpenWorkshop} />
      </div>

      {/* Upcoming workshops — horizontal scroll */}
      <div className="mt-6">
        <h2 className="px-5" style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 10 }}>
          More Sessions
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 px-5">
          {WORKSHOPS.map((w) => (
            <button
              key={w.id}
              onClick={() => onOpenWorkshop(w)}
              className="text-left rounded-2xl p-3.5 shrink-0"
              style={{ background: L.surface, width: 176, border: `1px solid ${L.line}` }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 20 }}>{w.ic}</span>
                <SeatBadge seatsLeft={w.seatsLeft} />
              </div>
              <p style={{ ...display, color: L.ink, fontSize: 14, marginTop: 8, lineHeight: 1.25 }}>{w.title}</p>
              <p style={{ ...body, color: L.inkSoft, fontSize: 11, marginTop: 4 }}>
                {w.day} · {w.duration}
              </p>
              <div className="flex items-center justify-between mt-2.5">
                <span style={{ ...display, color: L.gold, fontSize: 14 }}>₹{w.price}</span>
                <span style={{ ...body, color: L.green, fontSize: 11, fontWeight: 700 }}>Register →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended for you */}
      <div className="px-5 mt-7">
        <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 2 }}>Recommended for You</h2>
        <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginBottom: 12 }}>Based on your practice focus</p>
        {RECOMMENDATION_TAGS.map((tag) => {
          const list = WORKSHOPS.filter((w) => w.recommendedFor.includes(tag));
          if (!list.length) return null;
          return (
            <div key={tag} className="mb-4">
              <p style={{ ...body, color: L.green, fontSize: 12, fontWeight: 700, letterSpacing: 0.3, marginBottom: 8 }}>
                Recommended for {tag}
              </p>
              <div className="space-y-2">
                {list.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onOpenWorkshop(w)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
                    style={{ background: L.surface, border: `1px solid ${L.line}` }}
                  >
                    <span style={{ fontSize: 20 }}>{w.ic}</span>
                    <div className="flex-1">
                      <p style={{ ...display, color: L.ink, fontSize: 13 }}>{w.title}</p>
                      <p style={{ ...body, color: L.inkSoft, fontSize: 11 }}>
                        {w.day} · {w.duration}
                      </p>
                    </div>
                    <ChevronRight size={15} color={L.inkSoft} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Past workshop recordings — premium, locked content */}
      <div className="px-5 mt-3">
        <div className="flex items-baseline justify-between mb-0.5">
          <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Past Workshop Recordings</h2>
        </div>
        <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginBottom: 10 }}>Revisit sessions anytime with a premium membership</p>
        <div className="grid grid-cols-2 gap-3">
          {PAST_RECORDINGS.map((r) => (
            <div key={r.id} className="rounded-2xl p-3.5" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 20 }}>{r.ic}</span>
                <Lock size={14} color={L.gold} />
              </div>
              <p style={{ ...display, color: L.ink, fontSize: 13, marginTop: 8, lineHeight: 1.25 }}>{r.title}</p>
              <button
                onClick={onOpenRecordings}
                className="w-full mt-2.5 py-1.5 rounded-full text-center"
                style={{ ...body, fontSize: 11, fontWeight: 700, background: L.goldSoft, color: L.gold }}
              >
                Upgrade to Access
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
      <p style={{ ...display, color: L.ink, fontSize: 19 }}>{value}</p>
      <p style={{ ...body, color: L.inkSoft, fontSize: 10.5, lineHeight: 1.3, marginTop: 2 }}>{label}</p>
    </div>
  );
}

function MilestoneCard({ milestone }) {
  const statusStyle = {
    completed: { bg: L.greenSoft, fg: L.green, label: "Completed" },
    in_progress: { bg: L.goldSoft, fg: L.gold, label: "In Progress" },
    locked: { bg: L.line, fg: L.inkSoft, label: "Locked" },
  }[milestone.status];

  return (
    <div className="rounded-2xl p-3.5" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
      <div className="flex items-start justify-between">
        <div>
          <p style={{ ...display, color: L.ink, fontSize: 14 }}>{milestone.referralsRequired} Successful Referral{milestone.referralsRequired > 1 ? "s" : ""}</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginTop: 2 }}>Reward: {milestone.reward.label}</p>
        </div>
        <span className="px-2 py-0.5 rounded-full shrink-0" style={{ ...body, fontSize: 10, fontWeight: 700, background: statusStyle.bg, color: statusStyle.fg }}>
          {statusStyle.label}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 rounded-full" style={{ background: L.line }}>
        <div
          className="h-1.5 rounded-full"
          style={{
            width: milestone.status === "completed" ? "100%" : milestone.status === "in_progress" ? `${(REFERRAL_STATS.successfulJoins / milestone.referralsRequired) * 100}%` : "0%",
            background: milestone.status === "locked" ? L.line : L.gold,
          }}
        />
      </div>
    </div>
  );
}

function ReferralHubScreen({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyReferralCode(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <div className="flex-1 overflow-y-auto pb-6">
        <LightPageTitle
          eyebrow="GROW WITH DIVYA YOGA"
          title="Refer Friends & Earn Rewards"
          subtitle="Share wellness with your friends and unlock exclusive rewards."
          onBack={onClose}
        />

        {/* Section 1 — Referral performance */}
        <div className="px-5 grid grid-cols-2 gap-3">
          <MetricCard label="Total Referrals" value={REFERRAL_STATS.totalReferrals} />
          <MetricCard label="Successful Joins" value={REFERRAL_STATS.successfulJoins} />
          <MetricCard label="Pending Invites" value={REFERRAL_STATS.pendingInvites} />
          <MetricCard label="Credits Earned" value={`₹${REFERRAL_STATS.creditsEarned}`} />
        </div>

        {/* Section 2 — Referral code */}
        <div className="px-5 mt-6">
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>YOUR REFERRAL CODE</p>
          <div className="rounded-2xl p-4" style={{ background: L.green }}>
            <p style={{ ...body, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Share this code with friends</p>
            <p style={{ ...display, color: "#FFFFFF", fontSize: 26, letterSpacing: 2, marginTop: 4 }}>{REFERRAL_CODE}</p>
            <p style={{ ...body, color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 4 }}>{referralUrl(REFERRAL_CODE)}</p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm"
                style={{ ...body, background: "rgba(255,255,255,0.12)", color: "#FFFFFF", fontWeight: 600 }}
              >
                <Copy size={14} /> {copied ? "Copied!" : "Copy Code"}
              </button>
              <button
                onClick={() => shareReferral({ code: REFERRAL_CODE, channel: "whatsapp" })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm"
                style={{ ...body, background: L.whatsapp, color: "#FFFFFF", fontWeight: 600 }}
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <button
                onClick={() => shareReferral({ code: REFERRAL_CODE, channel: "native" })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm"
                style={{ ...body, background: L.gold, color: "#241B12", fontWeight: 700 }}
              >
                <Share2 size={14} /> Share Link
              </button>
            </div>
          </div>
        </div>

        {/* Section 3 — Reward structure / milestones */}
        <div className="px-5 mt-6">
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy size={13} color={L.gold} />
            <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>REWARD STRUCTURE</p>
          </div>
          <div className="space-y-2.5">
            {REFERRAL_MILESTONES.map((m) => (
              <MilestoneCard key={m.id} milestone={m} />
            ))}
          </div>
        </div>

        {/* Section 4 — Referral wallet */}
        <div className="px-5 mt-6">
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>REFERRAL WALLET</p>
          <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.gold}` }}>
            <div className="flex items-center gap-2">
              <Wallet size={16} color={L.gold} />
              <span style={{ ...display, color: L.ink, fontSize: 15 }}>Referral Wallet</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>AVAILABLE CREDITS</p>
                <p style={{ ...display, color: L.ink, fontSize: 20, marginTop: 2 }}>₹{REFERRAL_WALLET.availableCredits}</p>
              </div>
              <div>
                <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>LIFETIME EARNED</p>
                <p style={{ ...display, color: L.ink, fontSize: 20, marginTop: 2 }}>₹{REFERRAL_WALLET.lifetimeCredits}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => trackEvent("reward_redeemed", { target: "membership" })}
                className="flex-1 py-2 rounded-full text-xs"
                style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600 }}
              >
                Apply to Membership
              </button>
              <button
                onClick={() => trackEvent("reward_redeemed", { target: "workshop" })}
                className="flex-1 py-2 rounded-full text-xs"
                style={{ ...body, background: L.greenSoft, color: L.green, fontWeight: 600 }}
              >
                Apply to Workshop
              </button>
            </div>
            <button className="w-full mt-2 py-2 rounded-full text-xs" style={{ ...body, color: L.inkSoft, fontWeight: 600, border: `1px solid ${L.line}` }}>
              View Transactions
            </button>
          </div>
        </div>

        {/* Section 5 — Referral history */}
        <div className="px-5 mt-6">
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>REFERRAL HISTORY</p>
          <div className="space-y-2">
            {REFERRAL_HISTORY.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: r.status === "joined" ? L.greenSoft : L.line }}>
                    {r.status === "joined" ? <Check size={15} color={L.green} /> : <Clock size={14} color={L.inkSoft} />}
                  </div>
                  <div>
                    <p style={{ ...display, color: L.ink, fontSize: 13.5 }}>{r.friendName}</p>
                    <p style={{ ...body, color: L.inkSoft, fontSize: 11 }}>{r.status === "joined" ? "Joined" : "Pending"}</p>
                  </div>
                </div>
                {r.status === "joined" && (
                  <span style={{ ...body, color: L.green, fontSize: 12, fontWeight: 700 }}>+₹{r.rewardAmount}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 6 — Bonus campaigns */}
        <div className="px-5 mt-6">
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>BONUS CAMPAIGNS</p>
          <div className="space-y-2.5">
            {REFERRAL_CAMPAIGNS.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}>
                <span style={{ fontSize: 22 }}>{c.ic}</span>
                <div>
                  <p style={{ ...display, color: L.ink, fontSize: 13.5, lineHeight: 1.3 }}>{c.title}</p>
                  <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, marginTop: 1 }}>{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement badges */}
        <div className="px-5 mt-6">
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ACHIEVEMENT BADGES</p>
          <div className="grid grid-cols-3 gap-2.5">
            {ACHIEVEMENT_BADGES.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl p-3 text-center"
                style={{ background: b.earned ? L.surface : L.bg, border: `1px solid ${b.earned ? L.gold : L.line}`, opacity: b.earned ? 1 : 0.55 }}
              >
                <div className="relative inline-block">
                  <span style={{ fontSize: 24 }}>{b.ic}</span>
                  {!b.earned && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full" style={{ background: L.surface }}>
                      <Lock size={10} color={L.inkSoft} />
                    </div>
                  )}
                </div>
                <p style={{ ...display, color: L.ink, fontSize: 11, marginTop: 6, lineHeight: 1.25 }}>{b.name}</p>
                <p style={{ ...body, color: L.inkSoft, fontSize: 9.5, marginTop: 2, lineHeight: 1.25 }}>{b.requirement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent notification events */}
        <div className="px-5 mt-6">
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>RECENT ACTIVITY</p>
          <div className="space-y-2">
            {REFERRAL_NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex items-center gap-2.5 p-3 rounded-2xl" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
                <Award size={14} color={L.gold} className="shrink-0" />
                <p style={{ ...body, color: L.ink, fontSize: 12, lineHeight: 1.35 }}>{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BatchDetail({ batch, onClose }) {
  const [state, setState] = useState("view"); // view | confirmed
  const isFull = batch.spots === 0;
  const isMine = batch.id === ENROLLED_BATCH_ID;
  const focus = todaysFocus(batch.slotKey);
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: D.bg, zIndex: 30 }}>
      <DarkPageTitle eyebrow={isMine ? "YOUR BATCH" : batch.label.toUpperCase()} title={batch.time} onBack={onClose} />

      {state === "view" ? (
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="flex items-center gap-2">
            <ModeBadge mode={batch.mode} />
            <span style={{ ...body, color: D.muted, fontSize: 12 }}>{batch.days}</span>
          </div>

          {focus.exercise && (
            <div className="mt-3 p-3 rounded-2xl flex items-center justify-between" style={{ background: D.goldSoft, border: `1px solid ${D.gold}` }}>
              <span style={{ ...body, color: D.gold, fontSize: 11, letterSpacing: 1, fontWeight: 600 }}>{focus.day.toUpperCase()}'S FOCUS</span>
              <span style={{ ...display, color: D.cream, fontSize: 14 }}>{focus.exercise}</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-5 p-3 rounded-2xl" style={{ background: D.surface, border: `1px solid ${D.line}` }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: D.goldSoft }}>
              <User size={20} color={D.gold} />
            </div>
            <div>
              <p style={{ ...display, color: D.cream, fontSize: 14 }}>Archana ji</p>
              <p style={{ ...body, color: D.muted, fontSize: 12 }}>M.A. Yog Shastra · 5+ yrs experience</p>
            </div>
          </div>

          <p style={{ ...body, color: D.muted, fontSize: 13, lineHeight: 1.6, marginTop: 16 }}>
            Every batch blends Weight Loss, PCOS, Prenatal &amp; Fitness practice together — one weekly schedule, personalised guidance for each student within the group.
            {batch.mode === "Online" ? " Join live on WhatsApp video — mat and quiet space recommended." : " Bring your own mat or rent one at the studio."}
          </p>

          <div className="mt-5">
            <div className="flex justify-between mb-1">
              <span style={{ ...body, color: D.muted, fontSize: 12 }}>Spots filled</span>
              <span style={{ ...body, color: D.muted, fontSize: 12 }}>{batch.total - batch.spots}/{batch.total}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: D.line }}>
              <div className="h-2 rounded-full" style={{ width: `${((batch.total - batch.spots) / batch.total) * 100}%`, background: isFull ? D.danger : D.gold }} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2" style={{ color: D.muted }}>
            <MapPin size={14} />
            <span style={{ ...body, fontSize: 12 }}>Divya Yoga Studio · Kothrud, Pune</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="p-3 rounded-full mb-4" style={{ background: D.goldSoft }}>
            <Check size={26} color={D.gold} />
          </div>
          <h2 style={{ ...display, color: D.cream, fontSize: 20 }}>{isMine ? "You're checked in" : "You're booked"}</h2>
          <p style={{ ...body, color: D.muted, fontSize: 13, marginTop: 4 }}>
            {isMine ? "Show this code at the studio for today's class." : `Show this code at the studio to check in for the ${batch.time} batch.`}
          </p>
          <div className="mt-6"><FakeQR /></div>
          <p style={{ ...body, color: D.muted, fontSize: 11, marginTop: 10 }}>Archana ji will confirm on WhatsApp · reminder sent 30 min before</p>
        </div>
      )}

      <div className="p-5">
        {state === "view" ? (
          <button
            onClick={() => setState("confirmed")}
            className="w-full py-3.5 rounded-full"
            style={{ ...body, background: isMine ? D.gold : isFull ? D.offlineBg : D.gold, color: isMine ? "#241B12" : isFull ? D.offlineText : "#241B12", fontWeight: 600, fontSize: 15 }}
          >
            {isMine ? "Check in for today" : isFull ? "Join waitlist" : "Book this batch as a drop-in"}
          </button>
        ) : (
          <button onClick={onClose} className="w-full py-3.5 rounded-full" style={{ ...body, background: D.surface, color: D.cream, fontWeight: 600, fontSize: 15, border: `1px solid ${D.line}` }}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}

// Batch-switching, moved out of the main tab bar and into Profile → Membership.
// Same dark "Choose Your Preferred Time" treatment as before, now reached
// only when a member actually wants to change their slot.
function BatchScheduleScreen({ onOpenBatch, onClose }) {
  const [mode, setMode] = useState("All");
  const [dayIdx, setDayIdx] = useState(2);
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const shown = BATCHES.filter((c) => mode === "All" || c.mode === mode);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: D.bg, zIndex: 30 }}>
      <DarkPageTitle eyebrow="MON–SAT · KOTHRUD" title="Change Your Batch" onBack={onClose} />

      <div className="flex justify-between px-5">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setDayIdx(i)}
            className="flex flex-col items-center gap-1 w-9 py-1.5 rounded-full"
            style={{ background: i === dayIdx ? D.gold : "transparent" }}
          >
            <span style={{ ...body, color: i === dayIdx ? "#241B12" : D.muted, fontSize: 10 }}>{d}</span>
            <span style={{ ...display, color: i === dayIdx ? "#241B12" : D.cream, fontSize: 14 }}>{13 + i}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 px-5 py-4 overflow-x-auto">
        {MODES.map((f) => (
          <Chip key={f} theme="dark" active={mode === f} onClick={() => setMode(f)}>
            {f}
          </Chip>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
        {shown.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenBatch(c)}
            className="w-full text-left rounded-2xl p-4"
            style={{ background: D.surface, border: `1px solid ${D.line}` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p style={{ ...display, color: D.cream, fontSize: 17 }}>{c.time}</p>
                <p style={{ ...body, color: D.muted, fontSize: 12, marginTop: 2 }}>{c.label} · {c.days}</p>
              </div>
              <ModeBadge mode={c.mode} />
            </div>
            <p style={{ ...body, color: c.spots === 0 ? D.danger : D.muted, fontSize: 11, marginTop: 10 }}>
              {c.spots === 0 ? "Full — join waitlist" : `${c.spots} spots left`}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkshopDetail({ workshop, onClose, onOpenReferralHub }) {
  const [state, setState] = useState("view"); // view | registered
  const full = workshop.seatsLeft === 0;
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <div className="px-5 pt-4 pb-3">
        <button onClick={onClose} className="mb-1 -ml-1 p-1 rounded-full" style={{ color: L.ink }}>
          <ChevronLeft size={20} />
        </button>
        <p style={{ ...body, color: L.green, fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>WORKSHOP</p>
        <h1 style={{ ...display, color: L.ink, fontSize: 24, marginTop: 4 }}>{workshop.title}</h1>
      </div>

      {state === "view" ? (
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span style={{ fontSize: 28 }}>{workshop.ic}</span>
            <SeatBadge seatsLeft={workshop.seatsLeft} />
            <span className="px-2.5 py-1 rounded-full" style={{ ...body, fontSize: 11, fontWeight: 700, background: L.goldSoft, color: L.gold }}>
              ₹{workshop.price}
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            <p style={{ ...body, color: L.inkSoft, fontSize: 12.5 }}>
              {workshop.day}, {workshop.date} · {workshop.time}
            </p>
            <p style={{ ...body, color: L.inkSoft, fontSize: 12.5 }}>{workshop.duration} · with {workshop.instructor}</p>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl" style={{ background: L.greenSoft }}>
            <p style={{ ...body, color: L.green, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>BENEFITS</p>
            <ul className="mt-1.5 space-y-1">
              {workshop.benefits.map((b) => (
                <li key={b} style={{ ...display, color: L.ink, fontSize: 14, lineHeight: 1.35 }}>
                  • {b}
                </li>
              ))}
            </ul>
          </div>

          <p style={{ ...body, color: L.inkSoft, fontSize: 13, lineHeight: 1.6, marginTop: 16 }}>{workshop.description}</p>

          <div className="mt-4">
            <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>WHAT TO BRING</p>
            <p style={{ ...body, color: L.ink, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{workshop.whatToBring}</p>
          </div>

          <div className="mt-5">
            <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>FAQ</p>
            <div className="space-y-2">
              {workshop.faq.map((f) => (
                <div key={f.q} className="rounded-2xl p-3" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
                  <p style={{ ...display, color: L.ink, fontSize: 13 }}>{f.q}</p>
                  <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between mb-1">
              <span style={{ ...body, color: L.inkSoft, fontSize: 12 }}>Seats filled</span>
              <span style={{ ...body, color: L.inkSoft, fontSize: 12 }}>{workshop.seatsTotal - workshop.seatsLeft}/{workshop.seatsTotal}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: L.line }}>
              <div className="h-2 rounded-full" style={{ width: `${((workshop.seatsTotal - workshop.seatsLeft) / workshop.seatsTotal) * 100}%`, background: full ? L.danger : L.green }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="p-3 rounded-full mb-4" style={{ background: L.greenSoft }}>
            <Check size={26} color={L.green} />
          </div>
          <h2 style={{ ...display, color: L.ink, fontSize: 20 }}>{full ? "You're on the waitlist" : "You're registered"}</h2>
          <p style={{ ...body, color: L.inkSoft, fontSize: 13, marginTop: 4 }}>
            {full ? "We'll message you on WhatsApp the moment a seat opens." : `See you at ${workshop.title} on ${workshop.day}, ${workshop.date}. Details are on their way via WhatsApp.`}
          </p>
          {!full && (
            <ReferralPromptCard
              text="Invite a friend and both receive ₹100 workshop credit."
              source="workshop"
              onInvite={() => {
                onClose();
                onOpenReferralHub();
              }}
            />
          )}
        </div>
      )}

      <div className="p-5">
        {state === "view" ? (
          <button
            onClick={() => setState("registered")}
            className="w-full py-3.5 rounded-full"
            style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600, fontSize: 15 }}
          >
            {full ? "Join Waitlist" : "Reserve Seat"}
          </button>
        ) : (
          <button onClick={onClose} className="w-full py-3.5 rounded-full" style={{ ...body, background: L.surface, color: L.ink, fontWeight: 600, fontSize: 15, border: `1px solid ${L.line}` }}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}

function WeeklyGoalHero() {
  const { completed, target } = WEEKLY_GOAL;
  const pct = Math.round((completed / target) * 100);
  const achieved = completed >= target;
  const remaining = target - completed;

  return (
    <div className="px-5 mt-2">
      <div className="rounded-3xl p-5" style={{ background: L.green, boxShadow: "0 10px 24px rgba(63,89,66,0.25)" }}>
        <p style={{ ...body, color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>WEEKLY GOAL</p>
        <div className="flex items-center gap-5 mt-2">
          <div style={{ width: 96, height: 96, position: "relative" }} className="shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke={L.gold}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                transform="rotate(-90 48 48)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ ...display, color: "#FFFFFF", fontSize: 20 }}>{pct}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p style={{ ...display, color: "#FFFFFF", fontSize: 19 }}>
              {completed} / {target} Classes
            </p>
            <p style={{ ...body, color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>Completed this week</p>
            <p style={{ ...body, color: L.gold, fontSize: 13, fontWeight: 700, marginTop: 8, lineHeight: 1.35 }}>
              {achieved ? "✅ Weekly Goal Achieved" : `🔥 ${remaining} more class${remaining > 1 ? "es" : ""} to complete this week`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressSnapshot() {
  const cards = [
    { icon: "🔥", label: "Current Streak", value: "12 Days" },
    { icon: "🎯", label: "Monthly Attendance", value: "18 / 22 Classes" },
    { icon: "🏆", label: "Practice Level", value: `Level ${CURRENT_LEVEL.level} · ${CURRENT_LEVEL.label}` },
  ];
  return (
    <div className="px-5 mt-5 grid grid-cols-3 gap-2.5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl p-3" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
          <span style={{ fontSize: 16 }}>{c.icon}</span>
          <p style={{ ...display, color: L.ink, fontSize: 13.5, marginTop: 6, lineHeight: 1.25 }}>{c.value}</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 10, marginTop: 2, lineHeight: 1.25 }}>{c.label}</p>
        </div>
      ))}
    </div>
  );
}

function GoalJourneyCard() {
  const g = GOAL_JOURNEY;
  return (
    <div className="px-5 mt-6">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Your Goal Journey</h2>
      <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>GOAL</p>
            <p style={{ ...display, color: L.ink, fontSize: 16, marginTop: 2 }}>{g.goal}</p>
          </div>
          <span style={{ ...display, color: L.green, fontSize: 20 }}>{g.progress}%</span>
        </div>
        <div className="h-2 rounded-full mt-3" style={{ background: L.line }}>
          <div className="h-2 rounded-full" style={{ width: `${g.progress}%`, background: L.green }} />
        </div>
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${L.line}` }}>
          <span style={{ ...body, color: L.inkSoft, fontSize: 11.5 }}>Weekly target: {g.weeklyTarget} classes</span>
          <span style={{ ...body, color: L.inkSoft, fontSize: 11.5 }}>Monthly target: {g.monthlyTarget} classes</span>
        </div>
      </div>
    </div>
  );
}

function RecommendedForTodayCard({ onNav }) {
  const r = RECOMMENDED_PRACTICE;
  return (
    <div className="px-5 mt-6">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Recommended for Today</h2>
      <div className="rounded-2xl p-4" style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 24 }}>{r.ic}</span>
          <div className="flex-1">
            <p style={{ ...display, color: L.ink, fontSize: 15 }}>{r.title}</p>
            <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, marginTop: 2, lineHeight: 1.4 }}>{r.reason}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3.5">
          <span style={{ ...body, color: L.inkSoft, fontSize: 12 }}>⏱ {r.duration}</span>
          <button
            onClick={() => {
              trackEvent("recommended_practice_clicked", { title: r.title });
              onNav("library");
            }}
            className="px-4 py-2 rounded-full text-sm"
            style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600 }}
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}

function PracticeContinueLearning({ onNav }) {
  return (
    <div className="px-5 mt-6">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Continue Learning</h2>
      <div className="space-y-2.5">
        {CONTINUE_LEARNING_LIST.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              trackEvent("continue_learning_clicked", { title: c.title });
              onNav("library");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
            style={{ background: L.surface, border: `1px solid ${L.line}` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: L.greenSoft }}>
              <span style={{ fontSize: 20 }}>{c.ic}</span>
            </div>
            <div className="flex-1">
              <p style={{ ...display, color: L.ink, fontSize: 13.5 }}>{c.title}</p>
              <p style={{ ...body, color: L.inkSoft, fontSize: 10.5, marginTop: 2 }}>{c.progressPercent}% Complete · {c.duration}</p>
              <div className="h-1.5 rounded-full mt-1.5" style={{ background: L.line }}>
                <div className="h-1.5 rounded-full" style={{ width: `${c.progressPercent}%`, background: L.green }} />
              </div>
            </div>
            <ChevronRight size={15} color={L.inkSoft} className="shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function AchievementBadgesRow() {
  return (
    <div className="mt-6">
      <h2 className="px-5" style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Achievements &amp; Badges</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 px-5">
        {PRACTICE_BADGES.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl p-3 text-center shrink-0"
            style={{ background: b.earned ? L.surface : L.bg, width: 92, border: `1px solid ${b.earned ? L.gold : L.line}`, opacity: b.earned ? 1 : 0.55 }}
          >
            <div className="relative inline-block">
              <span style={{ fontSize: 22 }}>{b.ic}</span>
              {!b.earned && (
                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full" style={{ background: L.surface }}>
                  <Lock size={9} color={L.inkSoft} />
                </div>
              )}
            </div>
            <p style={{ ...display, color: L.ink, fontSize: 10.5, marginTop: 6, lineHeight: 1.25 }}>{b.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyInsights() {
  return (
    <div className="px-5 mt-6">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Monthly Insights</h2>
      <div className="space-y-2">
        {MONTHLY_INSIGHTS.map((insight) => (
          <div key={insight} className="flex items-center gap-2.5 p-3 rounded-2xl" style={{ background: L.greenSoft }}>
            <Sparkles size={14} color={L.green} className="shrink-0" />
            <p style={{ ...body, color: L.ink, fontSize: 12.5, lineHeight: 1.35 }}>{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalReflections({ entries, onAddReflection }) {
  return (
    <div className="px-5 mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Personal Reflections</h2>
        <button onClick={onAddReflection} className="text-sm" style={{ ...body, color: L.green, fontWeight: 600 }}>
          + Add Reflection
        </button>
      </div>
      <div className="rounded-2xl p-3.5 mb-2.5" style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}>
        <p style={{ ...body, color: L.gold, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5 }}>REFLECTION PROMPTS</p>
        {REFLECTION_PROMPTS.map((p) => (
          <p key={p} style={{ ...body, color: L.ink, fontSize: 12, lineHeight: 1.5 }}>• {p}</p>
        ))}
      </div>
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div key={i} className="rounded-2xl p-3" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
            <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 600 }}>{e.d}</p>
            <p style={{ ...body, color: L.ink, fontSize: 13, marginTop: 2 }}>{e.t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestoneTracker() {
  return (
    <div className="px-5 mt-6">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Milestone Tracker</h2>
      <div className="space-y-2.5">
        {PRACTICE_MILESTONES.map((m) => (
          <div key={m.id} className="rounded-2xl p-3.5" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
            <div className="flex items-center justify-between">
              <p style={{ ...display, color: L.ink, fontSize: 14 }}>{m.current} / {m.target} {m.unit}</p>
              <span style={{ ...body, color: L.inkSoft, fontSize: 11 }}>{Math.round((m.current / m.target) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full mt-2" style={{ background: L.line }}>
              <div className="h-1.5 rounded-full" style={{ width: `${(m.current / m.target) * 100}%`, background: L.gold }} />
            </div>
            <p style={{ ...body, color: L.inkSoft, fontSize: 11, marginTop: 6 }}>Unlocks: {m.unlock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceHistoryCalendar() {
  const statusColor = {
    present: L.green,
    missed: L.danger,
    workshop: L.gold,
    today: L.gold,
    upcoming: L.line,
  };
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="px-5 mt-6 pb-4">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 2 }}>Attendance History</h2>
      <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, marginBottom: 10 }}>{monthLabel}</p>
      <div className="rounded-2xl p-3.5" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
        <div className="grid grid-cols-7 gap-1.5">
          {ATTENDANCE_CALENDAR.map((d) => (
            <div
              key={d.day}
              className="aspect-square rounded-md flex items-center justify-center"
              style={{
                background: d.status === "upcoming" ? L.bg : statusColor[d.status],
                border: d.status === "today" ? `2px solid ${L.green}` : "none",
              }}
            >
              <span style={{ ...body, fontSize: 8.5, color: d.status === "present" || d.status === "missed" || d.status === "workshop" ? "#FFFFFF" : L.inkSoft }}>
                {d.day}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {[
            { label: "Present", color: L.green },
            { label: "Missed", color: L.danger },
            { label: "Workshop", color: L.gold },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: "inline-block" }} />
              <span style={{ ...body, color: L.inkSoft, fontSize: 10.5 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PracticeScreen({ onNav }) {
  const [entries, setEntries] = useState([
    { d: "Yesterday", t: "Felt more open in hips after the evening batch." },
    { d: "3 days ago", t: "Skipped morning practice, did a 10-min video instead." },
  ]);

  useEffect(() => {
    trackEvent("practice_screen_opened");
    trackEvent("weekly_goal_viewed", { ...WEEKLY_GOAL });
    if (WEEKLY_GOAL.completed >= WEEKLY_GOAL.target) {
      trackEvent("goal_completed", { goal: "weekly" });
    }
    trackEvent("milestone_viewed");
    trackEvent("attendance_history_viewed");
  }, []);

  const handleAddReflection = () => {
    const prompt = REFLECTION_PROMPTS[entries.length % REFLECTION_PROMPTS.length];
    setEntries([{ d: "Today", t: prompt }, ...entries]);
    trackEvent("reflection_added");
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4" style={{ background: L.bg }}>
      {/* 1. Header */}
      <div className="px-5 pt-4 pb-1">
        <h1 style={{ ...display, color: L.ink, fontSize: 24 }}>Practice</h1>
        <p style={{ ...body, color: L.inkSoft, fontSize: 12.5, marginTop: 3 }}>Your wellness journey, one day at a time.</p>
      </div>

      {/* 2. Weekly Goal Progress — hero section */}
      <WeeklyGoalHero />

      {/* 3. Progress Snapshot */}
      <ProgressSnapshot />

      {/* 4. Your Goal Journey */}
      <GoalJourneyCard />

      {/* 5. Recommended for Today */}
      <RecommendedForTodayCard onNav={onNav} />

      {/* 6. Continue Learning */}
      <PracticeContinueLearning onNav={onNav} />

      {/* 7. Achievements & Badges */}
      <AchievementBadgesRow />

      {/* 8. Monthly Insights */}
      <MonthlyInsights />

      {/* 9. Personal Reflections (formerly Practice Journal) */}
      <PersonalReflections entries={entries} onAddReflection={handleAddReflection} />

      {/* 10. Milestone Tracker */}
      <MilestoneTracker />

      {/* 11. Attendance History */}
      <AttendanceHistoryCalendar />
    </div>
  );
}

function LibraryScreen({ onOpenWorkshop }) {
  const [tag, setTag] = useState("All");
  const [savedIds, setSavedIds] = useState(() => new Set([2, 4]));
  const shown = VIDEOS.filter((v) => tag === "All" || v.tag === tag);
  const completedCount = VIDEOS.filter((v) => v.completed).length;
  const savedVideos = VIDEOS.filter((v) => savedIds.has(v.id));

  useEffect(() => {
    trackEvent("library_opened");
  }, []);

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        trackEvent("video_saved", { id, saved: false });
      } else {
        next.add(id);
        trackEvent("video_saved", { id, saved: true });
      }
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4" style={{ background: L.bg }}>
      <LightPageTitle eyebrow="YOUR LEARNING HUB" title="Library" subtitle="Personalized practice, at your pace." />

      {/* Completion tracking snapshot */}
      <div className="px-5">
        <div className="rounded-2xl p-3.5 flex items-center justify-between" style={{ background: L.greenSoft }}>
          <div className="flex items-center gap-2.5">
            <Award size={16} color={L.green} />
            <span style={{ ...body, color: L.ink, fontSize: 12.5, fontWeight: 600 }}>
              {completedCount} of {VIDEOS.length} videos completed
            </span>
          </div>
          <div className="w-16 h-1.5 rounded-full" style={{ background: L.line }}>
            <div className="h-1.5 rounded-full" style={{ width: `${(completedCount / VIDEOS.length) * 100}%`, background: L.green }} />
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <LibraryContinueLearning />

      {/* Learning Streak */}
      <LearningStreakCard />

      {/* Daily Practice Picks */}
      <DailyPracticePicks />

      {/* Recommended for You */}
      <RecommendedVideosRail onNav={() => {}} />

      {/* Featured Programs */}
      <FeaturedProgramsRail />

      {/* Workshop Companion Content */}
      <WorkshopCompanionSection onOpenWorkshop={onOpenWorkshop} />

      {/* Featured This Week — YouTube growth */}
      <FeaturedYoutubeCard />

      {/* Saved Videos */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-1.5 mb-2">
          <Bookmark size={15} color={L.green} />
          <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Saved Videos</h2>
        </div>
        {savedVideos.length === 0 ? (
          <p style={{ ...body, color: L.inkSoft, fontSize: 12.5 }}>Tap the bookmark on any video below to save it here.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedVideos.map((v) => (
              <LibraryVideoCard key={v.id} video={v} saved onToggleSave={toggleSave} />
            ))}
          </div>
        )}
      </div>

      {/* Full catalog */}
      <div className="mt-6">
        <h2 className="px-5" style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Full Library</h2>
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto">
          {["All", ...SPECIALISATIONS].map((f) => (
            <Chip key={f} theme="light" active={tag === f} onClick={() => setTag(f)}>
              {f}
            </Chip>
          ))}
        </div>
        <div className="px-5 grid grid-cols-2 gap-3 pb-4">
          {shown.map((v) => (
            <LibraryVideoCard key={v.id} video={v} saved={savedIds.has(v.id)} onToggleSave={toggleSave} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryContinueLearning() {
  return (
    <div className="px-5 mt-5">
      <div className="flex items-center gap-1.5 mb-2">
        <PlayCircle size={15} color={L.green} />
        <h2 style={{ ...display, color: L.ink, fontSize: 17 }}>Continue Learning</h2>
      </div>
      <div className="space-y-2.5">
        {CONTINUE_LEARNING_LIST.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              trackEvent("continue_watching_clicked", { title: c.title });
              trackEvent("video_started", { title: c.title });
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
            style={{ background: L.surface, border: `1px solid ${L.line}` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: L.greenSoft }}>
              <span style={{ fontSize: 20 }}>{c.ic}</span>
            </div>
            <div className="flex-1">
              <p style={{ ...display, color: L.ink, fontSize: 13.5 }}>{c.title}</p>
              <p style={{ ...body, color: L.inkSoft, fontSize: 10.5, marginTop: 2 }}>{c.progressPercent}% Complete · {c.duration}</p>
              <div className="h-1.5 rounded-full mt-1.5" style={{ background: L.line }}>
                <div className="h-1.5 rounded-full" style={{ width: `${c.progressPercent}%`, background: L.green }} />
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full shrink-0" style={{ ...body, fontSize: 10.5, fontWeight: 600, background: L.green, color: "#FFFFFF" }}>
              Continue
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LearningStreakCard() {
  return (
    <div className="px-5 mt-6">
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}
      >
        <span style={{ fontSize: 22 }}>🔥</span>
        <div className="flex-1">
          <p style={{ ...display, color: L.ink, fontSize: 15 }}>{LEARNING_STREAK.days}-Day Learning Streak</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, marginTop: 2 }}>Watch something today to keep it going.</p>
        </div>
      </div>
    </div>
  );
}

function DailyPracticePicks() {
  const picks = getDailyPracticePicks(2);
  return (
    <div className="px-5 mt-6">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 2 }}>Daily Practice Picks</h2>
      <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginBottom: 10 }}>Two short sessions, chosen for today</p>
      <div className="space-y-2.5">
        {picks.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              trackEvent("daily_pick_clicked", { title: p.title });
              trackEvent("video_started", { title: p.title });
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left"
            style={{ background: L.surface, border: `1px solid ${L.line}` }}
          >
            <span style={{ fontSize: 22 }}>{p.ic}</span>
            <div className="flex-1">
              <p style={{ ...display, color: L.ink, fontSize: 13.5 }}>{p.title}</p>
              <p style={{ ...body, color: L.inkSoft, fontSize: 11 }}>{p.duration}</p>
            </div>
            <ChevronRight size={16} color={L.inkSoft} />
          </button>
        ))}
      </div>
    </div>
  );
}

function FeaturedProgramsRail() {
  return (
    <div className="mt-6">
      <h2 className="px-5" style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 8 }}>Featured Programs</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 px-5">
        {FEATURED_PROGRAMS.map((p) => {
          const started = p.modulesCompleted > 0;
          const pct = Math.round((p.modulesCompleted / p.modulesTotal) * 100);
          return (
            <button
              key={p.id}
              onClick={() => trackEvent("program_opened", { title: p.title })}
              className="text-left rounded-2xl p-3.5 shrink-0"
              style={{ background: L.surface, width: 188, border: `1px solid ${L.line}` }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 22 }}>{p.ic}</span>
                <span className="px-2 py-0.5 rounded-full" style={{ ...body, fontSize: 9.5, fontWeight: 700, background: L.greenSoft, color: L.green }}>
                  {p.tag}
                </span>
              </div>
              <p style={{ ...display, color: L.ink, fontSize: 13.5, marginTop: 8, lineHeight: 1.25 }}>{p.title}</p>
              <p style={{ ...body, color: L.inkSoft, fontSize: 10.5, marginTop: 4 }}>{p.modulesCompleted} / {p.modulesTotal} modules</p>
              <div className="h-1.5 rounded-full mt-2" style={{ background: L.line }}>
                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: L.gold }} />
              </div>
              <div
                className="mt-2.5 py-1.5 rounded-full text-center"
                style={{ ...body, fontSize: 11, fontWeight: 600, background: started ? L.green : L.greenSoft, color: started ? "#FFFFFF" : L.green }}
              >
                {started ? "Continue Program" : "Start Program"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkshopCompanionSection({ onOpenWorkshop }) {
  return (
    <div className="px-5 mt-6">
      <h2 style={{ ...display, color: L.ink, fontSize: 17, marginBottom: 2 }}>Workshop Companion Content</h2>
      <p style={{ ...body, color: L.inkSoft, fontSize: 12, marginBottom: 10 }}>Prep and recap videos for your registered workshops</p>
      <div className="space-y-2">
        {WORKSHOP_COMPANION_CONTENT.map((c) => {
          const workshop = WORKSHOPS.find((w) => w.id === c.workshopId);
          if (!workshop) return null;
          return (
            <button
              key={c.id}
              onClick={() => {
                trackEvent("workshop_companion_clicked", { title: c.title, workshopId: c.workshopId });
                onOpenWorkshop(workshop);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
              style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}
            >
              <span style={{ fontSize: 20 }}>{c.ic}</span>
              <div className="flex-1">
                <p style={{ ...display, color: L.ink, fontSize: 13 }}>{c.title}</p>
                <p style={{ ...body, color: L.inkSoft, fontSize: 10.5, marginTop: 2 }}>{c.type} · {c.duration} · for {workshop.title}</p>
              </div>
              <span style={{ ...body, color: L.gold, fontSize: 11, fontWeight: 700 }}>View Workshop</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LibraryVideoCard({ video, saved, onToggleSave }) {
  return (
    <div className="text-left rounded-2xl overflow-hidden relative" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
      <button
        onClick={() => {
          trackEvent(video.completed ? "video_completed" : "video_started", { title: video.title });
        }}
        className="w-full text-left"
      >
        <div className="h-24 flex items-center justify-center relative" style={{ background: L.greenSoft }}>
          <PlayCircle size={30} color={L.green} />
          {video.completed && (
            <span className="absolute top-1.5 left-1.5 flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: L.green }}>
              <Check size={11} color="#FFFFFF" />
            </span>
          )}
        </div>
        <div className="p-3">
          <p style={{ ...display, color: L.ink, fontSize: 13, lineHeight: 1.3 }}>{video.title}</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 11, marginTop: 3 }}>{video.tag} · {video.length}</p>
          {video.progress > 0 && !video.completed && (
            <div className="h-1.5 rounded-full mt-2" style={{ background: L.line }}>
              <div className="h-1.5 rounded-full" style={{ width: `${video.progress}%`, background: L.gold }} />
            </div>
          )}
        </div>
      </button>
      <button
        onClick={() => onToggleSave(video.id)}
        className="absolute top-1.5 right-1.5 p-1.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.9)" }}
      >
        <Bookmark size={14} color={L.gold} fill={saved ? L.gold : "none"} />
      </button>
    </div>
  );
}

function MembershipRenewalCard({ onRenew }) {
  return (
    <div className="px-5 mt-5">
      <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>MEMBERSHIP RENEWAL</p>
      <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.gold}` }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>CURRENT PLAN</p>
            <p style={{ ...display, color: L.ink, fontSize: 15, marginTop: 2 }}>{MEMBERSHIP.plan}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full shrink-0" style={{ ...body, fontSize: 10.5, fontWeight: 700, background: L.greenSoft, color: L.green }}>
            {MEMBERSHIP.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${L.line}` }}>
          <div>
            <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>RENEWAL DATE</p>
            <p style={{ ...display, color: L.ink, fontSize: 15, marginTop: 2 }}>{MEMBERSHIP.renewalDate}</p>
          </div>
          <div>
            <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>MONTHLY FEE</p>
            <p style={{ ...display, color: L.ink, fontSize: 15, marginTop: 2 }}>₹{MEMBERSHIP.monthlyFee}</p>
          </div>
        </div>

        <button
          onClick={onRenew}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-full text-sm"
          style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 700 }}
        >
          <CreditCard size={15} /> Renew Now
        </button>
      </div>
    </div>
  );
}

function ProfileReferralCard({ onOpenReferralHub }) {
  return (
    <div className="px-5 mt-5">
      <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>REFERRAL PROGRAM</p>
      <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1.5px solid ${L.gold}` }}>
        <div className="flex items-center justify-between">
          <span style={{ ...body, color: L.inkSoft, fontSize: 11 }}>Your referral code</span>
          <span style={{ ...display, color: L.gold, fontSize: 16, letterSpacing: 1 }}>{REFERRAL_CODE}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${L.line}` }}>
          <div>
            <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>REFERRAL COUNT</p>
            <p style={{ ...display, color: L.ink, fontSize: 19, marginTop: 2 }}>{REFERRAL_STATS.totalReferrals}</p>
          </div>
          <div>
            <p style={{ ...body, color: L.inkSoft, fontSize: 10, letterSpacing: 1 }}>TOTAL REWARDS EARNED</p>
            <p style={{ ...display, color: L.ink, fontSize: 19, marginTop: 2 }}>₹{REFERRAL_WALLET.lifetimeCredits}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              trackEvent("referral_clicked", { source: "profile_share" });
              shareReferral({ code: REFERRAL_CODE, channel: "native" });
            }}
            className="flex-1 py-2.5 rounded-full text-sm"
            style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600 }}
          >
            Share Referral Link
          </button>
          <button
            onClick={() => {
              trackEvent("referral_clicked", { source: "profile_view_rewards" });
              onOpenReferralHub();
            }}
            className="px-4 py-2.5 rounded-full text-sm"
            style={{ ...body, background: L.goldSoft, color: L.gold, fontWeight: 600, border: `1px solid ${L.gold}` }}
          >
            View Rewards
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock payment flow — the hook point for a real Razorpay/UPI integration.
// In production, "Pay Now" would call something like:
//
//   const options = {
//     key: process.env.RAZORPAY_KEY_ID,
//     amount: MEMBERSHIP.monthlyFee * 100, // paise
//     currency: "INR",
//     name: "Divya Yoga Studio",
//     description: "Membership Renewal",
//     method: { upi: true, card: true, netbanking: true },
//     handler: (response) => confirmRenewalOnBackend(response),
//   };
//   const rzp = new window.Razorpay(options);
//   rzp.open();
//
// which requires loading Razorpay's checkout.js — not available inside
// this browser mockup's sandbox, so payment here is simulated end to end.
function RenewMembershipScreen({ onClose }) {
  const [state, setState] = useState("view"); // view | processing | success

  const handlePay = () => {
    trackEvent("renewal_payment_started", { method: "razorpay_upi" });
    setState("processing");
    setTimeout(() => {
      setState("success");
      trackEvent("renewal_payment_success");
    }, 1200);
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <LightPageTitle eyebrow="MEMBERSHIP" title="Renew Membership" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {state !== "success" ? (
          <>
            <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
              <div className="flex items-center justify-between">
                <span style={{ ...body, color: L.inkSoft, fontSize: 12 }}>Plan</span>
                <span style={{ ...display, color: L.ink, fontSize: 14 }}>{MEMBERSHIP.plan}</span>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span style={{ ...body, color: L.inkSoft, fontSize: 12 }}>New renewal date</span>
                <span style={{ ...display, color: L.ink, fontSize: 14 }}>4 Sep 2026</span>
              </div>
              <div className="flex items-center justify-between mt-3.5 pt-3.5" style={{ borderTop: `1px solid ${L.line}` }}>
                <span style={{ ...body, color: L.ink, fontSize: 13, fontWeight: 600 }}>Amount due</span>
                <span style={{ ...display, color: L.green, fontSize: 20 }}>₹{MEMBERSHIP.monthlyFee}</span>
              </div>
            </div>

            <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, marginTop: 14, lineHeight: 1.5 }}>
              Secure checkout via Razorpay — pay by UPI, card, or netbanking.
            </p>

            <button
              onClick={handlePay}
              disabled={state === "processing"}
              className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-full text-sm"
              style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 700, opacity: state === "processing" ? 0.7 : 1 }}
            >
              <CreditCard size={16} /> {state === "processing" ? "Processing…" : `Pay ₹${MEMBERSHIP.monthlyFee} via Razorpay / UPI`}
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center" style={{ minHeight: 320 }}>
            <div className="p-3 rounded-full mb-4" style={{ background: L.greenSoft }}>
              <Check size={26} color={L.green} />
            </div>
            <h2 style={{ ...display, color: L.ink, fontSize: 20 }}>Membership Renewed</h2>
            <p style={{ ...body, color: L.inkSoft, fontSize: 13, marginTop: 4 }}>Your plan is active until 4 Sep 2026.</p>
          </div>
        )}
      </div>
      {state === "success" && (
        <div className="p-5">
          <button onClick={onClose} className="w-full py-3.5 rounded-full" style={{ ...body, background: L.surface, color: L.ink, fontWeight: 600, fontSize: 15, border: `1px solid ${L.line}` }}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

function RulesScreen({ onClose }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <LightPageTitle eyebrow="PLEASE READ" title="Studio Rules & Guidelines" onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="space-y-2">
          {STUDIO_RULES.map((rule, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
              <span
                className="shrink-0 mt-0.5"
                style={{ ...body, background: L.greenSoft, color: L.green, fontSize: 10, fontWeight: 700, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}
              >
                {i + 1}
              </span>
              <p style={{ ...body, color: L.ink, fontSize: 13, lineHeight: 1.45 }}>{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SimpleInfoScreen({ eyebrow, title, paragraphs, onClose }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      <LightPageTitle eyebrow={eyebrow} title={title} onBack={onClose} />
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} style={{ ...body, color: L.inkSoft, fontSize: 13, lineHeight: 1.6 }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

function LogoutScreen({ onCancel, onConfirmed }) {
  const [state, setState] = useState("confirm"); // confirm | out
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: L.bg, zIndex: 30 }}>
      {state === "confirm" ? (
        <>
          <LightPageTitle eyebrow="ACCOUNT" title="Log Out" onBack={onCancel} />
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p style={{ ...body, color: L.inkSoft, fontSize: 13.5, lineHeight: 1.5 }}>
              You'll need to sign back in to check in for class, book workshops, and view your rewards.
            </p>
          </div>
          <div className="p-5 space-y-2.5">
            <button
              onClick={() => {
                trackEvent("logout_confirmed");
                setState("out");
              }}
              className="w-full py-3.5 rounded-full"
              style={{ ...body, background: L.danger, color: "#FFFFFF", fontWeight: 700, fontSize: 15 }}
            >
              Log Out
            </button>
            <button onClick={onCancel} className="w-full py-3.5 rounded-full" style={{ ...body, background: L.surface, color: L.ink, fontWeight: 600, fontSize: 15, border: `1px solid ${L.line}` }}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="p-3 rounded-full mb-4" style={{ background: L.greenSoft }}>
            <Check size={26} color={L.green} />
          </div>
          <h2 style={{ ...display, color: L.ink, fontSize: 20 }}>You're logged out</h2>
          <p style={{ ...body, color: L.inkSoft, fontSize: 13, marginTop: 4, marginBottom: 20 }}>See you back on the mat soon.</p>
          <button onClick={onConfirmed} className="px-6 py-3 rounded-full" style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 600, fontSize: 14 }}>
            Log Back In
          </button>
        </div>
      )}
    </div>
  );
}


function ProfileScreen({ onOpenReferralHub, onOpenNotificationPrefs, onOpenProfileOverlay }) {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: L.bg }}>
      <LightPageTitle eyebrow="MEMBER SINCE JUL 2026" title="Profile" />
      <div className="flex items-center gap-3 px-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: L.green }}>
          <span style={{ ...display, color: "#FFFFFF", fontSize: 20 }}>S</span>
        </div>
        <div>
          <p style={{ ...display, color: L.ink, fontSize: 17 }}>Shital</p>
          <p style={{ ...body, color: L.inkSoft, fontSize: 12 }}>Offline batch · ₹1,200/mo · renews 4 Aug</p>
        </div>
      </div>

      {/* Membership Renewal — directly below the profile card */}
      <MembershipRenewalCard onRenew={() => onOpenProfileOverlay("renewal")} />

      {/* Studio Check-In (renamed from "Check-in code") */}
      <div className="px-5 mt-5">
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: L.green }}>
          <div>
            <p style={{ ...body, color: "rgba(255,255,255,0.75)", fontSize: 11 }}>STUDIO CHECK-IN</p>
            <p style={{ ...display, color: "#FFFFFF", fontSize: 15, marginTop: 2 }}>Scan at the studio</p>
          </div>
          <div className="p-2 rounded-xl" style={{ background: "#FFFFFF" }}>
            <QrCode size={34} color={L.green} />
          </div>
        </div>
      </div>

      {/* Enhanced Referral Program */}
      <ProfileReferralCard onOpenReferralHub={onOpenReferralHub} />

      <div className="px-5 mt-5 space-y-2.5 pb-4">
        <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>MORE FROM THE STUDIO</p>
        <Row icon={Star} title="Workshops & retreats" sub="PCOS & prenatal special sessions" tag="New" />
        <Row icon={ListChecks} title="Studio Rules & Guidelines" sub="Please read before your first class" onClick={() => onOpenProfileOverlay("rules")} />

        <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 10 }}>CONTACT</p>
        <button className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left" style={{ background: L.whatsapp }}>
          <MessageCircle size={18} color="#FFFFFF" />
          <div className="flex-1">
            <p style={{ ...body, color: "#FFFFFF", fontSize: 13, fontWeight: 600 }}>Chat with Archana ji</p>
            <p style={{ ...body, color: "rgba(255,255,255,0.85)", fontSize: 11 }}>+91 93566 81834 · WhatsApp</p>
          </div>
        </button>

        <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 10 }}>SETTINGS</p>
        <Row icon={Bell} title="Notifications" sub="Class, workshop, video, and streak alerts" onClick={onOpenNotificationPrefs} />
        <Row icon={ShieldCheck} title="Privacy Policy" onClick={() => onOpenProfileOverlay("privacy")} />
        <Row icon={FileText} title="Terms & Conditions" onClick={() => onOpenProfileOverlay("terms")} />
        <Row icon={Info} title="About Divya Yoga Studio" onClick={() => onOpenProfileOverlay("about")} />
        <Row icon={LogOut} title="Logout" onClick={() => onOpenProfileOverlay("logout")} />
      </div>
    </div>
  );
}

// ---- App shell -----------------------------------------------------------
const TABS = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "workshops", label: "Workshops", icon: Star },
  { id: "practice", label: "Practice", icon: Activity },
  { id: "library", label: "Library", icon: PlayCircle },
  { id: "profile", label: "Profile", icon: User },
];

// =========================================================================
// ONBOARDING FLOW — 11 screens shown before the main app, matching the
// production Expo Router flow delivered separately. This version keeps
// step/answer state locally with useState so it can render live here;
// the RN version persists the same shape to AsyncStorage.
// =========================================================================

const ONBOARDING_GOAL_OPTIONS = [
  "Weight Loss", "Flexibility", "Stress Relief", "Better Sleep", "PCOS Support",
  "Back Pain Relief", "Improve Fitness", "Meditation & Mindfulness", "Pranayama", "General Wellness",
];
const ONBOARDING_EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Regular Practitioner", "Returning After a Break"];
const ONBOARDING_PRACTICE_TIME_OPTIONS = ["Early Morning", "Morning", "Evening", "Flexible"];
const ONBOARDING_INTEREST_OPTIONS = [
  "Yoga Classes", "Workshops", "Face Yoga", "Meditation", "Pranayama",
  "Wellness Tips", "Cleansing Practices", "Library Videos", "Challenges",
];
const ONBOARDING_WEEKLY_GOAL_OPTIONS = [
  { label: "3 Classes", value: 3 },
  { label: "4 Classes", value: 4 },
  { label: "5 Classes", value: 5 },
  { label: "6 Classes", value: 6 },
  { label: "Daily Practice", value: 7 },
];
// Onboarding-specific labels layered over the same category ids used by
// the app's real Notification Preferences screen.
const ONBOARDING_NOTIFICATION_LABELS = {
  classReminders: "Class Reminders",
  workshopUpdates: "Workshop Updates",
  newVideos: "New Videos",
  wellnessInspiration: "Daily Intention",
  streakAchievements: "Achievements",
  membershipReminders: "Membership Reminders",
  referralUpdates: "Referral Rewards",
};

const ONBOARDING_REC_MAP = {
  "Weight Loss": "Morning Fat Burn Yoga",
  "Flexibility": "Deep Stretch Flow",
  "Stress Relief": "Calming Evening Flow",
  "Better Sleep": "Yoga for Better Sleep",
  "PCOS Support": "PCOS Hormone Balance",
  "Back Pain Relief": "Gentle Back Care Flow",
  "Improve Fitness": "Full Body Fitness",
  "Meditation & Mindfulness": "10-Min Guided Meditation",
  "Pranayama": "Pranayama for Energy",
  "General Wellness": "Face Yoga Basics",
};
function getOnboardingRecommendations(goals) {
  const picks = goals.map((g) => ONBOARDING_REC_MAP[g]).filter(Boolean);
  const fallback = ["Morning Fat Burn Yoga", "Face Yoga Basics", "Pranayama for Energy"];
  return [...new Set([...picks, ...fallback])].slice(0, 3);
}

function OnboardingProgress({ step, total = 11 }) {
  return (
    <div className="flex-1 flex items-center justify-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{ height: 6, borderRadius: 3, width: i === step - 1 ? 18 : 6, background: i < step ? L.gold : L.line, transition: "width 0.15s" }}
        />
      ))}
    </div>
  );
}

function OnboardingShell({ step, eyebrow, heading, subheading, onBack, footer, children }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: L.bg }}>
      <div className="flex items-center px-4 pt-4">
        {onBack ? (
          <button onClick={onBack} className="p-1 -ml-1 rounded-full shrink-0" style={{ color: L.ink }}>
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div style={{ width: 28 }} className="shrink-0" />
        )}
        <OnboardingProgress step={step} />
        <div style={{ width: 28 }} className="shrink-0" />
      </div>
      <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4">
        {eyebrow && <p style={{ ...body, color: L.green, fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>{eyebrow}</p>}
        {heading && <h1 style={{ ...display, color: L.ink, fontSize: 23, marginTop: 6, lineHeight: 1.3 }}>{heading}</h1>}
        {subheading && <p style={{ ...body, color: L.inkSoft, fontSize: 12.5, marginTop: 8, lineHeight: 1.5 }}>{subheading}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && <div className="px-6 pb-6 pt-2">{footer}</div>}
    </div>
  );
}

function SelectableRow({ label, selected, onClick, mode = "checkbox" }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 rounded-2xl mb-2.5 text-left"
      style={{ background: selected ? L.goldSoft : L.surface, border: `1px solid ${selected ? L.gold : L.line}` }}
    >
      <span style={{ ...display, color: L.ink, fontSize: 14.5 }}>{label}</span>
      <span
        className="shrink-0"
        style={{
          width: 22,
          height: 22,
          borderRadius: mode === "checkbox" ? 6 : 11,
          border: `1.5px solid ${selected ? L.green : L.line}`,
          background: selected ? L.green : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && mode === "checkbox" && <Check size={13} color="#FFFFFF" />}
        {selected && mode === "radio" && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#FFFFFF" }} />}
      </span>
    </button>
  );
}

function OnboardingPrimaryButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 rounded-full text-sm"
      style={{ ...body, background: L.green, color: "#FFFFFF", fontWeight: 700, fontSize: 15, opacity: disabled ? 0.5 : 1 }}
    >
      {label}
    </button>
  );
}

function OnboardingSecondaryLink({ label, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-center py-2.5" style={{ ...body, color: L.inkSoft, fontSize: 12.5, fontWeight: 500 }}>
      {label}
    </button>
  );
}

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    goals: [],
    experience: null,
    practiceTime: null,
    interests: [],
    weeklyGoal: null,
    notificationPrefs: Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.id, true])),
    notificationsEnabled: false,
  });

  useEffect(() => {
    trackEvent("onboarding_started");
  }, []);

  const toggleArr = (field, value) =>
    setAnswers((a) => ({ ...a, [field]: a[field].includes(value) ? a[field].filter((v) => v !== value) : [...a[field], value] }));
  const setField = (field, value) => setAnswers((a) => ({ ...a, [field]: value }));
  const next = () => setStep((s) => Math.min(s + 1, 11));
  const back = () => setStep((s) => Math.max(s - 1, 1));
  const weeklyGoalLabel = ONBOARDING_WEEKLY_GOAL_OPTIONS.find((o) => o.value === answers.weeklyGoal)?.label;

  let screen;

  if (step === 1) {
    // Screen 1 — Welcome (full-bleed, no progress dots per spec)
    screen = (
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: L.bg }}>
        <div className="flex-1" style={{ background: `linear-gradient(160deg, ${L.greenSoft}, ${L.goldSoft})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Placeholder for a warm photo/video still of Archana Tai */}
          <span style={{ fontSize: 84 }}>🙏</span>
        </div>
        <div className="px-7 pt-7">
          <h1 style={{ ...display, color: L.ink, fontSize: 26, lineHeight: 1.3, textAlign: "center" }}>Welcome to Divya Yoga Studio 🙏</h1>
          <p style={{ ...body, color: L.inkSoft, fontSize: 13.5, marginTop: 12, lineHeight: 1.55, textAlign: "center" }}>
            Your journey toward wellness, balance, and mindful living starts here.
          </p>
        </div>
        <div className="px-7 pb-7 pt-6">
          <OnboardingPrimaryButton
            label="Begin My Journey"
            onClick={() => {
              trackEvent("welcome_completed");
              next();
            }}
          />
        </div>
      </div>
    );
  } else if (step === 2) {
    screen = (
      <OnboardingShell
        step={2}
        eyebrow="FROM YOUR INSTRUCTOR"
        heading="A Message from Archana Tai"
        onBack={back}
        footer={<OnboardingPrimaryButton label="Continue" onClick={next} />}
      >
        <div className="rounded-2xl p-5" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
          <p style={{ ...body, color: L.ink, fontSize: 14, lineHeight: 1.6 }}>Namaste 🙏</p>
          <p style={{ ...body, color: L.ink, fontSize: 14, lineHeight: 1.6, marginTop: 14 }}>
            Yoga is not about perfection. It is about showing up for yourself every day.
          </p>
          <p style={{ ...body, color: L.ink, fontSize: 14, lineHeight: 1.6, marginTop: 14 }}>
            Whether your goal is weight loss, flexibility, healing, stress relief, or overall wellness, we will
            support you throughout your journey.
          </p>
          <p style={{ ...body, color: L.ink, fontSize: 14, lineHeight: 1.6, marginTop: 14 }}>I look forward to practicing with you.</p>
          <p style={{ ...display, color: L.green, fontSize: 15, marginTop: 16 }}>— Archana Tai</p>
        </div>
      </OnboardingShell>
    );
  } else if (step === 3) {
    screen = (
      <OnboardingShell
        step={3}
        eyebrow="PERSONALIZE YOUR PRACTICE"
        heading="What would you like to achieve?"
        subheading="Select as many as apply — we'll tailor your classes and recommendations around these."
        onBack={back}
        footer={<OnboardingPrimaryButton label="Continue" disabled={answers.goals.length === 0} onClick={next} />}
      >
        {ONBOARDING_GOAL_OPTIONS.map((g) => (
          <SelectableRow key={g} label={g} selected={answers.goals.includes(g)} onClick={() => toggleArr("goals", g)} />
        ))}
      </OnboardingShell>
    );
  } else if (step === 4) {
    screen = (
      <OnboardingShell
        step={4}
        eyebrow="YOUR PRACTICE"
        heading="How would you describe your yoga experience?"
        onBack={back}
        footer={<OnboardingPrimaryButton label="Continue" disabled={!answers.experience} onClick={next} />}
      >
        {ONBOARDING_EXPERIENCE_OPTIONS.map((o) => (
          <SelectableRow key={o} mode="radio" label={o} selected={answers.experience === o} onClick={() => setField("experience", o)} />
        ))}
      </OnboardingShell>
    );
  } else if (step === 5) {
    screen = (
      <OnboardingShell
        step={5}
        eyebrow="YOUR ROUTINE"
        heading="When do you usually prefer practicing?"
        subheading="We'll time your class reminders around this."
        onBack={back}
        footer={<OnboardingPrimaryButton label="Continue" disabled={!answers.practiceTime} onClick={next} />}
      >
        {ONBOARDING_PRACTICE_TIME_OPTIONS.map((o) => (
          <SelectableRow key={o} mode="radio" label={o} selected={answers.practiceTime === o} onClick={() => setField("practiceTime", o)} />
        ))}
      </OnboardingShell>
    );
  } else if (step === 6) {
    screen = (
      <OnboardingShell
        step={6}
        eyebrow="EXPLORE THE STUDIO"
        heading="What would you like to explore?"
        subheading="This shapes what you see first on Home and in the Library."
        onBack={back}
        footer={<OnboardingPrimaryButton label="Continue" disabled={answers.interests.length === 0} onClick={next} />}
      >
        {ONBOARDING_INTEREST_OPTIONS.map((o) => (
          <SelectableRow key={o} label={o} selected={answers.interests.includes(o)} onClick={() => toggleArr("interests", o)} />
        ))}
      </OnboardingShell>
    );
  } else if (step === 7) {
    screen = (
      <OnboardingShell
        step={7}
        eyebrow="COMMIT TO YOURSELF"
        heading="How many classes would you like to attend each week?"
        onBack={back}
        footer={<OnboardingPrimaryButton label="Continue" disabled={!answers.weeklyGoal} onClick={next} />}
      >
        {ONBOARDING_WEEKLY_GOAL_OPTIONS.map((o) => (
          <SelectableRow key={o.value} mode="radio" label={o.label} selected={answers.weeklyGoal === o.value} onClick={() => setField("weeklyGoal", o.value)} />
        ))}
        <p style={{ ...body, color: L.inkSoft, fontSize: 12, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
          Small consistent steps create lasting results.
        </p>
      </OnboardingShell>
    );
  } else if (step === 8) {
    screen = (
      <OnboardingShell
        step={8}
        eyebrow="NEVER MISS A MOMENT"
        heading="Stay Connected to Your Practice"
        onBack={back}
        footer={
          <>
            <OnboardingPrimaryButton
              label="Enable Notifications"
              onClick={() => {
                setField("notificationsEnabled", true);
                trackEvent("notifications_enabled", { categories: Object.keys(answers.notificationPrefs).filter((k) => answers.notificationPrefs[k]) });
                next();
              }}
            />
            <OnboardingSecondaryLink
              label="Skip for now"
              onClick={() => {
                setField("notificationPrefs", Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.id, false])));
                setField("notificationsEnabled", false);
                next();
              }}
            />
          </>
        }
      >
        {NOTIFICATION_CATEGORIES.map((c) => (
          <SelectableRow
            key={c.id}
            label={ONBOARDING_NOTIFICATION_LABELS[c.id]}
            selected={!!answers.notificationPrefs[c.id]}
            onClick={() => setField("notificationPrefs", { ...answers.notificationPrefs, [c.id]: !answers.notificationPrefs[c.id] })}
          />
        ))}
        <p style={{ ...body, color: L.inkSoft, fontSize: 11.5, textAlign: "center", marginTop: 8 }}>You can change these later from Settings.</p>
      </OnboardingShell>
    );
  } else if (step === 9) {
    screen = (
      <OnboardingShell
        step={9}
        eyebrow="GROW TOGETHER"
        heading="Share Wellness with Friends"
        subheading="Invite friends to join Divya Yoga Studio and earn rewards."
        onBack={back}
        footer={
          <OnboardingPrimaryButton
            label="Sounds Great"
            onClick={() => {
              trackEvent("referral_intro_viewed");
              next();
            }}
          />
        }
      >
        <div className="rounded-2xl p-5" style={{ background: L.goldSoft, border: `1px solid ${L.gold}` }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3.5" style={{ background: L.gold }}>
            <Gift size={20} color="#FFFFFF" />
          </div>
          {["Referral Credits", "Free Workshops", "Special Rewards"].map((b) => (
            <div key={b} className="flex items-center gap-2.5 mt-2">
              <span style={{ width: 6, height: 6, borderRadius: 3, background: L.gold }} />
              <span style={{ ...body, color: L.ink, fontSize: 14 }}>{b}</span>
            </div>
          ))}
        </div>
      </OnboardingShell>
    );
  } else if (step === 10) {
    const recs = getOnboardingRecommendations(answers.goals);
    screen = (
      <OnboardingShell
        step={10}
        eyebrow="MADE FOR YOU"
        heading="Welcome, Shital!"
        onBack={back}
        footer={<OnboardingPrimaryButton label="Continue" onClick={next} />}
      >
        <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>YOUR FOCUS AREAS</p>
        <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
          {(answers.goals.length ? answers.goals : ["General Wellness"]).map((g) => (
            <div key={g} className="flex items-center gap-2 mb-1.5">
              <Check size={14} color={L.green} />
              <span style={{ ...display, color: L.ink, fontSize: 14 }}>{g}</span>
            </div>
          ))}
        </div>

        <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 18, marginBottom: 8 }}>WEEKLY GOAL</p>
        <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
          <span style={{ ...display, color: L.green, fontSize: 19 }}>{weeklyGoalLabel || "5 Classes"}</span>
        </div>

        <p style={{ ...body, color: L.inkSoft, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginTop: 18, marginBottom: 8 }}>RECOMMENDED FOR YOU</p>
        <div className="rounded-2xl p-4" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
          {recs.map((r) => (
            <div key={r} className="flex items-center gap-2 mb-2">
              <PlayCircle size={15} color={L.green} />
              <span style={{ ...body, color: L.ink, fontSize: 13 }}>{r}</span>
            </div>
          ))}
        </div>
      </OnboardingShell>
    );
  } else {
    // Step 11 — Ready to Begin
    screen = (
      <OnboardingShell
        step={11}
        eyebrow="LET'S GO"
        heading="Your Wellness Journey Begins Today 🌿"
        footer={
          <OnboardingPrimaryButton
            label="Go to My Home Screen"
            onClick={() => {
              trackEvent("onboarding_completed", { goals: answers.goals, weeklyGoal: answers.weeklyGoal });
              onComplete();
            }}
          />
        }
      >
        <div className="rounded-2xl px-4" style={{ background: L.surface, border: `1px solid ${L.line}` }}>
          {[
            ["Goal", answers.goals[0] || "General Wellness"],
            ["Weekly Goal", weeklyGoalLabel || "5 Classes"],
            ["Practice Time", answers.practiceTime || "Flexible"],
            ["Notifications", answers.notificationsEnabled ? "Enabled" : "Skipped"],
          ].map(([label, value], i, arr) => (
            <div key={label} className="flex items-center justify-between py-3.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${L.line}` : "none" }}>
              <span style={{ ...body, color: L.inkSoft, fontSize: 12.5 }}>{label}</span>
              <span style={{ ...display, color: L.ink, fontSize: 15 }}>{value}</span>
            </div>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: "#0E0B08", ...body }}>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{ width: 390, height: 780, background: L.bg, borderRadius: 40, border: "10px solid #0E0B08", boxShadow: "0 30px 60px rgba(0,0,0,0.55)" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40" style={{ width: 120, height: 22, background: "#0E0B08", borderRadius: "0 0 16px 16px" }} />
        {screen}
      </div>
    </div>
  );
}

function MainApp() {
  const [tab, setTab] = useState("home");
  const [openBatch, setOpenBatch] = useState(null);
  const [openWorkshop, setOpenWorkshop] = useState(null);
  const [profileOverlay, setProfileOverlay] = useState(null); // 'renewal' | 'rules' | 'privacy' | 'terms' | 'about' | 'logout' | null
  const [showReferralHub, setShowReferralHub] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(() =>
    Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.id, c.defaultEnabled]))
  );
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  const closeOverlays = () => {
    setOpenBatch(null);
    setOpenWorkshop(null);
    setProfileOverlay(null);
    setShowReferralHub(false);
    setShowTimetable(false);
    setShowNotificationCenter(false);
    setShowNotificationPrefs(false);
  };

  const openReferralHub = () => setShowReferralHub(true);

  const navigate = (nextTab) => {
    closeOverlays();
    setTab(nextTab);
  };

  const handleTogglePref = (categoryId, next) => {
    setNotificationPrefs((prev) => ({ ...prev, [categoryId]: next }));
    trackEvent(next ? "notification_enabled" : "notification_disabled", { category: categoryId });
  };

  // Deep-links a tapped notification to the right screen, the same routing
  // a real FCM notification-tap handler would perform.
  const openNotificationTarget = (n) => {
    setReadNotificationIds((ids) => [...ids, n.feedId]);
    setShowNotificationCenter(false);
    if (n.action === "workshop") {
      const w = WORKSHOPS.find((x) => x.id === n.workshopId) || NEAREST_WORKSHOP;
      setTab("workshops");
      setOpenWorkshop(w);
    } else if (n.action === "referral") {
      setShowReferralHub(true);
    } else {
      setTab(n.action);
    }
  };

  const unreadCount = NOTIFICATION_FEED.filter((n) => notificationPrefs[n.category] && !readNotificationIds.includes(n.feedId)).length;

  const screens = {
    home: (
      <HomeScreen
        onOpenWorkshop={setOpenWorkshop}
        onOpenReferralHub={openReferralHub}
        onOpenTimetable={() => {
          trackEvent("weekly_timetable_opened");
          setShowTimetable(true);
        }}
        onNav={navigate}
      />
    ),
    workshops: <WorkshopsScreen onOpenWorkshop={setOpenWorkshop} onOpenRecordings={() => {}} />,
    practice: <PracticeScreen onNav={navigate} />,
    library: <LibraryScreen onOpenWorkshop={setOpenWorkshop} />,
    profile: (
      <ProfileScreen
        onOpenReferralHub={openReferralHub}
        onOpenNotificationPrefs={() => setShowNotificationPrefs(true)}
        onOpenProfileOverlay={(key) => setProfileOverlay(key)}
      />
    ),
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: "#0E0B08", ...body }}>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: 780,
          background: L.bg,
          borderRadius: 40,
          border: "10px solid #0E0B08",
          boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40" style={{ width: 120, height: 22, background: "#0E0B08", borderRadius: "0 0 16px 16px" }} />

        <CreamHeader onOpenNotifications={() => setShowNotificationCenter(true)} unreadCount={unreadCount} />

        <div className="relative flex-1 flex flex-col overflow-hidden">
          {screens[tab]}
          {openBatch && <BatchDetail batch={openBatch} onClose={() => setOpenBatch(null)} />}
          {openWorkshop && (
            <WorkshopDetail workshop={openWorkshop} onClose={() => setOpenWorkshop(null)} onOpenReferralHub={openReferralHub} />
          )}
          {showReferralHub && <ReferralHubScreen onClose={() => setShowReferralHub(false)} />}
          {profileOverlay === "renewal" && <RenewMembershipScreen onClose={() => setProfileOverlay(null)} />}
          {profileOverlay === "rules" && <RulesScreen onClose={() => setProfileOverlay(null)} />}
          {profileOverlay === "privacy" && (
            <SimpleInfoScreen
              eyebrow="LEGAL"
              title="Privacy Policy"
              onClose={() => setProfileOverlay(null)}
              paragraphs={[
                "Divya Yoga Studio collects only the information needed to run your membership: your name, contact details, batch enrollment, attendance, and payment records.",
                "We never sell your personal information. Data shared with payment processors (such as Razorpay) is used solely to process membership renewals.",
                "You can request a copy of your data, or ask us to delete it, anytime by messaging Archana ji on WhatsApp.",
              ]}
            />
          )}
          {profileOverlay === "terms" && (
            <SimpleInfoScreen
              eyebrow="LEGAL"
              title="Terms & Conditions"
              onClose={() => setProfileOverlay(null)}
              paragraphs={[
                "Membership fees are payable in advance and are non-refundable and non-transferable once a billing cycle begins.",
                "Missed classes cannot be carried forward or adjusted against future sessions.",
                "The studio reserves the right to update batch timings, instructors, or these terms with reasonable notice to members.",
                "By continuing your membership, you agree to the Studio Rules & Guidelines available elsewhere in this app.",
              ]}
            />
          )}
          {profileOverlay === "about" && (
            <SimpleInfoScreen
              eyebrow="OUR STUDIO"
              title="About Divya Yoga Studio"
              onClose={() => setProfileOverlay(null)}
              paragraphs={[
                "Divya Yoga Studio is a Kothrud, Pune based practice led by Archana ji, offering daily batches across Weight Loss, PCOS, Prenatal, and Fitness-focused yoga.",
                "Every batch blends personalised guidance within a small group setting, alongside seasonal workshops and an on-demand video library for home practice.",
                "Our mission is simple: consistent, supportive yoga practice that fits into everyday life.",
              ]}
            />
          )}
          {profileOverlay === "logout" && (
            <LogoutScreen onCancel={() => setProfileOverlay(null)} onConfirmed={() => setProfileOverlay(null)} />
          )}
          {showTimetable && <WeeklyTimetableModal onClose={() => setShowTimetable(false)} />}
          {showNotificationCenter && (
            <NotificationCenterScreen
              prefs={notificationPrefs}
              onClose={() => setShowNotificationCenter(false)}
              onOpenTarget={openNotificationTarget}
            />
          )}
          {showNotificationPrefs && (
            <NotificationPreferencesScreen
              prefs={notificationPrefs}
              onTogglePref={handleTogglePref}
              onClose={() => setShowNotificationPrefs(false)}
            />
          )}
        </div>

        <div className="flex justify-around items-center py-3 px-2" style={{ background: L.surface, borderTop: `1px solid ${L.line}` }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  navigate(t.id);
                }}
                className="flex flex-col items-center gap-1 px-2"
              >
                <t.icon size={19} color={active ? L.green : L.inkSoft} />
                <span style={{ ...body, fontSize: 10, color: active ? L.ink : L.inkSoft, fontWeight: active ? 600 : 400 }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Root — onboarding first, then the main app -------------------------
export default function DivyaYogaApp() {
  const [phase, setPhase] = useState("onboarding"); // "onboarding" | "app"
  return phase === "onboarding" ? <OnboardingFlow onComplete={() => setPhase("app")} /> : <MainApp />;
}
