// Variant7.jsx — Complete IELTS Test: Variant 7
// Includes the timer-ref fix so the writing timer reliably auto-submits.
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";
const AUTOSAVE_INTERVAL = 30_000;

const AUDIO_URLS = {
  1: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var7-listening-part1.mp3",
  2: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var7-listening-part2.mp3",
  3: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var7-listening-part3.mp3",
  4: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var7-listening-part4.mp3",
};

const WRITING_IMAGE = "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/images/var-7.png";

const TIMERS = { listening: 40 * 60, reading: 60 * 60, writing: 60 * 60 };

// ─── Listening Data ───────────────────────────────────────────
const LISTENING_SECTIONS = [
  {
    part: 1,
    title: "Part 1 — Conversation",
    description: "You will hear a conversation between a conference organiser and a delegate registering for an academic conference.",
    formTitle: "Brightfield Academic Conferences — Delegate Registration",
    questions: [
      { no: 1,  type: "fill", label: "Full name" },
      { no: 2,  type: "fill", label: "University affiliation" },
      { no: 3,  type: "fill", label: "Department" },
      { no: 4,  type: "fill", label: "Registration type (speaker/delegate)" },
      { no: 5,  type: "fill", label: "Dietary requirement" },
      { no: 6,  type: "fill", label: "Conference dates: ________ and ________ November" },
      { no: 7,  type: "fill", label: "Venue" },
      { no: 8,  type: "fill", label: "Hotel room booked: night of ________ only" },
      { no: 9,  type: "fill", label: "Registration fee: £" },
      { no: 10, type: "fill", label: "Invoice email" },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Monologue",
    description: "You will hear a project manager briefing a team about a new office relocation.",
    questions: [
      { no: 11, type: "mcq", label: "The office relocation is on:", options: ["A. 12th March", "B. 14th March", "C. 22nd March"] },
      { no: 12, type: "mcq", label: "The new office has approximately how much more space?", options: ["A. 20% more", "B. 30% more", "C. 40% more"] },
      { no: 13, type: "mcq", label: "Priority parking is given to:", options: ["A. senior managers", "B. employees with mobility requirements", "C. IT staff"] },
      { no: 14, type: "mcq", label: "Personal items must be packed by:", options: ["A. 10th March", "B. 12th March", "C. 14th March"] },
      { no: 15, type: "mcq", label: "On the first day, building access cards can be collected from:", options: ["A. the relocation team office", "B. the IT department", "C. the reception desk"] },
      { no: 16, type: "fill", label: "The new office is at Harborough Park, ________ 9" },
      { no: 17, type: "fill", label: "The public car park is ________ metres from the new building" },
      { no: 18, type: "fill", label: "IT equipment will be handled by the IT team and external" },
      { no: 19, type: "fill", label: "Most staff will use ________ desks in the new office" },
      { no: 20, type: "fill", label: "There will be a team ________ at 8:30 a.m. on the first day" },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Discussion",
    description: "You will hear two students, Felix and Amara, discussing a group project with their module leader, Dr Osei, about sustainable tourism.",
    questions: [
      { no: 21, type: "mcq", label: "Which countries are the three case studies?", options: ["A. Canada, Norway, and Japan", "B. Iceland, Costa Rica, and New Zealand", "C. France, Kenya, and Australia"] },
      { no: 22, type: "mcq", label: "What is the project's central argument?", options: ["A. Government control always produces the best tourism outcomes", "B. Tourism should be banned in ecologically sensitive areas", "C. Sustainable tourism requires local community ownership of policy"] },
      { no: 23, type: "mcq", label: "Which case is described as the strongest evidence for their argument?", options: ["A. Iceland", "B. New Zealand", "C. Costa Rica"] },
      { no: 24, type: "mcq", label: "What is the submission format?", options: ["A. A 3,000-word report only", "B. A presentation only", "C. A 5,000-word report and a ten-minute presentation"] },
      { no: 25, type: "mcq", label: "When is the written report due?", options: ["A. 19th May", "B. 23rd May", "C. 30th May"] },
      { no: 26, type: "fill", label: "The module leader's surname: Dr" },
      { no: 27, type: "fill", label: "Three types of data gathered include visitor statistics, policy documents, and academic" },
      { no: 28, type: "fill", label: "Iceland is acknowledged as a ________ to their main argument" },
      { no: 29, type: "fill", label: "The presentation lasts ________ minutes" },
      { no: 30, type: "fill", label: "Amara is leading on the ________ Rica case study" },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Lecture",
    description: "You will hear a lecture on the history and science of climate change.",
    questions: [
      { no: 31, type: "fill", label: "Natural climate cycles are driven partly by variations in Earth's" },
      { no: 32, type: "fill", label: "Burning fossil fuels and ________ are the main human causes of current climate change" },
      { no: 33, type: "fill", label: "Atmospheric CO2 has risen from 280 parts per million to over ________ ppm today" },
      { no: 34, type: "fill", label: "Current CO2 levels are the highest in at least ________ years" },
      { no: 35, type: "fill", label: "Greenhouse gases trap heat that would otherwise be ________ into space" },
      { no: 36, type: "fill", label: "Without the greenhouse effect, Earth would be approximately 33 degrees" },
      { no: 37, type: "fill", label: "Global temperatures have risen by about ________ degrees Celsius since pre-industrial times" },
      { no: 38, type: "fill", label: "Sea levels have risen by around ________ centimetres over the past century" },
      { no: 39, type: "fill", label: "The ________ synthesises global scientific research on climate change" },
      { no: 40, type: "fill", label: "The Paris Agreement aimed to limit warming to ________ degrees Celsius" },
    ],
  },
];

// ─── Reading Data ─────────────────────────────────────────────
const READING_PASSAGES = [
  {
    passage: 1,
    title: "The Philosophy and Practice of Meditation",
    text: `A
Meditation — the practice of deliberately directing attention in order to cultivate mental qualities such as clarity, calm, and awareness — has origins spanning thousands of years across multiple cultures. While most commonly associated with Buddhist and Hindu traditions, forms of contemplative practice appear in early Christian monasticism, Jewish mysticism, and Sufi Islam. In the West, meditation remained a largely religious practice until the latter half of the twentieth century.

B
The secularisation of meditation in the West accelerated in the 1960s and 1970s, partly through the influence of Transcendental Meditation, introduced to Western audiences by Maharishi Mahesh Yogi. But it was Jon Kabat-Zinn's development of Mindfulness-Based Stress Reduction (MBSR) at the University of Massachusetts in 1979 that most decisively brought meditation into the medical mainstream. MBSR stripped mindfulness of religious context and reframed it as a clinically applicable intervention for stress, chronic pain, and mental illness.

C
The scientific investigation of meditation has expanded substantially since the 1990s. Neuroimaging studies have demonstrated that regular meditation practice is associated with structural and functional changes in the brain. Long-term meditators show increased cortical thickness in regions associated with attention and self-regulation, and reduced activity in the default mode network — the brain's "resting state" network, which is linked to mind-wandering and rumination.

D
Clinical research has found that Mindfulness-Based Cognitive Therapy (MBCT), which combines meditation with elements of cognitive behavioural therapy, significantly reduces the risk of depressive relapse in patients with recurrent depression. The evidence is strong enough that MBCT is now recommended by the National Institute for Health and Care Excellence (NICE) in the United Kingdom as a first-line treatment option.

E
Despite the enthusiasm, methodological critics have raised concerns. Many studies have used small sample sizes, lacked active control groups, and relied on self-reported outcomes. A major review by Van Dam and colleagues in 2018 highlighted the risk of "mindfulness hype" — the tendency to overclaim benefits based on limited evidence. The authors called for more rigorous trial design and greater consistency in defining what "mindfulness" means across studies.

F
Meditation has also been explored in educational settings. Schools in several countries have implemented mindfulness programmes, with claims of improved student wellbeing, concentration, and behaviour. However, the evidence base for school-based mindfulness remains mixed, and critics have noted that teacher training quality varies considerably, which may affect outcomes.

G
Commercially, the meditation industry has grown dramatically. Smartphone apps, online courses, and corporate wellness programmes have brought meditation to millions. Critics argue that commodification risks reducing a rich contemplative tradition to a productivity tool, divorced from its ethical and philosophical roots. Proponents counter that wider accessibility is worth some loss of depth.`,
    questions: [
      {
        range: "1–6", type: "tf",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { no: 1, text: "Meditation has existed in traditions other than Buddhism and Hinduism." },
          { no: 2, text: "MBSR was developed at Harvard University." },
          { no: 3, text: "Long-term meditators show structural changes in the brain." },
          { no: 4, text: "MBCT is recommended by NICE as a first-line treatment for recurrent depression." },
          { no: 5, text: "All studies on meditation have used large sample sizes and rigorous designs." },
          { no: 6, text: "Meditation apps are used exclusively by people with mental health conditions." },
        ],
      },
      {
        range: "7–10", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 7,  text: "Jon Kabat-Zinn's contribution to meditation was:", options: ["A. introducing Transcendental Meditation to the West", "B. creating a clinically applicable, secular form of mindfulness", "C. proving meditation's benefits in Buddhist monasteries", "D. developing a pharmacological treatment for stress"] },
          { no: 8,  text: "What did neuroimaging research find in long-term meditators?", options: ["A. Reduced cortical thickness in all brain areas", "B. Increased activity in the default mode network", "C. Structural and functional changes in attention and self-regulation regions", "D. Complete elimination of mind-wandering"] },
          { no: 9,  text: "What was the main concern raised by the 2018 review?", options: ["A. Meditation is harmful to mental health", "B. Many studies had methodological weaknesses and overclaimed benefits", "C. Mindfulness should be restricted to religious settings", "D. MBCT is no more effective than standard medication"] },
          { no: 10, text: "According to paragraph G, critics of the commercialisation of meditation argue that it:", options: ["A. has increased access to meditation globally", "B. risks disconnecting the practice from its deeper ethical roots", "C. has replaced traditional psychotherapy", "D. has been proven ineffective by recent research"] },
        ],
      },
      {
        range: "11–13", type: "fill",
        instruction: "Complete the sentences using NO MORE THAN TWO WORDS.",
        items: [
          { no: 11, text: "MBSR reframed mindfulness as a __________ intervention for stress and mental illness." },
          { no: 12, text: "The default mode network is associated with mind-wandering and __________." },
          { no: 13, text: "Critics note that __________ quality varies in school-based mindfulness programmes." },
        ],
      },
    ],
  },
  {
    passage: 2,
    title: "The History and Ethics of Organ Transplantation",
    text: `A
The transplantation of organs from one human body to another was, for most of history, a medical fantasy. The technical, biological, and ethical barriers were immense. Yet within a few decades of the mid-twentieth century, organ transplantation transformed from laboratory experiment to routine surgery — one of the most dramatic advances in the history of medicine.

B
The first successful kidney transplant between identical twins was performed in Boston in 1954 by Joseph Murray and his team. The use of identical twins circumvented the problem of immune rejection — the tendency of the body's immune system to attack and destroy foreign tissue. This key breakthrough demonstrated that transplantation was biologically feasible, but the limitation to identical twins made it applicable to very few patients.

C
The development of immunosuppressant drugs — particularly ciclosporin, introduced in clinical use in the late 1970s — transformed the field. By suppressing the immune system's rejection response, ciclosporin allowed transplants between unrelated individuals. Graft survival rates improved dramatically, and transplantation of the kidney, heart, liver, and lungs became increasingly standard procedures in specialised centres worldwide.

D
Despite these advances, organ shortages remain the defining constraint of transplantation medicine. In most countries, demand for transplantable organs substantially exceeds supply. The gap has widened as transplant success rates have improved and more conditions have become treatable by transplant. Patients may wait years for a suitable organ, and many die on waiting lists.

E
Different countries have adopted different approaches to organ donation. Most operate under an "opt-in" system, in which consent to donate organs after death must be explicitly given during a person's lifetime. Some countries, including Spain and Belgium, use an "opt-out" or presumed consent system, in which all citizens are assumed to have consented to donation unless they register an objection. Spain's opt-out system, combined with strong clinical infrastructure, has produced donation rates among the highest in the world.

F
Ethical debates around transplantation extend beyond consent. The allocation of scarce organs raises complex questions of justice. Should the sickest patients be prioritised, or those most likely to benefit from a transplant? Should lifestyle factors — such as a history of heavy alcohol use in a patient needing a liver transplant — influence eligibility? These questions have no easy answers, and criteria differ significantly between countries.

G
The possibility of xenotransplantation — transplanting organs from animals, particularly pigs, into humans — has long been explored as a potential solution to organ shortage. Recent advances in genetic engineering have allowed scientists to modify pig organs to reduce immune rejection. In 2022, surgeons at the University of Maryland transplanted a genetically modified pig heart into a human patient. The patient survived for 60 days, representing a significant landmark in this still-experimental field.`,
    questions: [
      {
        range: "14–18", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 14, text: "The first successful kidney transplant was performed between:", options: ["A. strangers", "B. parent and child", "C. identical twins", "D. siblings who were not identical twins"] },
          { no: 15, text: "Ciclosporin improved transplantation by:", options: ["A. preventing organ failure", "B. suppressing the immune rejection response", "C. increasing the supply of donor organs", "D. improving surgical techniques"] },
          { no: 16, text: "The main constraint on transplantation described in paragraph D is:", options: ["A. lack of surgical expertise", "B. cost of surgery", "C. insufficient donor organs relative to demand", "D. failure of immunosuppressant drugs"] },
          { no: 17, text: "Spain's high donation rate is attributed to:", options: ["A. a law making donation compulsory", "B. an opt-out system combined with strong clinical infrastructure", "C. financial incentives for donors", "D. religious support for donation"] },
          { no: 18, text: "Xenotransplantation involves:", options: ["A. transplanting human organs to animals", "B. transplanting artificial organs into humans", "C. transplanting genetically modified animal organs into humans", "D. developing organs from stem cells"] },
        ],
      },
      {
        range: "19–23", type: "fill",
        instruction: "Complete the notes using NO MORE THAN TWO WORDS.",
        items: [
          { no: 19, text: "Joseph Murray's 1954 transplant circumvented the problem of immune __________." },
          { no: 20, text: "Ciclosporin was introduced into clinical use in the __________ 1970s." },
          { no: 21, text: "In opt-in systems, organ donation requires __________ given during a person's lifetime." },
          { no: 22, text: "Countries with opt-out systems assume citizens have __________ to donation." },
          { no: 23, text: "In 2022, surgeons transplanted a pig heart that had been __________ modified." },
        ],
      },
      {
        range: "24–26", type: "paragraph",
        instruction: "Which paragraph (A–G) contains the following information? Write the correct paragraph letter.",
        paragraphNote: "(Paragraphs are labelled A–G from top to bottom of the passage.)",
        items: [
          { no: 24, text: "Ethical questions about how to allocate scarce organs fairly" },
          { no: 25, text: "A breakthrough moment in the experimental use of animal organs in humans" },
          { no: 26, text: "The impact of immunosuppressant drugs on transplant outcomes" },
        ],
      },
    ],
  },
  {
    passage: 3,
    title: "Language Extinction and the Effort to Preserve Linguistic Diversity",
    text: `Of the estimated 7,000 languages spoken in the world today, linguists warn that between 50% and 90% could be extinct by the end of this century. A language is considered endangered when children are no longer learning it as their first language. At the current rate of loss, a language disappears on average roughly every two weeks.

The causes of language death are closely linked to social, economic, and political power. When speakers of a minority language face discrimination, economic disadvantage, or social marginalisation, they frequently shift to speaking the dominant language of the state or marketplace. This process — called language shift — is often experienced by communities as rational and pragmatic: speaking a dominant language offers access to education, employment, and mobility. The decision may be fully voluntary, yet the collective result is the loss of a language within one or two generations.

The consequences of language extinction are multiple. From an anthropological perspective, each language encodes a unique way of understanding the world. Languages vary enormously in their grammatical structures, vocabularies, and the distinctions they draw between concepts. The Yupik people of Alaska, for instance, have an extensive vocabulary for describing sea ice — distinctions that have no equivalent in English and which encode centuries of accumulated ecological knowledge. When such a language dies, this knowledge becomes inaccessible.

Linguists also argue that language diversity is intrinsically valuable — analogous to biodiversity. Just as the loss of a species represents an irreversible diminishment of the natural world, the extinction of a language represents an irreversible loss of human cultural heritage.

Efforts to revitalise endangered languages have met with mixed results. Welsh, once in severe decline, has experienced a substantial revival through immersive education programmes, official recognition, and media support including a Welsh-language television channel. In New Zealand, the Maori language has been promoted through kura kaupapa — Maori-medium schools — and achieved co-official status alongside English.

Hebrew is often cited as the most dramatic case of language revitalisation — the only example of a language that had ceased to be a spoken vernacular and was successfully restored as a living community language. Its revival in the late nineteenth and early twentieth centuries was tied to the Zionist movement and the establishment of the State of Israel.

Critics of language preservation efforts raise difficult questions. Is it ethical to require communities to maintain a language they no longer wish to use? What resources should be devoted to revitalisation when communities themselves are divided on its value? These questions have no universal answers, but they underline that language preservation is not simply a technical challenge — it is deeply bound up with questions of identity, autonomy, and cultural politics.`,
    questions: [
      {
        range: "27–31", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 27, text: "Linguists estimate that by the end of this century:", options: ["A. all languages will merge into one global language", "B. new languages will emerge to replace those lost", "C. between 50% and 90% of current languages could be extinct", "D. only a hundred languages will remain"] },
          { no: 28, text: "Language shift is described in the passage as:", options: ["A. always forced by governments", "B. often a rational choice driven by economic and social factors", "C. occurring only in remote communities", "D. impossible to reverse once started"] },
          { no: 29, text: "The example of the Yupik vocabulary for sea ice illustrates:", options: ["A. the complexity of Arctic navigation", "B. that English is insufficient for scientific purposes", "C. that endangered languages contain unique and irreplaceable knowledge", "D. that all languages have equivalent vocabularies"] },
          { no: 30, text: "Which language is described as the only one successfully revived after ceasing to be spoken?", options: ["A. Welsh", "B. Maori", "C. Hawaiian", "D. Hebrew"] },
          { no: 31, text: "Critics of language preservation argue that:", options: ["A. all languages should be allowed to die naturally", "B. the cost of preservation is always too high", "C. communities should not be required to maintain languages they no longer wish to use", "D. only large languages are worth preserving"] },
        ],
      },
      {
        range: "32–35", type: "fill",
        instruction: "Complete each sentence using NO MORE THAN TWO WORDS.",
        items: [
          { no: 32, text: "A language is endangered when children no longer learn it as their __________ language." },
          { no: 33, text: "Language shift occurs when speakers move to the __________ language for practical reasons." },
          { no: 34, text: "Welsh revitalisation was supported partly by a Welsh-language __________ channel." },
          { no: 35, text: "Kura kaupapa are Maori-__________ schools in New Zealand." },
        ],
      },
      {
        range: "36–40", type: "yng",
        instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
        items: [
          { no: 36, text: "A language is lost approximately every two weeks at the current rate." },
          { no: 37, text: "Language extinction is described as reversible with sufficient funding." },
          { no: 38, text: "The Maori language has achieved co-official status in New Zealand." },
          { no: 39, text: "All communities with endangered languages agree that revitalisation is desirable." },
          { no: 40, text: "The author believes language extinction raises important questions about identity and autonomy." },
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
export default function Variant7({ sessionId, token, user }) {
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
          <span className="topbar__variant">Variant 7</span>
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
                <p>The line graph below shows the percentage of workers who cycled to work in three European cities (Amsterdam, London, Copenhagen) between 2005 and 2020.</p>
                <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                <p className="writing-task__min"><strong>Write at least 150 words.</strong></p>
              </div>
              <div className="writing-task__image-wrap">
                <img src={WRITING_IMAGE} alt="Line graph: Cycling to work 2005–2020" className="writing-task__image" />
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
                  Some people think that the most important qualities for success in life are intelligence and academic qualifications. Others believe that personal qualities such as determination and communication skills are more important.<br /><br />
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
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Variant 7 · {new Date().toLocaleDateString()}</p>
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
