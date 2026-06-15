// Variant1.jsx — Complete IELTS Test: Variant 1
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";
const AUTOSAVE_INTERVAL = 30_000;

const AUDIO_URLS = {
  1: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-1-listening-part1.mp3",
  2: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-1-listening-part2.mp3",
  3: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-1-listening-part3.mp3",
  4: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-1-listening-part4.mp3",
};

const WRITING_IMAGE = "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/images/var-1.png";

const TIMERS = { listening: 40 * 60, reading: 60 * 60, writing: 60 * 60 };

const LISTENING_SECTIONS = [
  {
    part: 1,
    title: "Part 1 — Conversation",
    description: "You will hear a conversation between a receptionist at a fitness centre and a customer who wants to join the gym.",
    formTitle: "Green Valley Fitness Centre — Membership Form",
    questions: [
      { no: 1,  type: "fill", label: "First name and surname" },
      { no: 2,  type: "fill", label: "Surname spelling" },
      { no: 3,  type: "fill", label: "Date of birth" },
      { no: 4,  type: "fill", label: "Occupation" },
      { no: 5,  type: "fill", label: "Type of membership chosen" },
      { no: 6,  type: "fill", label: "Annual fee: £" },
      { no: 7,  type: "fill", label: "Contact number" },
      { no: 8,  type: "fill", label: "Membership includes access to all" },
      { no: 9,  type: "fill", label: "Heard about the gym from a" },
      { no: 10, type: "fill", label: "Name of person who recommended the gym" },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Monologue",
    description: "You will hear a guide giving information to visitors at a city history museum.",
    questions: [
      { no: 11, type: "mcq", label: "The museum closes at:", options: ["A. 5:30 p.m.", "B. 6:00 p.m.", "C. 6:30 p.m."] },
      { no: 12, type: "mcq", label: "The Industrial Revolution exhibition is located:", options: ["A. in Gallery B", "B. on the ground floor", "C. on the first floor"] },
      { no: 13, type: "mcq", label: "Guided tours last:", options: ["A. 30 minutes", "B. 45 minutes", "C. 60 minutes"] },
      { no: 14, type: "mcq", label: "Flash photography is:", options: ["A. encouraged", "B. prohibited", "C. only allowed in Gallery B"] },
      { no: 15, type: "mcq", label: "The special exhibition next Saturday is about:", options: ["A. Roman history", "B. famous scientists", "C. local artists"] },
      { no: 16, type: "fill", label: "The ticket office closes at" },
      { no: 17, type: "fill", label: "Meals are served in the café until" },
      { no: 18, type: "fill", label: "The café is beside the" },
      { no: 19, type: "fill", label: "Large bags should be placed in" },
      { no: 20, type: "fill", label: "The special exhibition will take place in" },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Discussion",
    description: "You will hear a discussion between two students (Emma, Jack) and their professor about a university research project.",
    questions: [
      { no: 21, type: "mcq", label: "What is the topic of the project?", options: ["A. Job satisfaction", "B. Remote work and productivity", "C. Workplace safety"] },
      { no: 22, type: "mcq", label: "Why did the students change their topic?", options: ["A. Lack of time", "B. Advice from classmates", "C. Findings from previous research"] },
      { no: 23, type: "mcq", label: "How many participants will they interview?", options: ["A. 30", "B. 40", "C. 50"] },
      { no: 24, type: "mcq", label: "Which research method will they use?", options: ["A. Surveys", "B. Semi-structured interviews", "C. Laboratory experiments"] },
      { no: 25, type: "mcq", label: "They hope to complete data collection by:", options: ["A. June", "B. July", "C. August"] },
      { no: 26, type: "fill", label: "Professor's surname" },
      { no: 27, type: "fill", label: "Emma is responsible for ________ analysis" },
      { no: 28, type: "fill", label: "Jack will write the ________ section" },
      { no: 29, type: "fill", label: "Their original topic was ________ satisfaction" },
      { no: 30, type: "fill", label: "The sample size was increased on the professor's" },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Lecture",
    description: "You will hear a lecture about the decline of bee populations and its environmental impact.",
    questions: [
      { no: 31, type: "fill", label: "Bees are important for crop" },
      { no: 32, type: "fill", label: "About one-third of food production depends on" },
      { no: 33, type: "fill", label: "One cause of bee decline is habitat" },
      { no: 34, type: "fill", label: "Another contributing factor is climate" },
      { no: 35, type: "fill", label: "Excessive use of ________ affects bees" },
      { no: 36, type: "fill", label: "More ________ should be planted in cities" },
      { no: 37, type: "fill", label: "Reducing chemical use in ________ may help" },
      { no: 38, type: "fill", label: "Scientists are protecting colonies from" },
      { no: 39, type: "fill", label: "Public campaigns encourage bee-friendly" },
      { no: 40, type: "fill", label: "Experts believe current trends can be" },
    ],
  },
];

const READING_PASSAGES = [
  {
    passage: 1,
    title: "The History of Public Libraries",
    text: `Public libraries are now regarded as an essential part of modern society, providing access to information, education, and cultural resources. However, the idea of free public access to books is relatively recent.

In ancient times, collections of written works existed in places such as Alexandria in Egypt and Nineveh in Mesopotamia, but these were reserved for scholars, priests, and rulers. During the medieval period in Europe, books were primarily held in monasteries and copied by hand by monks, making them rare and expensive objects inaccessible to ordinary people.

The modern public library movement began in the nineteenth century. In Britain, the Public Libraries Act of 1850 allowed local authorities to establish free lending libraries funded by local taxes. Similar legislation followed in the United States, where philanthropists such as Andrew Carnegie funded the construction of thousands of library buildings between the 1880s and the 1920s.

The twentieth century saw public libraries expand their services beyond book lending. Libraries began offering newspapers, periodicals, music recordings, and films. The rise of literacy campaigns increased public demand for reading materials, and libraries became important centres of community life.

In recent decades, public libraries have faced new challenges and opportunities. The arrival of the internet and digital media transformed how information is accessed. Many libraries introduced computer terminals and internet access, and today most offer digital lending services for e-books and audiobooks.

Critics have argued that in the digital age, physical libraries are becoming obsolete. However, defenders point out that libraries serve populations who lack internet access at home, provide quiet study environments, support lifelong learning, and act as trusted institutions in communities where other public services have declined.

The future of public libraries will likely depend on their ability to adapt to changing information habits while continuing to serve as inclusive public spaces for education and culture.`,
    questions: [
      {
        range: "1–6", type: "tf",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { no: 1, text: "Ancient libraries in Alexandria were open to all members of the public." },
          { no: 2, text: "During the medieval period, books in Europe were often copied by monks." },
          { no: 3, text: "The Public Libraries Act of 1850 was passed in the United States." },
          { no: 4, text: "Andrew Carnegie funded the construction of many library buildings in the USA." },
          { no: 5, text: "Public libraries began offering music recordings in the twentieth century." },
          { no: 6, text: "Most libraries today offer digital lending services." },
        ],
      },
      {
        range: "7–10", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 7, text: "According to the passage, the Public Libraries Act of 1850 allowed local authorities to:", options: ["A. charge fees for borrowing books", "B. sell books to the public", "C. set up free lending libraries", "D. build schools in the community"] },
          { no: 8, text: "Libraries in the twentieth century responded to rising literacy by:", options: ["A. reducing opening hours", "B. expanding services beyond book lending", "C. focusing only on children", "D. closing smaller branches"] },
          { no: 9, text: "Which group does the passage say libraries particularly help in the digital age?", options: ["A. People who prefer printed books", "B. University students", "C. People without internet access at home", "D. Local government workers"] },
          { no: 10, text: "According to the passage, the future of public libraries depends on:", options: ["A. government funding levels", "B. adapting to new habits while remaining inclusive", "C. reducing digital services", "D. building more branches"] },
        ],
      },
      {
        range: "11–13", type: "fill",
        instruction: "Complete the sentences using NO MORE THAN TWO WORDS from the passage.",
        items: [
          { no: 11, text: "During the medieval period in Europe, books were mainly kept in __________." },
          { no: 12, text: "The expansion of __________ campaigns increased public demand for reading materials." },
          { no: 13, text: "Many libraries now offer __________ lending services for e-books and audiobooks." },
        ],
      },
    ],
  },
  {
    passage: 2,
    title: "The Science of Sleep",
    text: `Sleep is one of the most fundamental biological requirements of the human body. Despite spending approximately one-third of their lives asleep, many people remain unaware of the complex and essential processes that occur during sleep.

Scientists have established that sleep plays a vital role in physical restoration. During sleep, the body repairs tissues, produces hormones essential for growth, and strengthens the immune system. Athletes who engage in intense physical training have been found to require more sleep than average to allow their bodies to recover adequately.

Research has also demonstrated that sleep is critical for cognitive function. Memory consolidation — the process by which the brain transfers short-term memories into long-term storage — occurs predominantly during sleep. Studies show that individuals who are sleep-deprived perform significantly worse on tasks requiring concentration, problem-solving, and decision-making.

The relationship between sleep and physical health is well-documented. Chronic sleep deprivation has been linked to an increased risk of cardiovascular disease, obesity, type 2 diabetes, and weakened immunity. Some researchers suggest that insufficient sleep disrupts the regulation of hormones that control appetite, contributing to weight gain.

Researchers have also investigated the relationship between sleep and emotional health. Some evidence suggests that adequate sleep improves emotional regulation and reduces stress levels.

Modern lifestyles have significantly altered sleeping patterns. Artificial lighting, electronic devices, and demanding work schedules have contributed to shorter sleep duration in many countries. As a result, public health campaigns increasingly emphasize the importance of healthy sleeping habits.

Although questions remain unanswered, scientists continue to explore sleep using advanced brain-imaging technologies and long-term studies.`,
    questions: [
      {
        range: "14–18", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 14, text: "According to the passage, sleep helps the body by:", options: ["A. reducing hunger", "B. repairing tissues", "C. preventing infections", "D. improving eyesight"] },
          { no: 15, text: "Memory formation mainly occurs:", options: ["A. during physical exercise", "B. before sleep", "C. during sleep", "D. after waking"] },
          { no: 16, text: "Sleep deprivation may affect:", options: ["A. concentration", "B. height", "C. language ability only", "D. hearing"] },
          { no: 17, text: "Modern technology has generally:", options: ["A. increased sleep duration", "B. had no effect on sleep", "C. shortened sleeping time", "D. improved memory"] },
          { no: 18, text: "Scientists currently study sleep using:", options: ["A. archaeological evidence", "B. satellite images", "C. brain-imaging methods", "D. historical records"] },
        ],
      },
      {
        range: "19–23", type: "fill",
        instruction: "Complete the notes using NO MORE THAN TWO WORDS.",
        items: [
          { no: 19, text: "Sleep contributes to physical __________." },
          { no: 20, text: "Athletes may need more sleep after intensive __________." },
          { no: 21, text: "Insufficient sleep can increase the risk of __________ disease." },
          { no: 22, text: "Good sleep improves emotional __________." },
          { no: 23, text: "Public campaigns encourage healthy sleeping __________." },
        ],
      },
      {
        range: "24–26", type: "paragraph",
        instruction: "Which paragraph (A–G) contains the following information? Write the correct paragraph letter.",
        paragraphNote: "(Paragraphs are labelled A–G from top to bottom of the passage.)",
        items: [
          { no: 24, text: "Effects of technology on sleeping patterns" },
          { no: 25, text: "Sleep and memory development" },
          { no: 26, text: "Future research methods" },
        ],
      },
    ],
  },
  {
    passage: 3,
    title: "The Future of Urban Farming",
    text: `As global populations continue to rise, many experts believe traditional agricultural systems may struggle to meet future food demands. Consequently, urban farming has attracted increasing attention.

Urban farming refers to the production of food within cities and surrounding areas. Methods range from rooftop gardens and community farms to highly sophisticated vertical farming systems.

Supporters argue that urban farming offers several advantages. Since food is produced closer to consumers, transportation costs and greenhouse gas emissions may be reduced. Fresh produce can reach markets more quickly, improving quality and decreasing waste.

Vertical farming has become one of the most innovative developments in this field. In these facilities, crops are grown indoors under carefully controlled conditions. Water usage is often lower than in conventional farming, and crops can be produced throughout the year.

However, critics argue that some urban farming systems remain expensive. The construction and maintenance of vertical farms require substantial investment, particularly because artificial lighting consumes significant amounts of electricity.

Despite these challenges, technological improvements may eventually reduce costs. Automation, renewable energy, and more efficient lighting systems could make urban farming economically sustainable.

Some researchers emphasize that urban farming should complement rather than replace traditional agriculture. While cities can contribute to food production, large-scale farming will continue to play a crucial role in feeding the world's population.

Governments in several countries have already introduced policies supporting urban agriculture. These initiatives include grants, educational programs, and regulations encouraging sustainable food production.

The long-term success of urban farming will depend on balancing economic, environmental, and social considerations.`,
    questions: [
      {
        range: "27–31", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 27, text: "Urban farming has gained attention because:", options: ["A. traditional farming has disappeared", "B. future food demand is increasing", "C. cities are becoming smaller", "D. transport has become impossible"] },
          { no: 28, text: "One advantage of urban farming is:", options: ["A. elimination of all emissions", "B. faster delivery of fresh produce", "C. lower food prices in every case", "D. reduced labour requirements"] },
          { no: 29, text: "Vertical farms:", options: ["A. operate outdoors only", "B. require no electricity", "C. allow year-round production", "D. consume more water than traditional farms"] },
          { no: 30, text: "Critics are mainly concerned about:", options: ["A. labour shortages", "B. water quality", "C. investment costs", "D. crop diseases"] },
          { no: 31, text: "According to some researchers, urban farming should:", options: ["A. replace conventional agriculture", "B. focus only on vegetables", "C. complement existing farming methods", "D. be restricted to wealthy countries"] },
        ],
      },
      {
        range: "32–35", type: "fill",
        instruction: "Complete each sentence using NO MORE THAN TWO WORDS.",
        items: [
          { no: 32, text: "Crops in vertical farms are grown under carefully controlled __________." },
          { no: 33, text: "Artificial lighting increases __________ consumption." },
          { no: 34, text: "Future improvements may include the use of __________ energy." },
          { no: 35, text: "Governments support urban farming through grants and educational __________." },
        ],
      },
      {
        range: "36–40", type: "yng",
        instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
        items: [
          { no: 36, text: "Urban farming alone will feed the entire global population." },
          { no: 37, text: "Vertical farming currently requires considerable investment." },
          { no: 38, text: "Technological advances may lower costs in the future." },
          { no: 39, text: "Every country already provides financial support for urban farming." },
          { no: 40, text: "Economic factors are one of the elements influencing urban farming's success." },
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

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getToken() {
  return localStorage.getItem("ielts_token");
}

function logout() {
  localStorage.removeItem("ielts_token");
  localStorage.removeItem("ielts_user");
  window.location.reload();
}

async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Timer ────────────────────────────────────────────────────
function Timer({ seconds, label }) {
  const urgent = seconds <= 300;
  return (
    <div className={`timer ${urgent ? "timer--urgent" : ""}`}>
      <span className="timer__label">{label}</span>
      <span className="timer__value">{formatTime(seconds)}</span>
    </div>
  );
}

// ─── Logout button ────────────────────────────────────────────
function LogoutBtn() {
  const handleClick = () => {
    if (window.confirm("Are you sure you want to log out? Your progress has been saved.")) {
      logout();
    }
  };
  return (
    <button onClick={handleClick} className="logout-btn">
      Log out
    </button>
  );
}

// ─── Audio Player ─────────────────────────────────────────────
function AudioPlayer({ src, partNo, onEnded }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);

  useEffect(() => { setPlaying(false); setPlayed(false); }, [src]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); } else { el.play(); }
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => { setPlaying(false); setPlayed(true); if (onEnded) onEnded(); }}
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

