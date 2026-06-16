// Variant2.jsx — Complete IELTS Test: Variant 2
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";
const AUTOSAVE_INTERVAL = 30_000;

const AUDIO_URLS = {
  1: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-2-listening-part1.mp3",
  2: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-2-listening-part2.mp3",
  3: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-2-listening-part3.mp3",
  4: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var-2-listening-part4.mp3",
};

const WRITING_IMAGE = "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/images/var-2.png";

const TIMERS = { listening: 40 * 60, reading: 60 * 60, writing: 60 * 60 };

const LISTENING_SECTIONS = [
  {
    part: 1,
    title: "Part 1 — Conversation",
    description: "You will hear a conversation between a travel agency assistant and a customer booking a holiday.",
    formTitle: "Sunbright Travel — Booking Form",
    questions: [
      { no: 1,  type: "fill", label: "Customer full name" },
      { no: 2,  type: "fill", label: "Destination city" },
      { no: 3,  type: "fill", label: "Travel month" },
      { no: 4,  type: "fill", label: "Number of nights" },
      { no: 5,  type: "fill", label: "Number of travellers" },
      { no: 6,  type: "fill", label: "Accommodation type" },
      { no: 7,  type: "fill", label: "Hotel name booked" },
      { no: 8,  type: "fill", label: "Hotel star rating" },
      { no: 9,  type: "fill", label: "Total package cost: £" },
      { no: 10, type: "fill", label: "Customer email" },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Monologue",
    description: "You will hear a council officer speaking at a community meeting about a new recycling programme.",
    questions: [
      { no: 11, type: "mcq", label: "The recycling programme starts on:", options: ["A. 1st August", "B. 1st September", "C. 1st October"] },
      { no: 12, type: "mcq", label: "The blue bin is for:", options: ["A. glass and cans", "B. food waste", "C. paper and cardboard"] },
      { no: 13, type: "mcq", label: "Brown bins are collected:", options: ["A. every two weeks", "B. monthly", "C. weekly"] },
      { no: 14, type: "mcq", label: "Plastic bags should go to:", options: ["A. the brown bin", "B. supermarket collection points", "C. the council office"] },
      { no: 15, type: "mcq", label: "Special large-item collections take place:", options: ["A. on any weekday", "B. on Fridays only", "C. on weekends"] },
      { no: 16, type: "fill", label: "Contaminated recycling results in a warning" },
      { no: 17, type: "fill", label: "A sorting guide ________ will be sent to all homes" },
      { no: 18, type: "fill", label: "Residents can download a ________ to identify the correct bin" },
      { no: 19, type: "fill", label: "Large items must not be left on the" },
      { no: 20, type: "fill", label: "The council helpline number is" },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Discussion",
    description: "You will hear two students, Priya and Tom, meeting with their tutor Dr Flanagan about a sustainable energy assignment.",
    questions: [
      { no: 21, type: "mcq", label: "What is the assignment topic?", options: ["A. Nuclear energy", "B. Solar and wind energy", "C. Urban transport"] },
      { no: 22, type: "mcq", label: "Why was nuclear energy removed from the assignment?", options: ["A. The tutor rejected it", "B. The topic was too broad", "C. No data was available"] },
      { no: 23, type: "mcq", label: "Solar energy is argued to be most practical for:", options: ["A. rural areas", "B. offshore platforms", "C. dense urban environments"] },
      { no: 24, type: "mcq", label: "How many peer-reviewed journals were used?", options: ["A. Two", "B. Three", "C. Five"] },
      { no: 25, type: "mcq", label: "The submission deadline is:", options: ["A. Friday at noon", "B. Monday morning", "C. Thursday at 5 p.m."] },
      { no: 26, type: "fill", label: "The tutor's surname" },
      { no: 27, type: "fill", label: "Government reports came from Germany and" },
      { no: 28, type: "fill", label: "The total word count target is ________ words" },
      { no: 29, type: "fill", label: "The limitation of solar energy discussed is ________ dependence" },
      { no: 30, type: "fill", label: "The required bibliography format is" },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Lecture",
    description: "You will hear a lecture on the history and significance of the Silk Road.",
    questions: [
      { no: 31, type: "fill", label: "The Silk Road was a network of ________ connecting several continents" },
      { no: 32, type: "fill", label: "The network peaked during China's ________ Dynasty" },
      { no: 33, type: "fill", label: "The route's name comes from the trade in" },
      { no: 34, type: "fill", label: "Other goods included spices and ________ metals" },
      { no: 35, type: "fill", label: "________ spread from India to East Asia via these routes" },
      { no: 36, type: "fill", label: "Agricultural ________ also crossed borders along the route" },
      { no: 37, type: "fill", label: "Samarkand is in present-day" },
      { no: 38, type: "fill", label: "Samarkand functioned as a major trade" },
      { no: 39, type: "fill", label: "The Silk Road declined with the rise of ________ trade" },
      { no: 40, type: "fill", label: "Some scholars compare the Silk Road to modern" },
    ],
  },
];

const READING_PASSAGES = [
  {
    passage: 1,
    title: "The Development of the Printing Press",
    text: `A
The invention of the printing press in the mid-fifteenth century is widely regarded as one of the most transformative events in human history. Before its development, books in Europe were copied by hand — a slow and expensive process that kept written material largely inaccessible to ordinary people. The few books that existed were typically owned by the Church, wealthy nobles, or university scholars.

B
Johannes Gutenberg, a German goldsmith and inventor, is credited with developing the first movable-type printing press in Europe around 1440. His key innovation was the use of individual metal letters that could be arranged, inked, and pressed onto paper repeatedly, allowing the same page to be reproduced many times in a fraction of the time required by hand.

C
The impact was almost immediate. Within fifty years of Gutenberg's invention, millions of books had been printed across Europe. Prices fell dramatically, making books accessible to merchants, students, and eventually ordinary readers. The spread of literacy accelerated as more people gained access to written material.

D
The printing press also played a decisive role in major historical movements. The Reformation of the sixteenth century was significantly aided by the rapid circulation of Martin Luther's writings, which challenged the authority of the Catholic Church. Similarly, the Scientific Revolution benefited from wider dissemination of research findings.

E
Governments and religious institutions quickly recognised the power of the press. Censorship became widespread, with authorities requiring printers to obtain official approval before publishing texts with political or religious content.

F
Over the following centuries, the press evolved considerably. Steam-powered presses in the nineteenth century dramatically increased speed, enabling mass-circulation newspapers. By the twentieth century, offset lithography had become the dominant commercial printing method.

G
Today, digital technology has once again transformed information production and sharing. Despite this, historians argue that Gutenberg's invention remains the most significant turning point in the history of communication — the moment knowledge first became truly accessible to the many.`,
    questions: [
      {
        range: "1–6", type: "tf",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { no: 1, text: "Before the printing press, books in Europe were usually copied by hand." },
          { no: 2, text: "Gutenberg was born in Italy." },
          { no: 3, text: "Within fifty years, millions of books were printed across Europe." },
          { no: 4, text: "Martin Luther supported the Catholic Church during the Reformation." },
          { no: 5, text: "Steam-powered presses appeared in the nineteenth century." },
          { no: 6, text: "Offset lithography is still the dominant commercial method today." },
        ],
      },
      {
        range: "7–10", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 7, text: "Gutenberg's main innovation was:", options: ["A. using wood as a printing surface", "B. reusable metal letters that could be rearranged", "C. steam-powered machinery", "D. waterproof ink"] },
          { no: 8, text: "The printing press contributed to the Reformation by:", options: ["A. translating the Bible", "B. helping Luther's ideas spread rapidly", "C. training new priests", "D. producing government documents"] },
          { no: 9, text: "Post-press censorship mainly targeted content that was:", options: ["A. scientific", "B. educational", "C. politically or religiously significant", "D. related to art"] },
          { no: 10, text: "According to paragraph G, what most resembles the impact of Gutenberg's press today?", options: ["A. The steam engine", "B. Television", "C. Digital technology", "D. The telephone"] },
        ],
      },
      {
        range: "11–13", type: "fill",
        instruction: "Complete the sentences using NO MORE THAN TWO WORDS from the passage.",
        items: [
          { no: 11, text: "Gutenberg worked as a goldsmith and __________." },
          { no: 12, text: "Falling book prices helped increase __________ across the population." },
          { no: 13, text: "Mass-circulation newspapers became possible thanks to __________ presses." },
        ],
      },
    ],
  },
  {
    passage: 2,
    title: "The Psychology of Decision-Making",
    text: `A
Every day, humans make thousands of decisions — from trivial choices about what to eat to complex judgements affecting careers and relationships. For decades, economists assumed people made decisions rationally, weighing costs and benefits to maximise wellbeing. This view, known as rational choice theory, dominated social science for much of the twentieth century.

B
However, research from the 1970s onward fundamentally challenged this. Psychologists Daniel Kahneman and Amos Tversky demonstrated that people rely on mental shortcuts — called heuristics — when deciding. While useful, heuristics can also lead to predictable errors in judgement known as cognitive biases.

C
One well-known bias is the availability heuristic. People judge the likelihood of an event based on how easily examples come to mind. After a widely-reported plane crash, many people overestimate the danger of flying — even though flying is statistically far safer than driving. The vividness of information distorts risk assessment.

D
Another key concept is loss aversion. Research shows that people typically feel the pain of losing something more intensely than the pleasure of an equivalent gain. This causes investors to hold onto failing investments rather than accepting a loss and moving on.

E
Framing also powerfully shapes decisions. The same information presented differently leads to different choices. People respond more positively to a product described as "90% fat-free" than one described as "10% fat" — though both are identical. Advertisers and policymakers exploit framing regularly.

F
Kahneman later proposed distinguishing two thinking systems. System 1 is fast, intuitive, and unconscious; System 2 is slow, deliberate, and analytical. Most everyday decisions rely on System 1, which is efficient but prone to bias. System 2 requires greater mental effort.

G
Understanding biases has practical applications. In medicine, awareness helps doctors diagnose more accurately. In public policy, governments use nudges — subtle environmental changes guiding people toward better choices without restricting freedom.`,
    questions: [
      {
        range: "14–18", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 14, text: "Rational choice theory assumed that people:", options: ["A. acted randomly", "B. followed emotions", "C. made decisions to maximise their wellbeing", "D. always followed expert advice"] },
          { no: 15, text: "The availability heuristic causes people to:", options: ["A. ignore the media", "B. rely on statistical data", "C. judge probability based on memorable examples", "D. make fully rational choices"] },
          { no: 16, text: "Loss aversion causes investors to:", options: ["A. take more financial risks", "B. hold onto failing investments", "C. always seek professional advice", "D. invest in government bonds"] },
          { no: 17, text: "Framing effects show that:", options: ["A. scientists are immune to presentation", "B. identical information can produce different responses depending on presentation", "C. content always matters more than presentation", "D. people prefer negative descriptions"] },
          { no: 18, text: "System 1 thinking is:", options: ["A. slow and deliberate", "B. reserved for complex tasks", "C. fast and largely unconscious", "D. always accurate"] },
        ],
      },
      {
        range: "19–23", type: "fill",
        instruction: "Complete the notes using NO MORE THAN TWO WORDS.",
        items: [
          { no: 19, text: "Kahneman and Tversky showed people use mental __________ when deciding." },
          { no: 20, text: "Overestimating flying danger after a crash illustrates the __________ heuristic." },
          { no: 21, text: "Loss aversion leads investors to keep failing __________." },
          { no: 22, text: "Framing refers to how information is __________." },
          { no: 23, text: "Governments use __________ to guide people toward healthier choices." },
        ],
      },
      {
        range: "24–26", type: "paragraph",
        instruction: "Which paragraph (A–G) contains the following information? Write the correct paragraph letter.",
        paragraphNote: "(Paragraphs are labelled A–G from top to bottom of the passage.)",
        items: [
          { no: 24, text: "A comparison of two systems of human thinking" },
          { no: 25, text: "An example involving food labelling" },
          { no: 26, text: "Applications of bias research in medicine and policy" },
        ],
      },
    ],
  },
  {
    passage: 3,
    title: "The Decline of Coral Reefs",
    text: `Coral reefs are among the most diverse ecosystems on Earth, supporting an estimated 25% of all marine species despite covering less than 1% of the ocean floor. They provide food, coastal protection, and economic value for hundreds of millions of people — particularly in tropical regions where fishing and tourism depend on reef health.

However, coral reefs face an unprecedented crisis. Scientists estimate up to 50% of the world's coral reefs have been lost since 1950. The primary threats include climate change, ocean acidification, overfishing, and coastal pollution.

Rising sea temperatures are perhaps the most immediate danger. When water becomes too warm, corals expel the algae living in their tissues — a process called coral bleaching. Without algae, which provide corals with up to 90% of their energy through photosynthesis, the coral turns white and becomes vulnerable to disease. If temperatures remain elevated, bleached coral can die within weeks.

Ocean acidification is a related but distinct problem. As atmospheric CO2 rises, oceans absorb more carbon dioxide, forming carbonic acid. The resulting pH drop makes it harder for corals to build and maintain their calcium carbonate skeletons. Reefs in more acidic water grow more slowly and become structurally weaker.

Overfishing disrupts reef ecology. Herbivorous fish such as parrotfish graze on algae that would otherwise smother corals. When these species are removed by overfishing, algae proliferate and overwhelm the reef.

Pollution from agricultural runoff carries excess nutrients into coastal waters, promoting algal blooms that deprive corals of sunlight. Sediment from deforestation smothers reef surfaces, preventing young corals from settling.

Despite the severity of the situation, conservation efforts are underway. Marine protected areas (MPAs) have proven effective at reducing direct human pressures. Coral gardening — cultivating coral fragments in nurseries and transplanting them onto damaged reefs — shows promising results.

Scientists are also exploring experimental approaches, including developing heat-resistant coral strains through selective breeding, and testing shade devices to reduce local water temperature.

The future of coral reefs depends on local conservation and global action to reduce greenhouse gas emissions. Without significant reductions in carbon output, even well-managed reefs may not survive what is happening in the world's oceans.`,
    questions: [
      {
        range: "27–31", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 27, text: "Coral reefs support what proportion of marine species?", options: ["A. Less than 1%", "B. 10%", "C. 25%", "D. 50%"] },
          { no: 28, text: "Coral bleaching occurs when:", options: ["A. corals absorb too much sunlight", "B. corals expel algae in response to high water temperatures", "C. algae produce too much energy", "D. pH increases sharply"] },
          { no: 29, text: "Ocean acidification makes it harder for corals to:", options: ["A. reproduce sexually", "B. regulate temperature", "C. build calcium carbonate skeletons", "D. attract herbivorous fish"] },
          { no: 30, text: "Which species are described as important grazers of algae?", options: ["A. Tuna", "B. Clownfish", "C. Parrotfish", "D. Sharks"] },
          { no: 31, text: "Coral gardening involves:", options: ["A. planting vegetation near reefs", "B. cultivating coral in nurseries then transplanting it", "C. using chemicals to remove algae", "D. installing underwater cameras"] },
        ],
      },
      {
        range: "32–35", type: "fill",
        instruction: "Complete each sentence using NO MORE THAN TWO WORDS.",
        items: [
          { no: 32, text: "Coral reefs cover less than 1% of the __________." },
          { no: 33, text: "Bleached coral can die within __________ if temperatures stay high." },
          { no: 34, text: "Agricultural runoff promotes __________ that reduce sunlight for corals." },
          { no: 35, text: "Marine protected areas reduce direct human __________." },
        ],
      },
      {
        range: "36–40", type: "yng",
        instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
        items: [
          { no: 36, text: "Coral reefs have no economic value for local communities." },
          { no: 37, text: "Bleached coral is more vulnerable to disease than healthy coral." },
          { no: 38, text: "All overfishing occurs illegally." },
          { no: 39, text: "Heat-resistant coral is being developed through selective breeding." },
          { no: 40, text: "Reducing global carbon emissions is important for reef survival." },
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
function countWords(text) { return text.trim().split(/\s+/).filter(Boolean).length; }
function getToken() { return localStorage.getItem("ielts_token"); }
function logout() { localStorage.removeItem("ielts_token"); localStorage.removeItem("ielts_user"); window.location.reload(); }
async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

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
    <button onClick={() => { if (window.confirm("Are you sure you want to log out? Your progress has been saved.")) logout(); }} className="logout-btn">
      Log out
    </button>
  );
}

