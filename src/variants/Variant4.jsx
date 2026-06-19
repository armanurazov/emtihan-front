// Variant4.jsx — Complete IELTS Test: Variant 4
// Includes the timer-ref fix so the writing timer reliably auto-submits.
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";
const AUTOSAVE_INTERVAL = 30_000;

const AUDIO_URLS = {
  1: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var4-listening-part1.mp3",
  2: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var4-listening-part2.mp3",
  3: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var4-listening-part3.mp3",
  4: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var4-listening-part4.mp3",
};

const WRITING_IMAGE = "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/images/var-4.png";

const TIMERS = { listening: 40 * 60, reading: 60 * 60, writing: 60 * 60 };

// ─── Listening Data ───────────────────────────────────────────
const LISTENING_SECTIONS = [
  {
    part: 1,
    title: "Part 1 — Conversation",
    description: "You will hear a conversation between a library assistant and a student registering for a library card.",
    formTitle: "Central City Library — Membership Registration",
    questions: [
      { no: 1,  type: "fill", label: "Full name" },
      { no: 2,  type: "fill", label: "Surname spelling" },
      { no: 3,  type: "fill", label: "Date of birth" },
      { no: 4,  type: "fill", label: "Status (student/public)" },
      { no: 5,  type: "fill", label: "Name of college" },
      { no: 6,  type: "fill", label: "Subject studied" },
      { no: 7,  type: "fill", label: "Home postcode" },
      { no: 8,  type: "fill", label: "Contact phone" },
      { no: 9,  type: "fill", label: "Preferred reminder method" },
      { no: 10, type: "fill", label: "Maximum items on loan at once" },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Monologue",
    description: "You will hear a manager briefing new employees at an art gallery.",
    questions: [
      { no: 11, type: "mcq", label: "The gallery is closed on:", options: ["A. Sundays", "B. Saturdays", "C. Mondays"] },
      { no: 12, type: "mcq", label: "Concession tickets cost:", options: ["A. £12", "B. £7.50", "C. £5.00"] },
      { no: 13, type: "mcq", label: "The North Wing contains:", options: ["A. classical paintings", "B. contemporary art", "C. photography"] },
      { no: 14, type: "mcq", label: "Which wing is currently closed to visitors?", options: ["A. East Wing", "B. South Wing", "C. North Wing"] },
      { no: 15, type: "mcq", label: "Bags larger than A4 must be stored in:", options: ["A. a locker near the café", "B. the cloakroom near the main entrance", "C. the staff room"] },
      { no: 16, type: "fill", label: "The permanent collection is free to" },
      { no: 17, type: "fill", label: "Staff must ensure visitors do not ________ the artwork" },
      { no: 18, type: "fill", label: "If visitors photograph restricted works, staff should ________ ask them to stop" },
      { no: 19, type: "fill", label: "Visitors receive a ________ to collect their bag from the cloakroom" },
      { no: 20, type: "fill", label: "The duty manager's extension number is" },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Discussion",
    description: "You will hear two students, Anna and Marcus, discussing a psychology research project with their supervisor, Professor Chen.",
    questions: [
      { no: 21, type: "mcq", label: "What is the focus of their research project?", options: ["A. University students' academic performance", "B. Social media use and self-esteem in adolescents", "C. Parental attitudes towards technology"] },
      { no: 22, type: "mcq", label: "Why did they change the age group from university students?", options: ["A. University students refused to participate", "B. The supervisor suggested it", "C. It was more relevant to current policy discussions"] },
      { no: 23, type: "mcq", label: "What self-esteem measure are they using?", options: ["A. The Beck Inventory", "B. The Rosenberg Self-Esteem Scale", "C. The Oxford Happiness Scale"] },
      { no: 24, type: "mcq", label: "How many participants do they aim to recruit?", options: ["A. 150", "B. 200", "C. 250"] },
      { no: 25, type: "mcq", label: "What is still pending at the time of the discussion?", options: ["A. Choosing a topic", "B. Ethics approval", "C. Finding a supervisor"] },
      { no: 26, type: "fill", label: "The supervisor's surname: Professor" },
      { no: 27, type: "fill", label: "The age range of participants is ________ to ________ years old" },
      { no: 28, type: "fill", label: "Data will be collected using online" },
      { no: 29, type: "fill", label: "The full proposal is due on the ________ of October" },
      { no: 30, type: "fill", label: "Parental ________ forms have been included in the appendix" },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Lecture",
    description: "You will hear a lecture about the causes and consequences of deforestation.",
    questions: [
      { no: 31, type: "fill", label: "Approximately 15 billion trees are cut down ________ each year" },
      { no: 32, type: "fill", label: "Around half of original forest cover has been lost since the ________ Revolution" },
      { no: 33, type: "fill", label: "The Amazon Basin and parts of ________ are losing forest fastest" },
      { no: 34, type: "fill", label: "In South America, a major driver is ________ ranching" },
      { no: 35, type: "fill", label: "Palm oil plantations are a major driver in Indonesia and" },
      { no: 36, type: "fill", label: "Deforestation contributes approximately 10% of global ________ emissions" },
      { no: 37, type: "fill", label: "Tropical forests contain more than half the world's ________ species" },
      { no: 38, type: "fill", label: "Without trees, ________ and soil erosion become more common" },
      { no: 39, type: "fill", label: "Trees release absorbed rainfall slowly into" },
      { no: 40, type: "fill", label: "Experts warn that new trees cannot replicate the services of ________ forests" },
    ],
  },
];

// ─── Reading Data ─────────────────────────────────────────────
const READING_PASSAGES = [
  {
    passage: 1,
    title: "The Role of Salt in Human History",
    text: `A
Salt is so common today that it is easy to overlook its extraordinary significance throughout human history. For thousands of years, salt was one of the most valuable commodities on Earth — a substance so essential to human survival and food preservation that it shaped economies, sparked conflicts, and influenced the rise and fall of civilisations.

B
Salt's value derived primarily from its role as a preservative. Before refrigeration, it was the most effective method of preventing meat and fish from spoiling. Salting enabled food to be stored for months or transported over long distances — a capability that was critical to armies, seafarers, and trading merchants alike. Roman soldiers were sometimes paid in salt; the English word "salary" is believed to derive from the Latin "salarium," meaning salt payment.

C
Salt deposits and salt production sites became centres of economic and political power. Cities such as Salzburg in Austria — whose very name means "Salt Castle" — developed around salt mining operations. In China, control of salt production was a key instrument of state revenue for centuries, with elaborate systems of licensing and taxation maintaining government control over the trade.

D
The salt trade created some of history's most important trade routes. Trans-Saharan trade networks carried salt from mines in the Sahara to West African kingdoms in exchange for gold. Timbuktu, at the crossroads of these routes, became one of the medieval world's wealthiest cities. Similarly, the Via Salaria — the Salt Road — ran from the Adriatic coast to Rome, serving as one of the earliest and most important roads in Italy.

E
Salt also generated political conflict and social unrest. In colonial India, the British monopoly on salt production was deeply resented. Mahatma Gandhi's 1930 Salt March, in which he led thousands of followers to the sea to produce their own salt in defiance of British tax laws, became one of the defining acts of the independence movement.

F
The discovery of refrigeration and chemical preservatives in the nineteenth and twentieth centuries dramatically reduced salt's economic importance. Today, salt is inexpensive and widely available. Its modern uses are overwhelmingly industrial — including road de-icing, water treatment, and chemical manufacturing — rather than primarily for food preservation.

G
Yet salt retains a significant place in human culture. From religious ceremonies to culinary traditions, its symbolic and practical presence endures. In many cultures, offering salt to a guest remains a gesture of welcome and goodwill — a faint echo of an era when this mineral was among the most prized substances on Earth.`,
    questions: [
      {
        range: "1–6", type: "tf",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { no: 1, text: "Before refrigeration, salt was one of the most effective food preservatives." },
          { no: 2, text: "Roman soldiers were sometimes given salt as part of their pay." },
          { no: 3, text: "Salzburg was the largest salt-producing city in Europe." },
          { no: 4, text: "Gandhi's Salt March took place in 1930." },
          { no: 5, text: "Refrigeration was invented in the eighteenth century." },
          { no: 6, text: "Today, the majority of salt use is industrial rather than for food preservation." },
        ],
      },
      {
        range: "7–10", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 7,  text: "The word \"salary\" is believed to originate from:", options: ["A. a Greek word for gold", "B. a Latin word related to salt payment", "C. an Italian trading term", "D. a Persian word for trading route"] },
          { no: 8,  text: "Timbuktu became wealthy because:", options: ["A. it had large gold mines", "B. it was a centre of agricultural production", "C. it was located at the intersection of major salt trade routes", "D. it controlled the salt mines in the Sahara"] },
          { no: 9,  text: "Gandhi's Salt March was significant because:", options: ["A. it resulted in independence immediately", "B. it was a symbolic act of defiance against a British tax monopoly", "C. it destroyed the British salt trade permanently", "D. it led to Gandhi's imprisonment and execution"] },
          { no: 10, text: "According to paragraph F, salt's economic importance declined mainly because of:", options: ["A. falling population", "B. changing food tastes", "C. refrigeration and chemical preservatives", "D. overproduction of salt"] },
        ],
      },
      {
        range: "11–13", type: "fill",
        instruction: "Complete the sentences using NO MORE THAN TWO WORDS.",
        items: [
          { no: 11, text: "The road connecting the Adriatic coast to Rome was called the __________." },
          { no: 12, text: "In China, salt production was controlled through a system of licensing and __________." },
          { no: 13, text: "The modern use of salt on roads involves __________." },
        ],
      },
    ],
  },
  {
    passage: 2,
    title: "The Science of Memory",
    text: `A
Memory is one of the most fundamental capacities of the human mind, yet it remains poorly understood. For centuries, philosophers and scientists have debated how the brain stores and retrieves information. Modern neuroscience has shed significant light on this question, revealing that memory is not a single, unified process but a collection of distinct systems operating in different brain regions.

B
Neuroscientists commonly distinguish between two major types of memory: declarative and non-declarative. Declarative memory encompasses conscious recall of facts and events — remembering a friend's birthday, or what you ate for breakfast. Non-declarative memory covers unconscious processes such as motor skills and conditioned responses. Learning to ride a bicycle is a classic example: once mastered, the skill is performed automatically, without conscious effort.

C
Declarative memory is further divided into semantic and episodic memory. Semantic memory refers to general knowledge — facts about the world, such as "Paris is the capital of France." Episodic memory is more personal, encompassing memories of specific events experienced at a particular time and place. The two systems are closely related but can be affected independently by brain damage.

D
The hippocampus, a structure deep within the brain's temporal lobe, plays a central role in the formation of new declarative memories. The famous case of patient H.M. — Henry Molaison — illustrated this dramatically. Following surgery that removed much of his hippocampus to treat epilepsy, H.M. became unable to form any new long-term memories, though he retained his existing memories and continued to learn motor skills normally.

E
Memory formation involves a process called synaptic consolidation, in which connections between neurons are strengthened through repeated activation. Sleep is believed to play a critical role in this process, as the brain rehearses and consolidates memories during certain sleep stages. Research has shown that people who sleep after learning new material tend to retain it significantly better than those who remain awake.

F
Memory is also highly reconstructive rather than reproductive. When we recall a past event, we do not replay a stored recording — we actively reconstruct it, drawing on context, expectations, and subsequent experiences. This makes memory susceptible to distortion. The psychologist Elizabeth Loftus demonstrated through landmark experiments that false memories can be implanted in people's minds through misleading questions or post-event information.

G
The implications of memory research extend into law, education, and medicine. In courtrooms, the reliability of eyewitness testimony has been called into question by research showing how easily memory can be corrupted. In education, strategies such as spaced repetition and retrieval practice have been shown to enhance long-term retention significantly.`,
    questions: [
      {
        range: "14–18", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 14, text: "Non-declarative memory involves:", options: ["A. conscious recall of facts", "B. unconscious processes such as motor skills", "C. remembering personal life events", "D. general knowledge about the world"] },
          { no: 15, text: "Patient H.M. is described as being unable to:", options: ["A. speak after his surgery", "B. perform motor skills", "C. form new long-term memories", "D. recall any memories from before his operation"] },
          { no: 16, text: "Synaptic consolidation refers to:", options: ["A. the removal of old memories", "B. the strengthening of neural connections through repeated activation", "C. the creation of completely new brain cells", "D. the suppression of emotional memories"] },
          { no: 17, text: "Elizabeth Loftus's research showed that:", options: ["A. memory is perfectly accurate under normal conditions", "B. false memories cannot be created experimentally", "C. false memories can be implanted through misleading information", "D. sleep prevents memory distortion"] },
          { no: 18, text: "According to the passage, memory is best described as:", options: ["A. a faithful recording of past events", "B. a reconstructive process that can be distorted", "C. exclusively controlled by the hippocampus", "D. fully understood by modern neuroscience"] },
        ],
      },
      {
        range: "19–23", type: "fill",
        instruction: "Complete the notes using NO MORE THAN TWO WORDS.",
        items: [
          { no: 19, text: "Declarative memory involves conscious __________ of facts and events." },
          { no: 20, text: "Episodic memory stores memories of specific events at a particular __________." },
          { no: 21, text: "The hippocampus is located in the brain's __________ lobe." },
          { no: 22, text: "Sleep helps the brain to rehearse and __________ memories." },
          { no: 23, text: "The strategy of __________ repetition has been shown to improve long-term retention." },
        ],
      },
      {
        range: "24–26", type: "paragraph",
        instruction: "Which paragraph (A–G) contains the following information? Write the correct paragraph letter.",
        paragraphNote: "(Paragraphs are labelled A–G from top to bottom of the passage.)",
        items: [
          { no: 24, text: "The role of sleep in memory formation" },
          { no: 25, text: "How misleading questions can corrupt memory" },
          { no: 26, text: "The distinction between semantic and episodic memory" },
        ],
      },
    ],
  },
  {
    passage: 3,
    title: "The Rise of Microplastics as a Global Pollutant",
    text: `Microplastics — particles of plastic less than five millimetres in diameter — have emerged as one of the most pervasive pollutants in the modern environment. They have been found in the deepest ocean trenches, in Arctic ice, in mountain soil, in drinking water, and in human blood. What began as a scientific curiosity in the 1970s has become a global environmental crisis.

Microplastics originate from two main sources. Primary microplastics are manufactured at a small size for specific uses — examples include microbeads in cosmetic products and synthetic fibres shed from clothing during washing. Secondary microplastics result from the breakdown of larger plastic items: sunlight, wave action, and physical abrasion gradually fragment plastic waste into smaller and smaller pieces.

The scale of plastic production is staggering. The world produces over 400 million tonnes of plastic annually, and less than 10% is recycled. The remainder is landfilled, incinerated, or enters the natural environment, where it persists for hundreds of years.

The ecological consequences are significant. Marine organisms, from plankton to whales, ingest microplastics. The particles can physically damage digestive systems, reduce food intake, and introduce toxic chemicals. Some research suggests that microplastics alter the behaviour of certain fish species. In terrestrial environments, soil-dwelling organisms such as earthworms are similarly affected.

The implications for human health are less well understood but increasingly concerning. Studies have detected microplastics in human lungs, placentas, and bloodstreams. Some researchers hypothesise that chronic exposure could cause inflammation and disrupt the endocrine system, though definitive causal evidence in humans remains limited.

Addressing the microplastic problem requires action at multiple levels. At the production end, banning single-use plastics and microbeads in cosmetics has already been implemented in several countries. Improved waste management and expanded recycling infrastructure can prevent plastic reaching the environment. Innovations in biodegradable materials offer longer-term alternatives to conventional plastic.

However, critics point out that even with immediate global action, the microplastics already distributed throughout the environment will persist for centuries. Some researchers are investigating biological approaches — using bacteria or fungi capable of breaking down plastics — though these remain at an early experimental stage.

The microplastic crisis illustrates a broader challenge: the unintended consequences of materials introduced into the environment without adequate assessment of their long-term behaviour and impact.`,
    questions: [
      {
        range: "27–31", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 27, text: "Primary microplastics are:", options: ["A. created by the breakdown of larger plastic items", "B. manufactured small for specific purposes", "C. found only in oceans", "D. banned in all countries"] },
          { no: 28, text: "Less than 10% of plastic produced globally is:", options: ["A. manufactured in developing countries", "B. used for packaging", "C. recycled", "D. biodegradable"] },
          { no: 29, text: "The passage states that microplastics can affect fish by:", options: ["A. changing their body colour", "B. altering their behaviour", "C. increasing their population size", "D. improving their reproductive rates"] },
          { no: 30, text: "What does the passage say about microplastics and human health?", options: ["A. The effects on humans are fully proven", "B. Microplastics have been found inside the human body but causal evidence is limited", "C. There is no evidence microplastics enter the human body", "D. Microplastics only affect human skin"] },
          { no: 31, text: "Which approach to the problem is described as still experimental?", options: ["A. Banning single-use plastics", "B. Expanding recycling", "C. Using biological organisms to break down plastics", "D. Introducing biodegradable packaging"] },
        ],
      },
      {
        range: "32–35", type: "fill",
        instruction: "Complete each sentence using NO MORE THAN TWO WORDS.",
        items: [
          { no: 32, text: "Secondary microplastics form when larger plastics are broken down by sunlight and __________." },
          { no: 33, text: "Microplastics can physically damage the __________ systems of marine organisms." },
          { no: 34, text: "Studies have found microplastics in human lungs, placentas, and __________." },
          { no: 35, text: "Some researchers suggest chronic exposure could disrupt the __________ system." },
        ],
      },
      {
        range: "36–40", type: "yng",
        instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
        items: [
          { no: 36, text: "Microplastics have been found in Arctic ice." },
          { no: 37, text: "All countries have already banned microbeads in cosmetics." },
          { no: 38, text: "Earthworms are affected by microplastics in soil." },
          { no: 39, text: "Bacteria and fungi that break down plastic are currently used commercially." },
          { no: 40, text: "The author believes the microplastic problem illustrates broader risks of environmental contamination by new materials." },
        ],
      },
    ],
  },
];

