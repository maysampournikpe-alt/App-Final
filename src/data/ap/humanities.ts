import type { Outline } from "./types";
const U = (title: string, topics: string[]) => ({ title, topics });

const SHORT = ["Introduction to Short Fiction", "Character", "Setting", "Structure", "Narration and Point of View", "Figurative Language and Symbolism", "Literary Argumentation: Claims and Evidence"];
const POETRY = ["Introduction to Poetry", "Speaker and Voice", "Imagery and Diction", "Form and Structure", "Figurative Language", "Tone and Shifts", "Literary Argumentation: Claims and Evidence"];
const LONG = ["Introduction to Longer Fiction or Drama", "Character and Conflict", "Setting and Staging", "Structure and Plot", "Narration, Perspective, and Dramatic Devices", "Symbolism and Theme", "Literary Argumentation: Claims and Evidence"];

/** The six themes every AP world-language course shares, with the contexts the College Board framework lists for each. */
const THEMES = (): Outline["units"] => [
  U("Families and Communities", ["Customs and Values", "Educational Communities", "Family Structures", "Global Citizenship", "Human Geography", "Nutrition and Food Science", "Social Networking"]),
  U("Personal and Public Identities", ["Alienation and Assimilation", "Heroes and Historical Figures", "National and Ethnic Identities", "Personal Beliefs", "Personal Interests"]),
  U("Beauty and Aesthetics", ["Architecture", "Defining Beauty", "Defining Creativity", "Fashion and Design", "Entertainment", "Language and Literature", "Visual Arts"]),
  U("Science and Technology", ["Access to Technology", "Effects of Technology on Self and Society", "Health Care and Medicine", "Innovations", "Natural Phenomena", "Science and Ethics"]),
  U("Contemporary Life", ["Education and Careers", "Entertainment and Leisure", "Travel", "Social Customs and Values", "Volunteerism", "Housing and Cities"]),
  U("Global Challenges", ["Economic Issues", "Environmental Issues", "Philosophical Thought and Religion", "Population and Demographics", "Social Welfare", "Social Conscience"]),
];

