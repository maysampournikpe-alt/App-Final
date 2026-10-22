// Unit lists for AP courses, following the structure of each College Board Course and Exam Description (CED).
// These are written from the published unit titles. Courses are left out when we are not sure of their current
// structure (Physics 1 and 2, English Language, Comparative Government, Music Theory, Latin, Spanish Literature,
// Seminar, Research, Studio Art). Always compare with the current CED on apcentral.collegeboard.org.
const THEMES = ["Families and Communities", "Personal and Public Identities", "Beauty and Aesthetics", "Science and Technology", "Contemporary Life", "Global Challenges"];

export const AP_CED: Record<string, string[]> = {
  "AP Biology": ["Chemistry of Life", "Cell Structure and Function", "Cellular Energetics", "Cell Communication and Cell Cycle", "Heredity", "Gene Expression and Regulation", "Natural Selection", "Ecology"],
  "AP Calculus AB": ["Limits and Continuity", "Differentiation: Definition and Fundamental Properties", "Differentiation: Composite, Implicit, and Inverse Functions", "Contextual Applications of Differentiation", "Analytical Applications of Differentiation", "Integration and Accumulation of Change", "Differential Equations", "Applications of Integration"],
  "AP Calculus BC": ["Limits and Continuity", "Differentiation: Definition and Fundamental Properties", "Differentiation: Composite, Implicit, and Inverse Functions", "Contextual Applications of Differentiation", "Analytical Applications of Differentiation", "Integration and Accumulation of Change", "Differential Equations", "Applications of Integration", "Parametric Equations, Polar Coordinates, and Vector-Valued Functions", "Infinite Sequences and Series"],
  "AP Chemistry": ["Atomic Structure and Properties", "Molecular and Ionic Compound Structure and Properties", "Intermolecular Forces and Properties", "Chemical Reactions", "Kinetics", "Thermodynamics", "Equilibrium", "Acids and Bases", "Applications of Thermodynamics"],
  "AP Physics C: Mechanics": ["Kinematics", "Newton's Laws of Motion", "Work, Energy, and Power", "Systems of Particles and Linear Momentum", "Rotation", "Oscillations", "Gravitation"],
  "AP Physics C: Electricity and Magnetism": ["Electrostatics", "Conductors, Capacitors, Dielectrics", "Electric Circuits", "Magnetic Fields", "Electromagnetism"],
  "AP Environmental Science": ["The Living World: Ecosystems", "The Living World: Biodiversity", "Populations", "Earth Systems and Resources", "Land and Water Use", "Energy Resources and Consumption", "Atmospheric Pollution", "Aquatic and Terrestrial Pollution", "Global Change"],
  "AP Computer Science A": ["Using Objects and Methods", "Selection and Iteration", "Class Creation", "Data Collections"],
  "AP Computer Science Principles": ["Creative Development", "Data", "Algorithms and Programming", "Computer Systems and Networks", "Impact of Computing"],
  // AP Psychology moved from nine units to five for the 2025 exam; research methods are taught inside those units.
  "AP Psychology": ["Biological Bases of Behavior", "Cognition", "Development and Learning", "Social Psychology and Personality", "Mental and Physical Health"],
  "AP Macroeconomics": ["Basic Economic Concepts", "Economic Indicators and the Business Cycle", "National Income and Price Determination", "Financial Sector", "Long-Run Consequences of Stabilization Policies", "Open Economy: International Trade and Finance"],
  "AP Microeconomics": ["Basic Economic Concepts", "Supply and Demand", "Production, Cost, and the Perfect Competition Model", "Imperfect Competition", "Factor Markets", "Market Failure and the Role of Government"],
  "AP United States Government and Politics": ["Foundations of American Democracy", "Interactions Among Branches of Government", "Civil Liberties and Civil Rights", "American Political Ideologies and Beliefs", "Political Participation"],
  "AP World History: Modern": ["The Global Tapestry (c. 1200 to 1450)", "Networks of Exchange (c. 1200 to 1450)", "Land-Based Empires (c. 1450 to 1750)", "Transoceanic Interconnections (c. 1450 to 1750)", "Revolutions (c. 1750 to 1900)", "Consequences of Industrialization (c. 1750 to 1900)", "Global Conflict (c. 1900 to the present)", "Cold War and Decolonization (c. 1900 to the present)", "Globalization (c. 1900 to the present)"],
  "AP European History": ["Renaissance and Exploration", "Age of Reformation", "Absolutism and Constitutionalism", "Scientific, Philosophical, and Political Developments", "Conflict, Crisis, and Reaction in the Late 18th Century", "Industrialization and Its Effects", "19th-Century Perspectives and Political Developments", "20th-Century Global Conflicts", "Cold War and Contemporary Europe"],
  "AP English Literature and Composition": ["Short Fiction I", "Poetry I", "Longer Fiction or Drama I", "Short Fiction II", "Poetry II", "Longer Fiction or Drama II", "Short Fiction III", "Poetry III", "Longer Fiction or Drama III"],
  "AP Precalculus": ["Polynomial and Rational Functions", "Exponential and Logarithmic Functions", "Trigonometric and Polar Functions", "Functions Involving Parameters, Vectors, and Matrices"],
  "AP African American Studies": ["Origins of the African Diaspora", "Freedom, Enslavement, and Resistance", "The Practice of Freedom", "Movements and Debates"],
  "AP Art History": ["Global Prehistory", "Ancient Mediterranean", "Early Europe and Colonial Americas", "Later Europe and Americas", "Indigenous Americas", "Africa", "West and Central Asia", "South, East, and Southeast Asia", "The Pacific", "Global Contemporary"],
  "AP Spanish Language and Culture": THEMES,
  "AP French Language and Culture": THEMES,
  "AP German Language and Culture": THEMES,
  "AP Italian Language and Culture": THEMES,
  "AP Chinese Language and Culture": THEMES,
  "AP Japanese Language and Culture": THEMES,
};
