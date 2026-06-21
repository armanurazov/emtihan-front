// Variant6.jsx — Complete IELTS Test: Variant 6
// Includes the timer-ref fix so the writing timer reliably auto-submits.
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";
const AUTOSAVE_INTERVAL = 30_000;

const AUDIO_URLS = {
  1: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var6-listening-part1.mp3",
  2: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var6-listening-part2.mp3",
  3: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var6-listening-part3.mp3",
  4: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var6-listening-part4.mp3",
};

const WRITING_IMAGE = "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/images/var-6.png";

const TIMERS = { listening: 40 * 60, reading: 60 * 60, writing: 60 * 60 };

// ─── Listening Data ───────────────────────────────────────────
const LISTENING_SECTIONS = [
  {
    part: 1,
    title: "Part 1 — Conversation",
    description: "You will hear a conversation between a customer services advisor at a mobile phone company and a customer with a billing complaint.",
    formTitle: "TeleLink — Complaint Record",
    questions: [
      { no: 1,  type: "fill", label: "Customer full name" },
      { no: 2,  type: "fill", label: "Account telephone number" },
      { no: 3,  type: "fill", label: "Date of birth (security check)" },
      { no: 4,  type: "fill", label: "First line of address" },
      { no: 5,  type: "fill", label: "Nature of complaint: unexpected ________ charge" },
      { no: 6,  type: "fill", label: "Amount charged incorrectly: £" },
      { no: 7,  type: "fill", label: "Customer's stated location during the period" },
      { no: 8,  type: "fill", label: "Resolution offered: ________ to account" },
      { no: 9,  type: "fill", label: "Expected resolution timeframe: ________ working days" },
      { no: 10, type: "fill", label: "Customer email address" },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Monologue",
    description: "You will hear a health professional giving a talk to a community group about preventive health checks.",
    questions: [
      { no: 11, type: "mcq", label: "Who is the NHS Health Check programme designed for?", options: ["A. Adults of all ages", "B. Adults aged 40 to 74", "C. Adults over 65 only"] },
      { no: 12, type: "mcq", label: "Cervical screening is offered every three years for women aged:", options: ["A. 25 to 64", "B. 25 to 49", "C. 50 to 64"] },
      { no: 13, type: "mcq", label: "Bowel cancer screening kits are:", options: ["A. collected from the GP surgery", "B. sent through the post automatically", "C. only available at hospital"] },
      { no: 14, type: "mcq", label: "The smoking cessation service is described as:", options: ["A. only available to heavy smokers", "B. free, with a high success rate", "C. requiring a fee"] },
      { no: 15, type: "mcq", label: "Walk-in triage appointments are available:", options: ["A. every weekday morning", "B. on Monday and Wednesday mornings", "C. on Tuesday and Thursday mornings"] },
      { no: 16, type: "fill", label: "Early detection of health problems ________ treatment outcomes" },
      { no: 17, type: "fill", label: "The NHS Health Check takes approximately ________ minutes" },
      { no: 18, type: "fill", label: "Cervical screening for women aged 50-64 is every ________ years" },
      { no: 19, type: "fill", label: "Smoking cessation advisors can be accessed alongside ________ replacement therapy" },
      { no: 20, type: "fill", label: "Appointments can also be booked through the online patient" },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Discussion",
    description: "You will hear two students, Clara and Deshi, discussing their final-year architecture project with their tutor, Professor Walsh.",
    questions: [
      { no: 21, type: "mcq", label: "What stage of the project are Clara and Deshi at?", options: ["A. Site purchase", "B. Construction", "C. Developing conceptual designs"] },
      { no: 22, type: "mcq", label: "What is their primary design principle?", options: ["A. Maximum use of glass", "B. Passive energy design", "C. Underground construction"] },
      { no: 23, type: "mcq", label: "What material is proposed for the building's structure?", options: ["A. Steel", "B. Reinforced concrete", "C. Cross-laminated timber"] },
      { no: 24, type: "mcq", label: "What is the total footprint of the proposed building?", options: ["A. 800 square metres over one floor", "B. 1,200 square metres over two floors", "C. 2,400 square metres over three floors"] },
      { no: 25, type: "mcq", label: "The client presentation is on:", options: ["A. 12th March", "B. 22nd March", "C. 22nd April"] },
      { no: 26, type: "fill", label: "The tutor's surname: Professor" },
      { no: 27, type: "fill", label: "The facade material proposed is recycled" },
      { no: 28, type: "fill", label: "The model will be made at a scale of" },
      { no: 29, type: "fill", label: "Accessibility complies with Part ________ of the building regulations" },
      { no: 30, type: "fill", label: "The presentation will include a diagram showing airflow and ________ analysis" },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Lecture",
    description: "You will hear a lecture on the psychology of persuasion and influence.",
    questions: [
      { no: 31, type: "fill", label: "Cialdini's influential book was published in" },
      { no: 32, type: "fill", label: "The principle of ________ reflects our tendency to return favours" },
      { no: 33, type: "fill", label: "Free samples given by marketers exploit the principle of" },
      { no: 34, type: "fill", label: "The principle of commitment exploits people's desire to appear" },
      { no: 35, type: "fill", label: "Social proof involves looking to ________ for guidance when uncertain" },
      { no: 36, type: "fill", label: "Reviews and ________ are examples of social proof in marketing" },
      { no: 37, type: "fill", label: "Authority is enhanced by uniforms, titles, and" },
      { no: 38, type: "fill", label: "Cialdini notes that authority can be ________ and is therefore exploitable" },
      { no: 39, type: "fill", label: "Liking increases when people perceive ________ with the person influencing them" },
      { no: 40, type: "fill", label: "The principle of scarcity works by making things appear ________ in availability" },
    ],
  },
];

// ─── Reading Data ─────────────────────────────────────────────
const READING_PASSAGES = [
  {
    passage: 1,
    title: "The Development of Writing Systems",
    text: `A
Writing is among the most significant technologies ever devised by human beings. It enables the transmission of knowledge across time and space, the administration of complex societies, and the preservation of literary and cultural heritage. Yet writing systems are relatively recent in the long sweep of human history — emerging only around five thousand years ago, after hundreds of thousands of years of spoken language.

B
The earliest known writing system developed in Mesopotamia — the region of modern-day Iraq — around 3200 BCE. Known as cuneiform, it was initially used by the Sumerian people for administrative purposes: recording grain quantities, livestock counts, and trade transactions. Early cuneiform signs were pictographs — simplified pictures representing objects. Over centuries, these evolved into more abstract symbols representing sounds and concepts.

C
Independently, the ancient Egyptians developed hieroglyphics around the same period. Egyptian hieroglyphs combined logograms — signs representing whole words or concepts — with phonetic signs representing sounds. This system coexisted with two more cursive scripts, hieratic and later demotic, used for everyday administrative and personal writing. The decipherment of the Rosetta Stone in 1822 by Jean-Francois Champollion was the key breakthrough in understanding hieroglyphics.

D
A third early writing system emerged in the Indus Valley civilisation, roughly contemporaneous with cuneiform and hieroglyphics. The Indus script, found on seals and pottery, remains undeciphered — one of the great unsolved mysteries of ancient history.

E
Chinese writing, which emerged around 1200 BCE, is the only ancient writing system that has survived continuously to the present day in a recognisable form. Modern written Chinese retains thousands of characters whose origins can be traced to ancient pictographic and ideographic symbols. The longevity of Chinese writing reflects in part the cultural and political continuity of Chinese civilisation.

F
Alphabets — systems in which individual signs represent individual sounds — represent a major innovation in writing technology. The Phoenician alphabet, developed around 1050 BCE, is considered the ancestor of most modern alphabets, including Greek, Latin, Arabic, and Hebrew. The simplicity of alphabetic systems made literacy more accessible, since a relatively small number of signs could encode any word in the language.

G
Today, most of the world's written communication uses one of a handful of scripts: the Latin alphabet, Arabic script, Devanagari (used for Hindi and related languages), Chinese characters, and Cyrillic. Despite the dominance of digital communication, writing systems remain central to human society — evolving in form, but undiminished in importance.`,
    questions: [
      {
        range: "1–6", type: "tf",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { no: 1, text: "Writing systems emerged approximately five thousand years ago." },
          { no: 2, text: "Early cuneiform was used mainly for literary purposes." },
          { no: 3, text: "Hieroglyphics combined logograms with phonetic signs." },
          { no: 4, text: "The Indus Valley script has been successfully deciphered." },
          { no: 5, text: "Chinese writing is the only ancient writing system still in continuous use." },
          { no: 6, text: "The Phoenician alphabet developed around 1050 BCE." },
        ],
      },
      {
        range: "7–10", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 7,  text: "Early cuneiform signs were:", options: ["A. based on the Greek alphabet", "B. abstract symbols with no visual reference", "C. simplified pictures representing objects", "D. derived from Egyptian hieroglyphs"] },
          { no: 8,  text: "The Rosetta Stone was important because:", options: ["A. it contained the first known cuneiform inscription", "B. it was found in Mesopotamia", "C. it enabled the decipherment of hieroglyphics", "D. it proved that Egyptian and Sumerian writing were related"] },
          { no: 9,  text: "Why are alphabets considered a significant innovation?", options: ["A. They use more signs than other writing systems", "B. They are visually attractive", "C. A small set of signs can represent any word", "D. They were developed by the Chinese"] },
          { no: 10, text: "According to paragraph G, which of the following is NOT listed as a dominant modern script?", options: ["A. Latin alphabet", "B. Cuneiform", "C. Arabic script", "D. Cyrillic"] },
        ],
      },
      {
        range: "11–13", type: "fill",
        instruction: "Complete the sentences using NO MORE THAN TWO WORDS.",
        items: [
          { no: 11, text: "The Phoenician alphabet is considered the __________ of most modern alphabets." },
          { no: 12, text: "Champollion's decipherment of the Rosetta Stone was the breakthrough in understanding __________." },
          { no: 13, text: "Chinese characters can be traced to ancient __________ and ideographic symbols." },
        ],
      },
    ],
  },
  {
    passage: 2,
    title: "Urban Heat Islands: Causes and Solutions",
    text: `A
The urban heat island (UHI) effect refers to the phenomenon whereby cities and urban areas experience significantly higher temperatures than the surrounding rural landscape. The temperature differential can range from one to several degrees Celsius and is most pronounced during night-time and in calm, cloudless conditions. As urbanisation accelerates globally, the UHI effect is increasingly recognised as a significant public health and environmental challenge.

B
The primary cause of urban heat islands is the replacement of natural land cover — vegetation, soil, and water bodies — with built surfaces such as concrete, asphalt, and brick. Natural surfaces absorb solar radiation and release it through evapotranspiration — the process by which plants release water vapour — which has a cooling effect. Built surfaces, by contrast, absorb heat rapidly and release it slowly, raising ambient temperatures. Dark surfaces such as asphalt are particularly effective at absorbing heat.

C
Urbanisation also reduces the presence of vegetation, which would otherwise provide shade and cooling through transpiration. The geometric structure of cities — tall buildings in close proximity — can trap longwave radiation emitted by buildings and roads, reducing heat loss and elevating temperatures. This "canyon effect" is particularly pronounced in densely built city centres with narrow streets.

D
Human activities contribute additional heat. Vehicle exhaust, air conditioning systems, industrial processes, and even human body heat collectively generate substantial quantities of waste heat in urban areas. In some dense cities, this anthropogenic heat can be comparable in magnitude to the heat absorbed from solar radiation.

E
The consequences of the UHI effect are significant. During heatwaves, elevated urban temperatures increase the risk of heat-related illness and mortality, particularly among vulnerable populations including the elderly, young children, and those with pre-existing medical conditions. The 2003 European heatwave, which killed an estimated 70,000 people, was significantly worsened in urban areas. Higher temperatures also increase demand for cooling energy, creating a feedback loop.

F
Several strategies can mitigate urban heat islands. Increasing urban vegetation through parks, street trees, green roofs, and vertical gardens reduces surface temperatures through shade and evapotranspiration. Replacing dark pavements and roofs with lighter, reflective materials — known as "cool surfaces" — reduces solar heat absorption. Permeable pavements allow water to infiltrate the soil, supporting soil moisture and vegetation.

G
Urban planning plays a crucial role. Designing cities to maximise airflow — through appropriate building height ratios, orientation, and spacing — can reduce the canyon effect. Incorporating water features such as fountains and ponds adds evaporative cooling. Some cities have implemented urban heat island reduction strategies as formal policy — Singapore, for example, mandates green roofs on new developments and has maintained its urban tree canopy through decades of proactive planting.`,
    questions: [
      {
        range: "14–18", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 14, text: "The UHI effect is most pronounced:", options: ["A. in the middle of the day", "B. during windy, rainy conditions", "C. during night-time in calm, cloudless conditions", "D. in rural areas"] },
          { no: 15, text: "Evapotranspiration in natural surfaces has a:", options: ["A. warming effect", "B. neutral effect on temperature", "C. cooling effect", "D. variable effect depending on the season"] },
          { no: 16, text: "The \"canyon effect\" occurs because:", options: ["A. cities are built near rivers", "B. buildings trap radiation and reduce heat loss", "C. asphalt reflects solar radiation upwards", "D. wind speeds increase between tall buildings"] },
          { no: 17, text: "Which group is described as particularly vulnerable during heatwaves?", options: ["A. Young adults", "B. Athletes", "C. Elderly people, young children, and those with pre-existing conditions", "D. Urban planners"] },
          { no: 18, text: "Cool surfaces are defined in the passage as:", options: ["A. surfaces near water", "B. surfaces with high thermal mass", "C. surfaces that absorb more heat at night", "D. lighter, reflective materials that reduce solar heat absorption"] },
        ],
      },
      {
        range: "19–23", type: "fill",
        instruction: "Complete the notes using NO MORE THAN TWO WORDS.",
        items: [
          { no: 19, text: "Built surfaces such as concrete absorb heat and release it __________." },
          { no: 20, text: "The canyon effect is worse in cities with __________ streets." },
          { no: 21, text: "Vehicle exhaust and air conditioning generate __________ heat in cities." },
          { no: 22, text: "Green __________ on buildings can reduce surface temperatures." },
          { no: 23, text: "Permeable pavements allow water to __________ the soil." },
        ],
      },
      {
        range: "24–26", type: "paragraph",
        instruction: "Which paragraph (A–G) contains the following information? Write the correct paragraph letter.",
        paragraphNote: "(Paragraphs are labelled A–G from top to bottom of the passage.)",
        items: [
          { no: 24, text: "A description of how human activities add to urban heat" },
          { no: 25, text: "Specific strategies cities have implemented to address the UHI effect" },
          { no: 26, text: "The health consequences of the UHI effect during extreme weather" },
        ],
      },
    ],
  },
  {
    passage: 3,
    title: "The Ethics and Practice of Animal Testing",
    text: `Animal testing — the use of non-human animals in experiments to assess the safety and efficacy of medicines, cosmetics, and other substances — remains one of the most contentious issues in science and ethics. Supporters argue it is essential to medical progress; opponents contend it is morally indefensible and scientifically flawed.

The scale of animal testing globally is substantial. Estimates suggest that between 100 and 200 million animals are used in research worldwide each year, including mice, rats, rabbits, fish, and primates. The vast majority are used in biomedical research — investigating disease mechanisms, developing treatments, and testing the safety of pharmaceutical compounds before human trials.

The scientific case for animal testing rests on biological similarity. Humans and other mammals share many fundamental physiological and genetic characteristics. Mice, for example, share approximately 85% of protein-coding genes with humans. This makes them useful models for studying human disease. The development of vaccines, antibiotics, cancer treatments, and surgical procedures have all benefited from animal experimentation.

Critics, however, challenge both the ethical basis and the predictive value of animal models. Ethically, they argue that animals are sentient beings capable of suffering, and that causing them harm for human benefit is difficult to justify, particularly when the benefits are uncertain. Philosophically, the utilitarian framework that underlies most scientific justification for animal testing assumes that the suffering of animals can be outweighed by benefits to humans — a premise critics dispute.

On scientific grounds, critics point to the high rate of failure in translating animal model results to humans. Many compounds that appear safe and effective in animals prove harmful or ineffective in human trials. The biological differences between species — in metabolism, immune function, and disease presentation — can be significant. High-profile cases, such as the TGN1412 clinical trial disaster of 2006, in which a drug tested safely in monkeys caused life-threatening reactions in human volunteers, illustrate the limitations.

The regulatory framework governing animal testing is guided by the "3Rs" principle, developed by British scientists Russell and Burch in 1959: Replace (find alternatives where possible), Reduce (use the minimum number of animals), and Refine (improve methods to minimise suffering). Most countries with significant research sectors require demonstration that 3Rs principles have been applied before approving research protocols.

Alternative methods are advancing. In vitro testing using cell cultures, organ-on-a-chip technology, computer modelling, and organoids — miniature three-dimensional tissue models — are increasingly capable of replicating aspects of human biology. The European Union has already banned animal testing for cosmetics, and several other jurisdictions are following.

The debate is unlikely to be resolved soon. Most scientists agree that animal testing has contributed significantly to medical progress, while also acknowledging that its limitations and ethical costs are real. The practical challenge is to develop alternatives that are scientifically rigorous enough to replace animal models across the full range of biomedical research.`,
    questions: [
      {
        range: "27–31", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 27, text: "The primary use of animals in research is:", options: ["A. testing cosmetics", "B. biomedical research", "C. training veterinary students", "D. environmental studies"] },
          { no: 28, text: "Critics argue that animal testing has limited scientific value because:", options: ["A. animals recover too quickly from experiments", "B. animals cannot be given accurate doses", "C. results from animal models often do not translate accurately to humans", "D. mice have too few genes in common with humans"] },
          { no: 29, text: "The TGN1412 case is used in the passage to illustrate:", options: ["A. the success of primate testing", "B. the limitations of animal models for predicting human reactions", "C. the importance of regulatory frameworks", "D. the ethics of using primates"] },
          { no: 30, text: "The 3Rs principle includes which of the following?", options: ["A. Reject, Revisit, Revise", "B. Replace, Reduce, Refine", "C. Research, Report, Regulate", "D. Restrict, Review, Replace"] },
          { no: 31, text: "Which technology does the passage describe as increasingly capable of replicating human biology?", options: ["A. Animal cloning", "B. X-ray imaging", "C. Organ-on-a-chip and organoids", "D. Robotic surgery"] },
        ],
      },
      {
        range: "32–35", type: "fill",
        instruction: "Complete each sentence using NO MORE THAN TWO WORDS.",
        items: [
          { no: 32, text: "Mice share approximately 85% of __________ genes with humans." },
          { no: 33, text: "The 3Rs principle was developed by British scientists Russell and __________." },
          { no: 34, text: "The EU has banned animal testing specifically for __________." },
          { no: 35, text: "Organoids are miniature three-dimensional __________ models." },
        ],
      },
      {
        range: "36–40", type: "yng",
        instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
        items: [
          { no: 36, text: "Between 100 and 200 million animals are used globally in research each year." },
          { no: 37, text: "All countries have fully implemented the 3Rs principle." },
          { no: 38, text: "High failure rates in translating animal results to humans are acknowledged by critics." },
          { no: 39, text: "In vitro testing using cell cultures is advancing as an alternative to animal models." },
          { no: 40, text: "The author believes animal testing has contributed to medical progress despite its limitations." },
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
export default function Variant6({ sessionId, token, user }) {
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
          <span className="topbar__variant">Variant 6</span>
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
                <p>The diagram below shows the process by which used aluminium cans are recycled to produce new cans.</p>
                <p>Summarise the information by selecting and reporting the main features.</p>
                <p className="writing-task__min"><strong>Write at least 150 words.</strong></p>
              </div>
              <div className="writing-task__image-wrap">
                <img src={WRITING_IMAGE} alt="Process diagram: Aluminium can recycling" className="writing-task__image" />
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
                  In some countries, young people are choosing to have children later in life or not at all.<br /><br />
                  What are the reasons for this trend, and what are the potential consequences for society?
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
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Variant 6 · {new Date().toLocaleDateString()}</p>
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