// ─── Question components ──────────────────────────────────────
function FillQuestion({ q, value, onChange }) {
  return (
    <div className="question question--fill">
      <span className="question__no">{q.no}.</span>
      <label className="question__label">
        {q.label || q.text}
        <input type="text" className="question__input" value={value || ""} onChange={(e) => onChange(q.no, e.target.value)} placeholder="Your answer" />
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
export default function Variant1({ sessionId, token, user }) {
  const [phase, setPhase] = useState("listening");
  const [listeningPart, setListeningPart] = useState(1);
  const [readingPassage, setReadingPassage] = useState(1);
  const [listeningAnswers, setListeningAnswers] = useState({});
  const [readingAnswers, setReadingAnswers] = useState({});
  const [writingTask1, setWritingTask1] = useState("");
  const [writingTask2, setWritingTask2] = useState("");
  const [activeWritingTask, setActiveWritingTask] = useState(1);
  const [listeningTime, setListeningTime] = useState(TIMERS.listening);
  const [readingTime, setReadingTime] = useState(TIMERS.reading);
  const [writingTime, setWritingTime] = useState(TIMERS.writing);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const timerRef = useRef(null);
  const autosaveRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (phase === "listening") {
        setListeningTime((t) => { if (t <= 1) { handleTransition("listening", "reading"); return 0; } return t - 1; });
      } else if (phase === "reading") {
        setReadingTime((t) => { if (t <= 1) { handleTransition("reading", "writing"); return 0; } return t - 1; });
      } else if (phase === "writing") {
        setWritingTime((t) => { if (t <= 1) { handleFinalSubmit(); return 0; } return t - 1; });
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Autosave ───────────────────────────────────────────────
  const doAutosave = useCallback(async () => {
    try {
      if (phase === "listening") {
        const answers = Object.entries(listeningAnswers).map(([no, text]) => ({ sectionPart: Math.ceil(Number(no) / 10), questionNo: Number(no), answerText: text }));
        if (answers.length) await apiPost("/answers/save-section", { sessionId, section: "listening", answers, isFinal: false });
      } else if (phase === "reading") {
        const answers = Object.entries(readingAnswers).map(([no, text]) => ({ sectionPart: no <= 13 ? 1 : no <= 26 ? 2 : 3, questionNo: Number(no), answerText: text }));
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

  const setListeningAnswer = (no, val) => setListeningAnswers((prev) => ({ ...prev, [no]: val }));
  const setReadingAnswer   = (no, val) => setReadingAnswers((prev) => ({ ...prev, [no]: val }));

  // ── Transitions ────────────────────────────────────────────
  const handleTransition = async (from, to) => {
    clearInterval(timerRef.current);
    clearInterval(autosaveRef.current);
    try {
      if (from === "listening") {
        const answers = Object.entries(listeningAnswers).map(([no, text]) => ({ sectionPart: Math.ceil(Number(no) / 10), questionNo: Number(no), answerText: text }));
        await apiPost("/answers/save-section", { sessionId, section: "listening", answers, isFinal: true });
      } else if (from === "reading") {
        const answers = Object.entries(readingAnswers).map(([no, text]) => ({ sectionPart: no <= 13 ? 1 : no <= 26 ? 2 : 3, questionNo: Number(no), answerText: text }));
        await apiPost("/answers/save-section", { sessionId, section: "reading", answers, isFinal: true });
      }
      await apiPost(`/sessions/${sessionId}/transition`, { from, to });
      setPhase(to);
    } catch (e) {
      console.error("Transition error:", e);
      setPhase(to);
    }
  };

  // ── Final submit ───────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(autosaveRef.current);
    try {
      await apiPost("/answers/writing/save", { sessionId, taskNo: 1, responseText: writingTask1, wordCount: countWords(writingTask1), isFinal: true });
      await apiPost("/answers/writing/save", { sessionId, taskNo: 2, responseText: writingTask2, wordCount: countWords(writingTask2), isFinal: true });
      await apiPost(`/sessions/${sessionId}/transition`, { from: "writing", to: "completed" });
      setPhase("done");
      // Auto-logout after 5 seconds so the done screen is visible briefly
      setTimeout(() => logout(), 5000);
    } catch (e) {
      setSubmitError(e.message);
      setSubmitting(false);
    }
  };

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
          <span className="topbar__variant">Variant 1</span>
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
              <p className="instructions-box__note">Listen to the audio, then answer Questions {(listeningPart - 1) * 10 + 1}–{listeningPart * 10}.</p>
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
                {psg.text.split("\n\n").map((para, i) => <p key={i} className="reading-text__para">{para}</p>)}
              </div>
              <div className="reading-questions">
                {psg.questions.map((qGroup, gi) => (
                  <div key={gi} className="question-group">
                    <p className="question-group__range">Questions {qGroup.range}</p>
                    <p className="question-group__instruction">{qGroup.instruction}</p>
                    {qGroup.paragraphNote && <p className="question-group__note">{qGroup.paragraphNote}</p>}
                    {qGroup.type === "tf"       && qGroup.items.map((item) => <TfQuestion        key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "yng"      && qGroup.items.map((item) => <YngQuestion       key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "mcq4"     && qGroup.items.map((item) => <Mcq4Question      key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "fill"     && qGroup.items.map((item) => <FillQuestion      key={item.no} q={item}   value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                    {qGroup.type === "paragraph"&& qGroup.items.map((item) => <ParagraphQuestion key={item.no} item={item} value={readingAnswers[item.no]} onChange={setReadingAnswer} />)}
                  </div>
                ))}
              </div>
            </div>
            <div className="nav-bar">
              <span className="nav-bar__info">Passage {readingPassage} of 3</span>
              <div className="nav-bar__btns">
                {readingPassage > 1 && <button className="btn btn--secondary" onClick={() => setReadingPassage((p) => p - 1)}>← Previous</button>}
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
                <p>The chart below shows the number of international tourists visiting four European countries in 2024.</p>
                <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                <p className="writing-task__min"><strong>Write at least 150 words.</strong></p>
              </div>
              <div className="writing-task__image-wrap">
                <img src={WRITING_IMAGE} alt="Bar chart: International Tourist Arrivals 2024" className="writing-task__image" />
              </div>
              <div className="writing-task__editor">
                <textarea className="writing-textarea" value={writingTask1} onChange={(e) => setWritingTask1(e.target.value)} placeholder="Write your Task 1 response here…" rows={18} />
                <div className="writing-wc">Word count: <strong>{countWords(writingTask1)}</strong>{countWords(writingTask1) < 150 && <span className="writing-wc__warn"> (minimum 150)</span>}</div>
              </div>
            </div>
          )}

          {activeWritingTask === 2 && (
            <div className="writing-task">
              <div className="writing-task__prompt">
                <p className="writing-task__time">⏱ Recommended: 40 minutes</p>
                <p>Write about the following topic:</p>
                <blockquote className="writing-task__topic">
                  In many countries, crime rates among young people are increasing.<br />
                  What are the causes of this problem, and what solutions can you suggest?
                </blockquote>
                <p className="writing-task__min"><strong>Write at least 250 words.</strong></p>
              </div>
              <div className="writing-task__editor">
                <textarea className="writing-textarea" value={writingTask2} onChange={(e) => setWritingTask2(e.target.value)} placeholder="Write your Task 2 response here…" rows={24} />
                <div className="writing-wc">Word count: <strong>{countWords(writingTask2)}</strong>{countWords(writingTask2) < 250 && <span className="writing-wc__warn"> (minimum 250)</span>}</div>
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
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Variant 1 · {new Date().toLocaleDateString()}</p>
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