// ─── Utilities ────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
function countWords(t) { return t.trim().split(/\s+/).filter(Boolean).length; }
function getToken()    { return localStorage.getItem("ielts_token"); }
function logout()      { localStorage.removeItem("ielts_token"); localStorage.removeItem("ielts_user"); window.location.reload(); }

async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Shared UI components ─────────────────────────────────────
function Timer({ seconds, label }) {
  const urgent = seconds <= 300;
  return (
    <div className={`timer ${urgent ? "timer--urgent" : ""}`}>
      <span className="timer__label">{label}</span>
      <span className="timer__value">{formatTime(seconds)}</span>
    </div>
  );
}

function LogoutBtn() {
  return (
    <button
      onClick={() => { if (window.confirm("Are you sure you want to log out? Your progress has been saved.")) logout(); }}
      className="logout-btn"
    >
      Log out
    </button>
  );
}

function AudioPlayer({ src, partNo }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [played,  setPlayed]  = useState(false);
  useEffect(() => { setPlaying(false); setPlayed(false); }, [src]);
  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    playing ? el.pause() : el.play();
  };
  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src}
        onEnded={() => { setPlaying(false); setPlayed(true); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="audio-player__info">
        <span className="audio-player__part">Part {partNo}</span>
        <span className="audio-player__hint">
          {played ? "✓ Audio played" : playing ? "▶ Playing…" : "Press Play when ready"}
        </span>
      </div>
      <button
        className={`audio-player__btn ${playing ? "audio-player__btn--pause" : "audio-player__btn--play"}`}
        onClick={toggle}
      >
        {playing ? "⏸ Pause" : "▶ Play"}
      </button>
    </div>
  );
}