function AudioPlayer({ src, partNo, onEnded }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  useEffect(() => { setPlaying(false); setPlayed(false); }, [src]);
  const toggle = () => { const el = audioRef.current; if (!el) return; if (playing) { el.pause(); } else { el.play(); } };
  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src} onEnded={() => { setPlaying(false); setPlayed(true); if (onEnded) onEnded(); }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <div className="audio-player__info">
        <span className="audio-player__part">Part {partNo}</span>
        <span className="audio-player__hint">{played ? "✓ Audio played" : playing ? "▶ Playing…" : "Press Play when ready"}</span>
      </div>
      <button className={`audio-player__btn ${playing ? "audio-player__btn--pause" : "audio-player__btn--play"}`} onClick={toggle}>
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
export default function Variant2({ sessionId, token, user }) {
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
    } catch (e) { console.error("Transition error:", e); setPhase(to); }
  };

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
      setTimeout(() => logout(), 5000);
    } catch (e) { setSubmitError(e.message); setSubmitting(false); }
  };

  const goToNextPart = () => { if (listeningPart < 4) setListeningPart((p) => p + 1); else handleTransition("listening", "reading"); };

  const answeredListening = Object.keys(listeningAnswers).length;
  const answeredReading   = Object.keys(readingAnswers).length;

  if (phase === "done") return <DoneScreen user={user} />;

  return (
    <div className="test-container">
      <style>{STYLES}</style>
      <header className="topbar">
        <div className="topbar__left">
          <span className="topbar__name">{user?.fullName || "Candidate"}</span>
          <span className="topbar__sep">·</span>
          <span className="topbar__variant">Variant 2</span>
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

      {/* LISTENING */}
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

      {/* READING */}
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

      {/* WRITING */}
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
                <p>The line graph below shows the percentage of adults who used the internet daily in four countries between 2000 and 2020.</p>
                <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                <p className="writing-task__min"><strong>Write at least 150 words.</strong></p>
              </div>
              <div className="writing-task__image-wrap">
                <img src={WRITING_IMAGE} alt="Line graph: Internet usage 2000–2020" className="writing-task__image" />
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
                  Some people believe that university education should be free for all students, while others think students should pay tuition fees themselves.<br /><br />
                  Discuss both views and give your own opinion.
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
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Variant 2 · {new Date().toLocaleDateString()}</p>
        <p style={{ fontSize: 12, color: "#d1d5db", marginTop: 8 }}>Signing you out in a moment…</p>
      </div>
    </div>
  );
}

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