export const HUMANITIES: Record<string, Outline> = {
  "AP English Literature and Composition": { units: [
    U("Short Fiction I", SHORT), U("Poetry I", POETRY), U("Longer Fiction or Drama I", LONG),
    U("Short Fiction II", SHORT), U("Poetry II", POETRY), U("Longer Fiction or Drama II", LONG),
    U("Short Fiction III", SHORT), U("Poetry III", POETRY), U("Longer Fiction or Drama III", LONG),
  ] },
  "AP English Language and Composition": { units: [
    U("Rhetorical Situation and Claims", ["Rhetorical Situation: Speaker, Audience, Purpose, Context", "Identifying Claims", "Evidence and Commentary", "Writing a Defensible Thesis"]),
    U("Claims and Evidence", ["Types of Evidence", "Selecting and Evaluating Evidence", "Qualifying Claims", "Developing Commentary"]),
    U("Reasoning and Organization", ["Inductive and Deductive Reasoning", "Logical Fallacies", "Organizing an Argument", "Transitions and Coherence"]),
    U("Style", ["Diction and Syntax", "Tone", "Rhetorical Devices", "Imagery and Figurative Language"]),
    U("Rhetorical Analysis Essay", ["Reading the Prompt", "Analyzing Rhetorical Choices", "Building Line of Reasoning", "Sophistication in Analysis"]),
    U("Argument Essay", ["Taking a Position", "Choosing Evidence from Experience, Reading, and Observation", "Anticipating Counterarguments", "Concluding Effectively"]),
    U("Synthesis Essay", ["Reading and Citing Sources", "Corroborating, Qualifying, and Challenging Sources", "Weaving Sources into Your Argument", "Using Sources Responsibly"]),
  ] },
  "AP Music Theory": { units: [
    U("Music Fundamentals I: Pitch, Major Scales and Key Signatures, Rhythm, Meter, and Expressive Elements", ["Pitch and the Staff", "Half and Whole Steps", "Major Scales and Scale Degrees", "Major Keys and Key Signatures", "Rhythmic Values and Beat Division", "Time Signatures and Meter", "Tempo, Dynamics, and Expressive Elements"]),
    U("Music Fundamentals II: Minor Scales and Key Signatures, Melody, Timbre, and Texture", ["Minor Scales and Key Signatures", "Relative and Parallel Keys", "Melodic Organization", "Timbre", "Texture"]),
    U("Music Fundamentals III: Triads and Seventh Chords", ["Intervals", "Triads and Their Inversions", "Seventh Chords", "Roman Numerals and Figured Bass"]),
    U("Harmony and Voice Leading I: Chord Function, Cadence, and Phrase", ["Chord Function", "Cadences", "Phrases and Periods", "Four-Part Voice Leading"]),
    U("Harmony and Voice Leading II: Chord Progression and Predominant Function", ["Chord Progressions", "Predominant Function", "Harmonizing a Melody", "Realizing Figured Bass"]),
    U("Harmony and Voice Leading III: Embellishments, Motives, and Melodic Devices", ["Nonchord Tones", "Motives and Melodic Devices", "Melodic Embellishment", "Writing in Two Voices"]),
    U("Harmony and Voice Leading IV: Secondary Function", ["Secondary Dominant Chords", "Secondary Leading-Tone Chords", "Tonicization", "Modulation"]),
    U("Modes and Form", ["Modes", "Binary and Ternary Form", "Rondo and Sonata Form", "Analyzing Musical Form"]),
  ] },
  "AP Seminar": { units: [
    U("Question and Explore", ["Contextualizing a Complex Issue", "Developing Inquiry Questions", "Finding and Evaluating Sources", "Reading for Perspective"]),
    U("Understand and Analyze Arguments", ["Identifying Claims and Reasoning", "Evaluating Evidence", "Recognizing Bias and Context", "Analyzing Argument Structure"]),
    U("Evaluate Multiple Perspectives", ["Comparing Perspectives", "Interpreting Data and Representations", "Weighing Competing Arguments", "Finding Common Ground"]),
    U("Synthesize Ideas", ["Building a Line of Reasoning", "Developing Your Own Argument", "Connecting Evidence to Claims", "Addressing Counterarguments"]),
    U("Team, Transform, and Transmit", ["Working as a Team", "Designing Presentations", "Writing for an Audience", "Defending Your Argument"]),
  ] },
  "AP Research": { units: [
    U("Question and Explore", ["Choosing a Topic and Research Question", "Reviewing the Literature", "Identifying a Gap", "Writing a Proposal"]),
    U("Understand and Analyze", ["Choosing a Research Method", "Collecting Data or Evidence", "Ethical Research Practices", "Organizing Your Findings"]),
    U("Evaluate and Synthesize", ["Analyzing Results", "Drawing Conclusions", "Limitations and Implications", "Connecting to Existing Research"]),
    U("Write, Present, and Defend", ["Writing the Academic Paper", "Citing and Documenting Sources", "Presenting Your Research", "Defending Your Work"]),
  ] },
  "AP Latin": { units: [
    U("Vergil's Aeneid: Book 1", ["Selected Passages and Context", "Vocabulary and Grammar", "Translation Strategies", "Literary Analysis"]),
    U("Vergil's Aeneid: Book 2", ["Selected Passages and Context", "Vocabulary and Grammar", "Translation Strategies", "Literary Analysis"]),
    U("Vergil's Aeneid: Book 4", ["Selected Passages and Context", "Vocabulary and Grammar", "Translation Strategies", "Literary Analysis"]),
    U("Vergil's Aeneid: Book 6", ["Selected Passages and Context", "Vocabulary and Grammar", "Translation Strategies", "Literary Analysis"]),
    U("Vergil's Aeneid: Books 7, 11, and 12 (selections)", ["Selected Passages and Context", "Vocabulary and Grammar", "Translation Strategies", "Literary Analysis"]),
    U("Pliny the Younger's Letters", ["Selected Passages and Context", "Vocabulary and Grammar", "Translation Strategies", "Literary and Historical Analysis"]),
    U("Meter, Rhetoric, and Sight Reading", ["Dactylic Hexameter Scansion", "Stylistic Devices", "Reading Latin at Sight", "Comparing Vergil and Pliny"]),
  ] },
  "AP Spanish Literature and Culture": { units: [
    U("Medieval and Early Spanish Literature", ["Reading Medieval Texts", "Historical and Cultural Context", "Literary Devices", "Analysis and Interpretation"]),
    U("The Golden Age", ["Reading Golden Age Texts", "Historical and Cultural Context", "Literary Devices", "Analysis and Interpretation"]),
    U("Spanish and Latin American Literature of the 19th Century", ["Romanticism and Realism", "Historical and Cultural Context", "Literary Devices", "Analysis and Interpretation"]),
    U("The 20th Century", ["Modernism and the Avant-Garde", "Historical and Cultural Context", "Literary Devices", "Analysis and Interpretation"]),
    U("Contemporary Literature", ["Contemporary Voices", "Historical and Cultural Context", "Literary Devices", "Analysis and Interpretation"]),
    U("Writing About Literature in Spanish", ["Comparing Texts and Authors", "Developing a Thesis in Spanish", "Using Evidence from the Text", "Revising Your Writing"]),
  ] },
  "AP Spanish Language and Culture": { units: THEMES() },
  "AP French Language and Culture": { units: THEMES() },
  "AP German Language and Culture": { units: THEMES() },
  "AP Italian Language and Culture": { units: THEMES() },
  "AP Chinese Language and Culture": { units: THEMES() },
  "AP Japanese Language and Culture": { units: THEMES() },
};