function FillQuestion({ q, value, onChange }) {
  return (
    <div className="question question--fill">
      <span className="question__no">{q.no}.</span>
      <label className="question__label">
        {q.label || q.text}
        <input type="text" className="question__input" value={value || ""}
          onChange={(e) => onChange(q.no, e.target.value)} placeholder="Your answer" />
      </label>
    </div>
  );
}

function McqQuestion({ q, value, onChange }) {
  return (
    <div className="question question--mcq">
      <p className="question__label"><span className="question__no">{q.no}.</span> {q.label || q.text}</p>
      <div className="question__options">
        {(q.options || []).map((opt) => {
          const letter = opt.charAt(0).toUpperCase();
          return (
            <label key={letter} className={`option ${value === letter ? "option--selected" : ""}`}>
              <input type="radio" name={`q${q.no}`} value={letter} checked={value === letter} onChange={() => onChange(q.no, letter)} />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TfQuestion({ item, value, onChange }) {
  return (
    <div className="question question--tf">
      <p className="question__label"><span className="question__no">{item.no}.</span> {item.text}</p>
      <div className="question__options question__options--row">
        {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => (
          <label key={opt} className={`option option--small ${value === opt ? "option--selected" : ""}`}>
            <input type="radio" name={`q${item.no}`} value={opt} checked={value === opt} onChange={() => onChange(item.no, opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function YngQuestion({ item, value, onChange }) {
  return (
    <div className="question question--tf">
      <p className="question__label"><span className="question__no">{item.no}.</span> {item.text}</p>
      <div className="question__options question__options--row">
        {["YES", "NO", "NOT GIVEN"].map((opt) => (
          <label key={opt} className={`option option--small ${value === opt ? "option--selected" : ""}`}>
            <input type="radio" name={`q${item.no}`} value={opt} checked={value === opt} onChange={() => onChange(item.no, opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function Mcq4Question({ item, value, onChange }) {
  return (
    <div className="question question--mcq">
      <p className="question__label"><span className="question__no">{item.no}.</span> {item.text}</p>
      <div className="question__options">
        {item.options.map((opt) => {
          const letter = opt.charAt(0).toUpperCase();
          return (
            <label key={letter} className={`option ${value === letter ? "option--selected" : ""}`}>
              <input type="radio" name={`q${item.no}`} value={letter} checked={value === letter} onChange={() => onChange(item.no, letter)} />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ParagraphQuestion({ item, value, onChange }) {
  return (
    <div className="question question--tf">
      <p className="question__label"><span className="question__no">{item.no}.</span> {item.text}</p>
      <div className="question__options question__options--row">
        {["A","B","C","D","E","F","G"].map((p) => (
          <label key={p} className={`option option--small ${value === p ? "option--selected" : ""}`}>
            <input type="radio" name={`q${item.no}`} value={p} checked={value === p} onChange={() => onChange(item.no, p)} />
            {p}
          </label>
        ))}
      </div>
    </div>
  );
}

function ProgressDots({ total, answered }) {
  const pct = total ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="progress-bar">
      <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      <span className="progress-bar__label">{answered}/{total} answered</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Variant4({ sessionId, token, user }) {
  const [phase,            setPhase]            = useState("listening");
  const [listeningPart,    setListeningPart]    = useState(1);
  const [readingPassage,   setReadingPassage]   = useState(1);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [readingAnswers,   setReadingAnswers]   = useState({});
  const [writingTask1,     setWritingTask1]     = useState("");
  const [writingTask2,     setWritingTask2]     = useState("");
  const [activeWritingTask,setActiveWritingTask]= useState(1);
  const [listeningTime,    setListeningTime]    = useState(TIMERS.listening);
  const [readingTime,      setReadingTime]      = useState(TIMERS.reading);
  const [writingTime,      setWritingTime]      = useState(TIMERS.writing);
  const [submitting,       setSubmitting]       = useState(false);
  const [submitError,      setSubmitError]      = useState("");

  const timerRef    = useRef(null);
  const autosaveRef = useRef(null);

  // ── FIX: keep a ref to handleFinalSubmit so the timer closure
  //         always calls the LATEST version (fixes stale closure bug
  //         where the writing timer hitting zero would not actually submit)
  const handleFinalSubmitRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (phase === "listening") {
        setListeningTime((t) => {
          if (t <= 1) { handleTransition("listening", "reading"); return 0; }
          return t - 1;
        });
      } else if (phase === "reading") {
        setReadingTime((t) => {
          if (t <= 1) { handleTransition("reading", "writing"); return 0; }
          return t - 1;
        });
      } else if (phase === "writing") {
        setWritingTime((t) => {
          // Call via ref so we always get the latest function with current state
          if (t <= 1) { handleFinalSubmitRef.current?.(); return 0; }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Autosave ───────────────────────────────────────────────
  const doAutosave = useCallback(async () => {
    try {
      if (phase === "listening") {
        const answers = Object.entries(listeningAnswers).map(([no, text]) => ({
          sectionPart: Math.ceil(Number(no) / 10), questionNo: Number(no), answerText: text,
        }));
        if (answers.length) await apiPost("/answers/save-section", { sessionId, section: "listening", answers, isFinal: false });
      } else if (phase === "reading") {
        const answers = Object.entries(readingAnswers).map(([no, text]) => ({
          sectionPart: Number(no) <= 13 ? 1 : Number(no) <= 26 ? 2 : 3,
          questionNo: Number(no), answerText: text,
        }));
        if (answers.length) await apiPost("/answers/save-section", { sessionId, section: "reading", answers, isFinal: false });
      } else if (phase === "writing") {
        if (writingTask1) await apiPost("/answers/writing/save", { sessionId, taskNo: 1, responseText: writingTask1, wordCount: countWords(writingTask1), isFinal: false });
        if (writingTask2) await apiPost("/answers/writing/save", { sessionId, taskNo: 2, responseText: writingTask2, wordCount: countWords(writingTask2), isFinal: false });
      }
    } catch (e) { console.warn("Autosave failed:", e.message); }
  }, [phase, listeningAnswers, readingAnswers, writingTask1, writingTask2, sessionId]);

  useEffect(() => {
    autosaveRef.current = setInterval(doAutosave, AUTOSAVE_INTERVAL);
    return () => clearInterval(autosaveRef.current);
  }, [doAutosave]);

  const setListeningAnswer = (no, val) => setListeningAnswers((p) => ({ ...p, [no]: val }));
  const setReadingAnswer   = (no, val) => setReadingAnswers((p)   => ({ ...p, [no]: val }));

  // ── Section transitions ────────────────────────────────────
  const handleTransition = async (from, to) => {
    clearInterval(timerRef.current);
    clearInterval(autosaveRef.current);
    try {
      if (from === "listening") {
        const answers = Object.entries(listeningAnswers).map(([no, text]) => ({
          sectionPart: Math.ceil(Number(no) / 10), questionNo: Number(no), answerText: text,
        }));
        await apiPost("/answers/save-section", { sessionId, section: "listening", answers, isFinal: true });
      } else if (from === "reading") {
        const answers = Object.entries(readingAnswers).map(([no, text]) => ({
          sectionPart: Number(no) <= 13 ? 1 : Number(no) <= 26 ? 2 : 3,
          questionNo: Number(no), answerText: text,
        }));
        await apiPost("/answers/save-section", { sessionId, section: "reading", answers, isFinal: true });
      }
      await apiPost(`/sessions/${sessionId}/transition`, { from, to });
      setPhase(to);
    } catch (e) { console.error("Transition error:", e); setPhase(to); }
  };

  // ── Final submit ───────────────────────────────────────────
  const handleFinalSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autosaveRef.current);
    try {
      await apiPost("/answers/writing/save", { sessionId, taskNo: 1, responseText: writingTask1, wordCount: countWords(writingTask1), isFinal: true });
      await apiPost("/answers/writing/save", { sessionId, taskNo: 2, responseText: writingTask2, wordCount: countWords(writingTask2), isFinal: true });
      await apiPost(`/sessions/${sessionId}/transition`, { from: "writing", to: "completed" });
      setPhase("done");
      setTimeout(() => logout(), 5000);
    } catch (e) {
      setSubmitError(e.message);
      setSubmitting(false);
    }
  }, [submitting, sessionId, writingTask1, writingTask2]);

  // Keep the ref in sync with the latest handleFinalSubmit
  useEffect(() => {
    handleFinalSubmitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  const goToNextPart = () => {
    if (listeningPart < 4) setListeningPart((p) => p + 1);
    else handleTransition("listening", "reading");
  };

  const answeredListening = Object.keys(listeningAnswers).length;
  const answeredReading   = Object.keys(readingAnswers).length;

  if (phase === "done") return <DoneScreen user={user} />;

  return (
    <div className="test-container">
      <style>{STYLES}</style>

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar__left">
          <span className="topbar__name">{user?.fullName || "Candidate"}</span>
          <span className="topbar__sep">·</span>
          <span className="topbar__variant">Variant 4</span>
        </div>
        <div className="topbar__center">
          <span className={`topbar__phase ${phase === "listening" ? "active" : ""}`}>Listening</span>
          <span className="topbar__arrow">→</span>
          <span className={`topbar__phase ${phase === "reading" ? "active" : ""}`}>Reading</span>
          <span className="topbar__arrow">→</span>
          <span className={`topbar__phase ${phase === "writing" ? "active" : ""}`}>Writing</span>
        </div>
        <div className="topbar__right">
          {phase === "listening" && <Timer seconds={listeningTime} label="Listening" />}
          {phase === "reading"   && <Timer seconds={readingTime}   label="Reading" />}
          {phase === "writing"   && <Timer seconds={writingTime}   label="Writing" />}
          <LogoutBtn />
        </div>
      </header>

      {/* ── LISTENING ── */}
      {phase === "listening" && (() => {
        const sec = LISTENING_SECTIONS[listeningPart - 1];
        return (
          <main className="main-panel">
            <div className="section-header">
              <h2 className="section-header__title">{sec.title}</h2>
              <ProgressDots total={40} answered={answeredListening} />
            </div>
            <div className="instructions-box">
              <p>{sec.description}</p>
              <p className="instructions-box__note">
                Listen to the audio, then answer Questions {(listeningPart - 1) * 10 + 1}–{listeningPart * 10}.
              </p>
            </div>
            <AudioPlayer key={listeningPart} src={AUDIO_URLS[listeningPart]} partNo={listeningPart} />
            <div className="questions-panel">
              {sec.formTitle && <h3 className="form-title">{sec.formTitle}</h3>}
              {sec.questions.map((q) =>
                q.type === "fill"
                  ? <FillQuestion key={q.no} q={q} value={listeningAnswers[q.no]} onChange={setListeningAnswer} />
                  : <McqQuestion  key={q.no} q={q} value={listeningAnswers[q.no]} onChange={setListeningAnswer} />
              )}
            </div>
            <div className="nav-bar">
              <span className="nav-bar__info">Part {listeningPart} of 4</span>
              <button className="btn btn--primary" onClick={goToNextPart}>
                {listeningPart < 4 ? "Next Part →" : "Finish Listening → Go to Reading"}
              </button>
            </div>
          </main>
        );
      })()}

      {/* ── READING ── */}
      {phase === "reading" && (() => {
        const psg = READING_PASSAGES[readingPassage - 1];
        return (
          <main className="main-panel main-panel--reading">
            <div className="section-header">
              <h2 className="section-header__title">Reading — Passage {readingPassage}</h2>
              <ProgressDots total={40} answered={answeredReading} />
            </div>
            <div className="reading-layout">
              <div className="reading-text">
                <h3 className="reading-text__title">{psg.title}</h3>
                {psg.text.split("\n\n").map((para, i) => (
                  <p key={i} className="reading-text__para">{para}</p>
                ))}
              </div>
              <div className="reading-questions">
                {psg.questions.map((qGroup, gi) => (
                  <div key={gi} className="question-group">
                    <p className="question-group__range">Questions {qGroup.range}</p>
                    <p className="question-group__instruction">{qGroup.instruction}</p>
                    {qGroup.paragraphNote && <p className="question-group__note">{qGroup.paragraphNote}</p>}
                    {qGroup.type === "tf"        && qGroup.items.map((item) => <TfQuestion        key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "yng"       && qGroup.items.map((item) => <YngQuestion       key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "mcq4"      && qGroup.items.map((item) => <Mcq4Question      key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "fill"      && qGroup.items.map((item) => <FillQuestion      key={item.no} q={item}   value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "paragraph" && qGroup.items.map((item) => <ParagraphQuestion key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                  </div>
                ))}
              </div>
            </div>
            <div className="nav-bar">
              <span className="nav-bar__info">Passage {readingPassage} of 3</span>
              <div className="nav-bar__btns">
                {readingPassage > 1 && (
                  <button className="btn btn--secondary" onClick={() => setReadingPassage((p) => p - 1)}>← Previous</button>
                )}
                {readingPassage < 3
                  ? <button className="btn btn--primary" onClick={() => setReadingPassage((p) => p + 1)}>Next Passage →</button>
                  : <button className="btn btn--primary" onClick={() => handleTransition("reading", "writing")}>Finish Reading → Go to Writing</button>
                }
              </div>
            </div>
          </main>
        );
      })()}

      {/* ── WRITING ── */}
      {phase === "writing" && (
        <main className="main-panel">
          <div className="section-header">
            <h2 className="section-header__title">Writing</h2>
            <div className="task-tabs">
              <button className={`task-tab ${activeWritingTask === 1 ? "task-tab--active" : ""}`} onClick={() => setActiveWritingTask(1)}>
                Task 1 <span className="task-tab__wc">{countWords(writingTask1)}w</span>
              </button>
              <button className={`task-tab ${activeWritingTask === 2 ? "task-tab--active" : ""}`} onClick={() => setActiveWritingTask(2)}>
                Task 2 <span className="task-tab__wc">{countWords(writingTask2)}w</span>
              </button>
            </div>
          </div>

          {activeWritingTask === 1 && (
            <div className="writing-task">
              <div className="writing-task__prompt">
                <p className="writing-task__time">⏱ Recommended: 20 minutes</p>
                <p>The table below shows the average number of hours per week that three age groups (18–30, 31–50, 51+) spent on four leisure activities (Exercise, Watching TV, Reading, Socialising) in a European country in 2022.</p>
                <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                <p className="writing-task__min"><strong>Write at least 150 words.</strong></p>
              </div>
              <div className="writing-task__image-wrap">
                <img src={WRITING_IMAGE} alt="Table: Leisure activities by age group, 2022" className="writing-task__image" />
              </div>
              <div className="writing-task__editor">
                <textarea
                  className="writing-textarea" value={writingTask1}
                  onChange={(e) => setWritingTask1(e.target.value)}
                  placeholder="Write your Task 1 response here…" rows={18}
                />
                <div className="writing-wc">
                  Word count: <strong>{countWords(writingTask1)}</strong>
                  {countWords(writingTask1) < 150 && <span className="writing-wc__warn"> (minimum 150)</span>}
                </div>
              </div>
            </div>
          )}

          {activeWritingTask === 2 && (
            <div className="writing-task">
              <div className="writing-task__prompt">
                <p className="writing-task__time">⏱ Recommended: 40 minutes</p>
                <p>Write about the following topic:</p>
                <blockquote className="writing-task__topic">
                  Some people believe that the government should provide financial support to artists and musicians. Others think this money would be better spent elsewhere.<br /><br />
                  Discuss both views and give your own opinion.
                </blockquote>
                <p className="writing-task__min"><strong>Write at least 250 words.</strong></p>
              </div>
              <div className="writing-task__editor">
                <textarea
                  className="writing-textarea" value={writingTask2}
                  onChange={(e) => setWritingTask2(e.target.value)}
                  placeholder="Write your Task 2 response here…" rows={24}
                />
                <div className="writing-wc">
                  Word count: <strong>{countWords(writingTask2)}</strong>
                  {countWords(writingTask2) < 250 && <span className="writing-wc__warn"> (minimum 250)</span>}
                </div>
              </div>
            </div>
          )}

          {submitError && <p className="error-msg">{submitError}</p>}
          <div className="nav-bar">
            <span className="nav-bar__info">Writing — both tasks</span>
            <button className="btn btn--submit" onClick={handleFinalSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Test ✓"}
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

// ─── Done screen ──────────────────────────────────────────────
function DoneScreen({ user }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)" }}>
      <style>{STYLES}</style>
      <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", textAlign: "center", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", marginBottom: 12 }}>
          Congratulations, {user?.fullName?.split(" ")[0] || "you're"} the best!
        </h1>
        <p style={{ fontSize: 16, color: "#4b5563", lineHeight: 1.8, marginBottom: 24 }}>
          Your test has been submitted successfully.<br />
          Your brother will schedule the <strong>Speaking part</strong> with you
          and share your <strong>total band score</strong> once everything is reviewed.
        </p>
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Variant 4 · {new Date().toLocaleDateString()}</p>
        <p style={{ fontSize: 12, color: "#d1d5db", marginTop: 8 }}>Signing you out in a moment…</p>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f0f2f5; color: #1a1a2e; }
  .topbar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; background: #1a1a2e; color: #fff; padding: 0 24px; height: 56px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .topbar__left { display: flex; align-items: center; gap: 8px; font-size: 14px; }
  .topbar__name { font-weight: 600; }
  .topbar__sep { opacity: 0.4; }
  .topbar__variant { opacity: 0.7; font-size: 12px; }
  .topbar__center { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .topbar__phase { opacity: 0.45; font-weight: 500; padding: 4px 10px; border-radius: 4px; }
  .topbar__phase.active { opacity: 1; background: #3b82f6; }
  .topbar__arrow { opacity: 0.3; font-size: 11px; }
  .topbar__right { display: flex; align-items: center; gap: 16px; }
  .logout-btn { padding: 6px 14px; background: transparent; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer; transition: all 0.15s; }
  .logout-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.6); }
  .timer { display: flex; flex-direction: column; align-items: flex-end; }
  .timer__label { font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px; }
  .timer__value { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 1px; }
  .timer--urgent .timer__value { color: #f87171; animation: pulse 1s ease infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
  .test-container { min-height: 100vh; }
  .main-panel { max-width: 900px; margin: 0 auto; padding: 24px 20px 80px; }
  .main-panel--reading { max-width: 1200px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .section-header__title { font-size: 22px; font-weight: 700; color: #1a1a2e; }
  .progress-bar { position: relative; width: 200px; height: 28px; background: #e5e7eb; border-radius: 14px; overflow: hidden; }
  .progress-bar__fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); border-radius: 14px; transition: width 0.3s; }
  .progress-bar__label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #1a1a2e; }
  .instructions-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px; }
  .instructions-box p { line-height: 1.6; font-size: 14px; color: #1e40af; }
  .instructions-box__note { margin-top: 8px; font-weight: 600; }
  .audio-player { display: flex; align-items: center; justify-content: space-between; background: #1a1a2e; color: #fff; border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; }
  .audio-player__info { display: flex; flex-direction: column; gap: 2px; }
  .audio-player__part { font-size: 12px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px; }
  .audio-player__hint { font-size: 14px; font-weight: 500; }
  .audio-player__btn { padding: 10px 24px; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .audio-player__btn--play { background: #3b82f6; color: #fff; }
  .audio-player__btn--pause { background: #f59e0b; color: #1a1a2e; }
  .audio-player__btn:hover { opacity: 0.85; transform: scale(1.02); }
  .questions-panel { background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .form-title { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
  .question { margin-bottom: 20px; }
  .question__no { font-weight: 700; color: #3b82f6; margin-right: 6px; min-width: 24px; display: inline-block; }
  .question__label { font-size: 15px; line-height: 1.5; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .question--fill .question__label { flex-wrap: nowrap; }
  .question__input { flex: 1; min-width: 180px; padding: 8px 12px; border: 1.5px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: border-color 0.15s; }
  .question__input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
  .question__options { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; margin-left: 28px; }
  .question__options--row { flex-direction: row; flex-wrap: wrap; gap: 8px; }
  .option { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 6px; border: 1.5px solid #e5e7eb; cursor: pointer; font-size: 14px; transition: all 0.12s; background: #fafafa; }
  .option:hover { background: #eff6ff; border-color: #93c5fd; }
  .option--selected { background: #eff6ff; border-color: #3b82f6; font-weight: 600; color: #1d4ed8; }
  .option--small { padding: 6px 12px; font-size: 13px; }
  .option input { display: none; }
  .reading-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 16px; }
  @media (max-width: 800px) { .reading-layout { grid-template-columns: 1fr; } }
  .reading-text { background: #fff; border-radius: 10px; padding: 24px; max-height: calc(100vh - 160px); overflow-y: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.08); position: sticky; top: 72px; align-self: start; }
  .reading-text__title { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #1a1a2e; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
  .reading-text__para { font-size: 14px; line-height: 1.75; margin-bottom: 14px; color: #374151; }
  .reading-questions { display: flex; flex-direction: column; gap: 0; }
  .question-group { background: #fff; border-radius: 10px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .question-group__range { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 4px; }
  .question-group__instruction { font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
  .question-group__note { font-size: 12px; color: #6b7280; margin-bottom: 12px; font-style: italic; }
  .task-tabs { display: flex; gap: 8px; }
  .task-tab { padding: 8px 18px; border-radius: 6px; border: 2px solid #e5e7eb; background: #fafafa; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.12s; }
  .task-tab--active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
  .task-tab__wc { margin-left: 6px; font-size: 12px; opacity: 0.7; }
  .writing-task { background: #fff; border-radius: 10px; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .writing-task__prompt { margin-bottom: 16px; }
  .writing-task__prompt p { font-size: 15px; line-height: 1.6; margin-bottom: 8px; }
  .writing-task__time { color: #6b7280; font-size: 13px; margin-bottom: 10px; }
  .writing-task__topic { border-left: 4px solid #3b82f6; padding: 12px 16px; background: #eff6ff; border-radius: 0 6px 6px 0; font-style: italic; font-size: 16px; line-height: 1.6; margin: 12px 0; }
  .writing-task__min { color: #1d4ed8; }
  .writing-task__image-wrap { margin-bottom: 16px; }
  .writing-task__image { max-width: 100%; border: 1px solid #e5e7eb; border-radius: 6px; }
  .writing-task__editor { display: flex; flex-direction: column; gap: 8px; }
  .writing-textarea { width: 100%; padding: 14px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 15px; line-height: 1.7; resize: vertical; font-family: inherit; transition: border-color 0.15s; }
  .writing-textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  .writing-wc { font-size: 13px; color: #6b7280; text-align: right; }
  .writing-wc__warn { color: #dc2626; }
  .nav-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; box-shadow: 0 -2px 8px rgba(0,0,0,0.08); z-index: 50; }
  .nav-bar__info { font-size: 13px; color: #6b7280; }
  .nav-bar__btns { display: flex; gap: 10px; }
  .btn { padding: 10px 24px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .btn--primary { background: #3b82f6; color: #fff; }
  .btn--secondary { background: #f3f4f6; color: #374151; border: 1.5px solid #d1d5db; }
  .btn--submit { background: #16a34a; color: #fff; padding: 12px 32px; }
  .btn:hover:not(:disabled) { filter: brightness(0.92); transform: translateY(-1px); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg { color: #dc2626; font-size: 14px; margin-bottom: 8px; padding: 10px; background: #fee2e2; border-radius: 6px; }
`;
