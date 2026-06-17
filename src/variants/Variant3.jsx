// Variant3.jsx — Complete IELTS Test: Variant 3
// FIX: timer-triggered submit now uses a ref so it always calls the latest handleFinalSubmit
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";
const AUTOSAVE_INTERVAL = 30_000;

const AUDIO_URLS = {
  1: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var3-listening-part1.mp3",
  2: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var3-listening-part2.mp3",
  3: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var3-listening-part3.mp3",
  4: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var3-listening-part4.mp3",
};

const WRITING_IMAGE = "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/images/var-3.png";

const TIMERS = { listening: 40 * 60, reading: 60 * 60, writing: 60 * 60 };

// ─── Listening Data ───────────────────────────────────────────
const LISTENING_SECTIONS = [
  {
    part: 1,
    title: "Part 1 — Conversation",
    description: "You will hear a conversation between a university accommodation officer and a new student applying for a room.",
    formTitle: "Lakewood University Accommodation Application",
    questions: [
      { no: 1,  type: "fill", label: "Full name" },
      { no: 2,  type: "fill", label: "Surname spelling" },
      { no: 3,  type: "fill", label: "Student ID number" },
      { no: 4,  type: "fill", label: "Faculty" },
      { no: 5,  type: "fill", label: "Year of study" },
      { no: 6,  type: "fill", label: "Room type selected" },
      { no: 7,  type: "fill", label: "Weekly room cost: £" },
      { no: 8,  type: "fill", label: "Dietary requirement" },
      { no: 9,  type: "fill", label: "Room available from" },
      { no: 10, type: "fill", label: "Deposit required: £" },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Monologue",
    description: "You will hear a park ranger giving a welcome talk to visitors at a national park.",
    questions: [
      { no: 11, type: "mcq", label: "The Valley Loop is:", options: ["A. 9 km", "B. 14 km", "C. 4 km"] },
      { no: 12, type: "mcq", label: "The Ridge Trail is described as suitable for:", options: ["A. all ages", "B. experienced walkers", "C. children only"] },
      { no: 13, type: "mcq", label: "Dogs are permitted:", options: ["A. on all trails", "B. on the Valley Loop only", "C. anywhere without a lead"] },
      { no: 14, type: "mcq", label: "Wildlife should not be fed because it:", options: ["A. encourages aggression", "B. is always illegal", "C. disrupts feeding behaviour and creates dependence"] },
      { no: 15, type: "mcq", label: "The car park closes at:", options: ["A. 5:00 p.m.", "B. 5:30 p.m.", "C. 6:30 p.m."] },
      { no: 16, type: "fill", label: "The park is home to over 200 species of" },
      { no: 17, type: "fill", label: "Each visitor should carry at least one litre of" },
      { no: 18, type: "fill", label: "Dogs must remain on a ________ at all times" },
      { no: 19, type: "fill", label: "The wildlife exhibition at the visitor centre is free to" },
      { no: 20, type: "fill", label: "The emergency ranger station number is" },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Discussion",
    description: "You will hear students Mia and Oliver meeting with their lecturer Dr Park about a business case study assignment.",
    questions: [
      { no: 21, type: "mcq", label: "What industry does the case study focus on?", options: ["A. Fast food", "B. Plant-based food", "C. Agricultural farming"] },
      { no: 22, type: "mcq", label: "Why did they change their original topic?", options: ["A. The tutor rejected it", "B. Better data was available on plant-based markets", "C. Fast food companies refused to participate"] },
      { no: 23, type: "mcq", label: "Which is their primary focus company?", options: ["A. Oatly", "B. McDonald's", "C. Beyond Meat"] },
      { no: 24, type: "mcq", label: "Which analytical frameworks are used?", options: ["A. SWOT and PESTLE", "B. SWOT and Porter's Five Forces", "C. Porter's Five Forces only"] },
      { no: 25, type: "mcq", label: "The submission deadline is:", options: ["A. 28 November at 5 p.m.", "B. 21 November at noon", "C. 30 November at 9 a.m."] },
      { no: 26, type: "fill", label: "The lecturer's surname: Dr" },
      { no: 27, type: "fill", label: "The secondary comparison company is" },
      { no: 28, type: "fill", label: "The required word count is ________ words" },
      { no: 29, type: "fill", label: "The conclusion argues companies must invest in ________ networks" },
      { no: 30, type: "fill", label: "The required referencing style is" },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Lecture",
    description: "You will hear a lecture about the Human Genome Project.",
    questions: [
      { no: 31, type: "fill", label: "The human genome consists of approximately three billion" },
      { no: 32, type: "fill", label: "It is estimated to contain twenty to twenty-five thousand" },
      { no: 33, type: "fill", label: "The Human Genome Project officially began in" },
      { no: 34, type: "fill", label: "Scientists from ________ countries participated" },
      { no: 35, type: "fill", label: "The project was largely complete by ________ 2003" },
      { no: 36, type: "fill", label: "Genomic science allows more precise identification of gene" },
      { no: 37, type: "fill", label: "Conditions such as cystic fibrosis and ________ disease can now be better identified" },
      { no: 38, type: "fill", label: "Personalised medicine tailors treatment to an individual's genetic" },
      { no: 39, type: "fill", label: "One ethical concern involves genetic ________ by insurance companies" },
      { no: 40, type: "fill", label: "The project is considered a defining achievement of modern" },
    ],
  },
];

// ─── Reading Data ─────────────────────────────────────────────
const READING_PASSAGES = [
  {
    passage: 1,
    title: "The Origins of the Olympic Games",
    text: `A
The ancient Olympic Games were held at Olympia, a sacred sanctuary in western Greece. The first recorded Games took place in 776 BCE, though historians believe competitions may have existed for centuries beforehand. The Games were held every four years — a period called the Olympiad — and dedicated to the god Zeus.

B
The ancient Olympics were exclusively male. Women were not permitted to compete or, according to most accounts, even to watch. A separate festival called the Heraea, held in honour of the goddess Hera, featured footraces for unmarried women.

C
Initially the Games consisted of a single event: a sprint called the stadion, covering approximately 192 metres. Over centuries, new events were added: longer footraces, wrestling, chariot racing, the pentathlon, and the pankration — a brutal combat sport combining wrestling and boxing.

D
Participating carried great prestige. Winners received an olive wreath rather than money, but the honour was enormous. Victorious athletes were celebrated in their home cities and often received privileges for the rest of their lives.

E
The ancient Olympics declined after Roman Emperor Theodosius I banned pagan religious festivals in 393 CE. The Games were not revived until the late nineteenth century, largely through the efforts of French educator Pierre de Coubertin, who believed sport could promote international peace.

F
The first modern Olympic Games were held in Athens in 1896, with fourteen nations and 241 male athletes competing in 43 events. Women were first allowed to compete at the 1900 Paris Olympics, though their participation remained limited for many decades.

G
Today the Games involve athletes from virtually every country on Earth. The Olympic Charter emphasises excellence, friendship, and respect — principles that echo Coubertin's original vision, though on a scale unimaginable to the Games' ancient founders.`,
    questions: [
      {
        range: "1–6", type: "tf",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { no: 1, text: "The first recorded ancient Olympics took place in 776 BCE." },
          { no: 2, text: "Women were permitted to watch ancient Olympic events from a special viewing area." },
          { no: 3, text: "The stadion was a sprint of approximately 192 metres." },
          { no: 4, text: "Olympic winners in ancient times received a cash prize." },
          { no: 5, text: "Pierre de Coubertin was a French educator." },
          { no: 6, text: "The 1896 Athens Olympics included female athletes." },
        ],
      },
      {
        range: "7–10", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 7,  text: "The Heraea was:", options: ["A. a marathon race for men", "B. a festival featuring footraces for women", "C. a religious sacrifice to Zeus", "D. a form of combat sport"] },
          { no: 8,  text: "The ancient Games were eventually discontinued because:", options: ["A. war broke out across Greece", "B. athletes refused to continue", "C. a Roman emperor banned pagan festivals", "D. the sanctuary at Olympia was destroyed"] },
          { no: 9,  text: "Women first participated in the modern Olympics in:", options: ["A. 1896", "B. 1900", "C. 1904", "D. 1920"] },
          { no: 10, text: "The Olympic Charter promotes:", options: ["A. nationalism and commercial competition", "B. excellence, friendship, and respect", "C. financial profit and growth", "D. political unity alone"] },
        ],
      },
      {
        range: "11–13", type: "fill",
        instruction: "Complete the sentences using NO MORE THAN TWO WORDS from the passage.",
        items: [
          { no: 11, text: "The four-year period between Games was called the __________." },
          { no: 12, text: "Ancient Olympic victors were awarded an __________ wreath." },
          { no: 13, text: "The modern Games alternate between Summer and __________ editions." },
        ],
      },
    ],
  },
  {
    passage: 2,
    title: "Noise Pollution and Human Health",
    text: `A
Noise pollution is increasingly recognised as a serious environmental health concern. While air and water pollution have attracted regulatory attention for decades, the effects of chronic noise exposure have only recently gained widespread scientific scrutiny.

B
Noise is measured in decibels (dB). The World Health Organisation recommends that outdoor daytime noise should not exceed 55 dB, and night-time levels should remain below 40 dB. In many urban areas, traffic noise routinely exceeds 65-70 dB, and construction sites may reach 85 dB or more.

C
Research identifies multiple health pathways. The most direct is hearing damage. Prolonged exposure to sounds above 85 dB can permanently damage the tiny hair cells of the inner ear. Unlike many conditions, noise-induced hearing loss is irreversible.

D
Beyond the ear, noise activates the body's stress response. Loud sounds trigger release of cortisol and adrenaline. In the short term this is harmless, but chronically elevated cortisol increases risk of cardiovascular disease, hypertension, and immune suppression.

E
Sleep disruption is another key consequence. Even noises that do not fully wake a sleeper can cause shifts from deep to lighter sleep stages, reducing restorative rest. People living near airports or busy roads often show poorer sleep quality, leading to fatigue and impaired memory.

F
Children are particularly vulnerable. Research on schools near airports shows that children in high-noise environments may experience delayed language acquisition, reading difficulties, and impaired cognitive development.

G
Solutions exist but require political will. Urban planning that separates housing from traffic corridors, noise barriers along motorways, quieter road surfaces, and stricter construction regulations can all reduce noise. At the individual level, noise-cancelling technology and ear protection offer some mitigation, though they do not address root causes.`,
    questions: [
      {
        range: "14–18", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 14, text: "The WHO recommends night-time outdoor noise stays below:", options: ["A. 55 dB", "B. 65 dB", "C. 40 dB", "D. 85 dB"] },
          { no: 15, text: "Noise-induced hearing loss is described as:", options: ["A. treatable with surgery", "B. irreversible", "C. only affecting older people", "D. caused by sounds under 60 dB"] },
          { no: 16, text: "Cortisol is released when the brain:", options: ["A. enters deep sleep", "B. hears calming music", "C. detects a loud or unexpected sound", "D. has low blood pressure"] },
          { no: 17, text: "Chronic noise has been linked to:", options: ["A. improved immune function", "B. lower blood pressure", "C. cardiovascular disease and hypertension", "D. better memory consolidation"] },
          { no: 18, text: "Research on children near airports showed:", options: ["A. improved reading performance", "B. faster language acquisition", "C. cognitive delays and impaired reading", "D. no measurable health impact"] },
        ],
      },
      {
        range: "19–23", type: "fill",
        instruction: "Complete the notes using NO MORE THAN TWO WORDS.",
        items: [
          { no: 19, text: "Noise is measured in units called __________." },
          { no: 20, text: "Hearing damage can occur above __________." },
          { no: 21, text: "Chronic noise keeps __________ levels elevated in the body." },
          { no: 22, text: "Noise can prevent sleep from reaching __________ stages." },
          { no: 23, text: "Noise barriers and quieter road __________ help reduce urban noise." },
        ],
      },
      {
        range: "24–26", type: "paragraph",
        instruction: "Which paragraph (A–G) contains the following information? Write the correct paragraph letter.",
        paragraphNote: "(Paragraphs are labelled A–G from top to bottom of the passage.)",
        items: [
          { no: 24, text: "The effects of noise on children's learning" },
          { no: 25, text: "The body's hormonal response to noise" },
          { no: 26, text: "The effect of noise on sleep quality" },
        ],
      },
    ],
  },
  {
    passage: 3,
    title: "Artificial Intelligence in Healthcare",
    text: `Artificial intelligence is transforming medicine at a remarkable pace. Once confined to research laboratories, AI tools are now deployed in clinical settings worldwide, assisting in diagnosing disease, predicting outcomes, and streamlining administration.

The most striking application is in medical imaging. Deep learning algorithms can analyse X-rays, MRI scans, and retinal photographs with accuracy that rivals — and in some cases exceeds — trained radiologists. A 2020 study found an AI system detected breast cancer in mammograms more accurately than a panel of six radiologists, reducing both false positive and false negative rates.

AI is also used to predict patient deterioration in hospital wards. By continuously monitoring vital signs and integrating data from electronic health records, AI systems can alert clinical staff to patients at risk of sepsis or cardiac arrest hours before conventional methods. Such early warning systems have been shown to reduce mortality rates.

In drug discovery, AI can dramatically shorten the time needed to identify promising compounds. Traditional drug development often takes over a decade. AI models can screen millions of molecular structures rapidly, identifying candidates likely to be effective against disease targets.

Mental health is another area attracting investment. Applications monitoring speech patterns, facial expressions, and written language for signs of depression or anxiety are being tested in several countries, potentially extending mental health screening to underserved populations.

Nevertheless, significant concerns remain. Critics highlight algorithmic bias — systems trained on certain populations may perform less accurately on others. Privacy is also a major concern: AI requires access to vast quantities of sensitive patient data. Managing this data transparently and ethically remains an ongoing challenge.

The regulatory landscape for medical AI is still developing. Most healthcare systems lack clear frameworks for evaluating and approving AI tools. Ensuring AI-assisted decisions remain subject to meaningful human oversight is considered essential for both patient safety and institutional trust.`,
    questions: [
      {
        range: "27–31", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 27, text: "In medical imaging, the passage states that AI:", options: ["A. has replaced all radiologists", "B. performs worse than human specialists", "C. can match or exceed trained radiologists in some cases", "D. only analyses X-ray images"] },
          { no: 28, text: "AI early warning systems in hospitals are intended to:", options: ["A. replace nurses", "B. detect patient deterioration before conventional methods", "C. manage hospital budgets", "D. carry out surgical procedures"] },
          { no: 29, text: "In drug discovery, AI helps by:", options: ["A. funding clinical trials directly", "B. training research staff", "C. rapidly screening large numbers of molecular structures", "D. reducing animal testing requirements"] },
          { no: 30, text: "What concern do critics raise about medical AI?", options: ["A. It is too slow for clinical use", "B. It may be less accurate across different patient populations", "C. It requires too many doctors to operate", "D. Its diagnoses are always incorrect"] },
          { no: 31, text: "The passage states that medical AI regulation is:", options: ["A. fully established globally", "B. no longer needed", "C. still being developed", "D. managed solely by technology companies"] },
        ],
      },
      {
        range: "32–35", type: "fill",
        instruction: "Complete each sentence using NO MORE THAN TWO WORDS.",
        items: [
          { no: 32, text: "AI ward systems integrate vital signs with electronic __________ records." },
          { no: 33, text: "AI can shorten the time to identify promising new __________." },
          { no: 34, text: "Mental health AI tools monitor speech and __________ expressions." },
          { no: 35, text: "A major ethical challenge is managing patient data __________." },
        ],
      },
      {
        range: "36–40", type: "yng",
        instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
        items: [
          { no: 36, text: "AI in healthcare is now used only in research laboratories." },
          { no: 37, text: "The 2020 study found AI outperformed a panel of radiologists at detecting breast cancer." },
          { no: 38, text: "All AI mental health tools have received official approval." },
          { no: 39, text: "Algorithmic bias is a concern raised by critics." },
          { no: 40, text: "Human oversight of AI decisions is considered important." },
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
export default function Variant3({ sessionId, token, user }) {
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
  //         always calls the LATEST version (fixes stale closure bug)
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
          // FIX: call via ref so we always get the latest function
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
          <span className="topbar__variant">Variant 3</span>
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
                <p>The two pie charts below compare how adults in a UK city spent their leisure time in 1990 and 2020.</p>
                <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                <p className="writing-task__min"><strong>Write at least 150 words.</strong></p>
              </div>
              <div className="writing-task__image-wrap">
                <img src={WRITING_IMAGE} alt="Pie charts: Leisure time 1990 vs 2020" className="writing-task__image" />
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
                  Many people today prefer to shop online rather than in physical stores.<br /><br />
                  What are the advantages and disadvantages of online shopping?
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
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Variant 3 · {new Date().toLocaleDateString()}</p>
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
