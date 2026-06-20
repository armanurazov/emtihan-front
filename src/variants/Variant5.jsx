// Variant5.jsx — Complete IELTS Test: Variant 5
// Includes the timer-ref fix so the writing timer reliably auto-submits.
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://emtihan-back-production.up.railway.app/api";
const AUTOSAVE_INTERVAL = 30_000;

const AUDIO_URLS = {
  1: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var5-listening-part1.mp3",
  2: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var5-listening-part2.mp3",
  3: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var5-listening-part3.mp3",
  4: "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/audio/var5-listening-part4.mp3",
};

const WRITING_IMAGE = "https://wasfkxcfwzycuavrhvgs.supabase.co/storage/v1/object/public/images/var-5.png";

const TIMERS = { listening: 40 * 60, reading: 60 * 60, writing: 60 * 60 };

// ─── Listening Data ───────────────────────────────────────────
const LISTENING_SECTIONS = [
  {
    part: 1,
    title: "Part 1 — Conversation",
    description: "You will hear a conversation between a letting agency employee and a person looking to rent a flat.",
    formTitle: "Cornerstone Lettings — Rental Enquiry Form",
    questions: [
      { no: 1,  type: "fill", label: "Applicant full name" },
      { no: 2,  type: "fill", label: "Current postcode" },
      { no: 3,  type: "fill", label: "Preferred move-in date" },
      { no: 4,  type: "fill", label: "Maximum monthly budget: £" },
      { no: 5,  type: "fill", label: "Preferred tube zone(s)" },
      { no: 6,  type: "fill", label: "Furnishing preference" },
      { no: 7,  type: "fill", label: "Essential appliance required" },
      { no: 8,  type: "fill", label: "Occupation" },
      { no: 9,  type: "fill", label: "Documents required: proof of employment and ________ months of bank statements" },
      { no: 10, type: "fill", label: "Minimum tenancy length" },
    ],
  },
  {
    part: 2,
    title: "Part 2 — Monologue",
    description: "You will hear a coordinator giving an introduction to volunteers at a community food bank.",
    questions: [
      { no: 11, type: "mcq", label: "Distribution sessions take place on:", options: ["A. Mondays and Wednesdays", "B. Tuesdays and Thursdays", "C. Thursdays and Fridays"] },
      { no: 12, type: "mcq", label: "Donations from supermarkets are accepted on:", options: ["A. Tuesday mornings", "B. Thursday afternoons", "C. Friday afternoons"] },
      { no: 13, type: "mcq", label: "Each household receives supplies for:", options: ["A. one week", "B. five days", "C. three days"] },
      { no: 14, type: "mcq", label: "Volunteers must NOT do which of the following?", options: ["A. Wear a blue tabard", "B. Ask clients about their personal circumstances", "C. Wash their hands before handling food"] },
      { no: 15, type: "mcq", label: "Senior volunteers are identified by:", options: ["A. a red badge", "B. a yellow tabard", "C. a name tag"] },
      { no: 16, type: "fill", label: "The food bank supports around ________ households per month" },
      { no: 17, type: "fill", label: "Volunteers in sorting check ________ on donated items" },
      { no: 18, type: "fill", label: "Volunteers must wear the ________ tabard provided" },
      { no: 19, type: "fill", label: "Volunteers should not eat or drink on the" },
      { no: 20, type: "fill", label: "Volunteers with concerns should speak to a senior volunteer or the" },
    ],
  },
  {
    part: 3,
    title: "Part 3 — Discussion",
    description: "You will hear two master's students, Yuki and Ben, discussing their dissertation proposal with their supervisor, Dr Harrington.",
    questions: [
      { no: 21, type: "mcq", label: "What is the main research question?", options: ["A. Whether mindfulness reduces student attainment gaps", "B. Whether mindfulness programmes reduce anxiety in primary school pupils", "C. Whether mindfulness affects teacher wellbeing"] },
      { no: 22, type: "mcq", label: "Why did they choose primary rather than secondary schools?", options: ["A. Secondary schools declined to participate", "B. The supervisor recommended it", "C. It provided a tighter research focus"] },
      { no: 23, type: "mcq", label: "The research design combines:", options: ["A. Only quantitative methods", "B. Only qualitative methods", "C. Both quantitative and qualitative methods"] },
      { no: 24, type: "mcq", label: "How long does each intervention session last?", options: ["A. 45 minutes", "B. 30 minutes", "C. 60 minutes"] },
      { no: 25, type: "mcq", label: "The control group consists of:", options: ["A. teachers in the four schools", "B. two schools not implementing the programme", "C. all pupils aged 8 to 11"] },
      { no: 26, type: "fill", label: "The supervisor's surname: Dr" },
      { no: 27, type: "fill", label: "The age range of pupils studied is ________ to ________ years old" },
      { no: 28, type: "fill", label: "The intervention runs for ________ weeks" },
      { no: 29, type: "fill", label: "Data collection is planned to start on the ________ of February" },
      { no: 30, type: "fill", label: "The main limitation identified is that teacher ________ introduces subjectivity" },
    ],
  },
  {
    part: 4,
    title: "Part 4 — Lecture",
    description: "You will hear a lecture on the history and evolution of vaccination.",
    questions: [
      { no: 31, type: "fill", label: "Vaccination works by stimulating the immune system to develop a ________ response" },
      { no: 32, type: "fill", label: "Variolation involved exposure to material from smallpox" },
      { no: 33, type: "fill", label: "Variolation was practised in China and the ________ Empire" },
      { no: 34, type: "fill", label: "Edward Jenner was an English" },
      { no: 35, type: "fill", label: "Jenner observed that milkmaids who had cowpox were immune to" },
      { no: 36, type: "fill", label: "The word \"vaccination\" comes from the Latin for" },
      { no: 37, type: "fill", label: "Louis Pasteur developed a vaccine for ________ and rabies, among others" },
      { no: 38, type: "fill", label: "The near-total elimination of polio was achieved through vaccines developed in the" },
      { no: 39, type: "fill", label: "mRNA vaccines were deployed at scale during the ________ pandemic" },
      { no: 40, type: "fill", label: "A challenge to vaccination programmes today is vaccine" },
    ],
  },
];

// ─── Reading Data ─────────────────────────────────────────────
const READING_PASSAGES = [
  {
    passage: 1,
    title: "Migration: Patterns, Causes, and Consequences",
    text: `A
Migration — the movement of people from one place to another — is among the most fundamental processes shaping human societies. While often portrayed as a modern phenomenon driven by globalisation, migration has occurred throughout human history. The movement of populations has shaped languages, cultures, economies, and political boundaries across every continent.

B
Scholars typically distinguish between two broad categories of migration: voluntary and forced. Voluntary migrants move by choice, often in pursuit of economic opportunities, education, or improved living conditions. Forced migrants — including refugees and internally displaced persons — flee conflict, persecution, or environmental disaster. This distinction matters for policy: forced migrants have particular legal protections under international law, including the 1951 Refugee Convention.

C
Economic migration is by far the most common form of voluntary movement. Wage differentials between countries create powerful incentives for workers to move from lower-income to higher-income nations. Research consistently shows that migrants who move from lower-income to higher-income countries tend to experience significant improvements in earnings. However, the economic consequences for sending countries are more complex. While remittances — money sent home by migrant workers — can significantly boost household incomes in origin communities, the departure of skilled workers can create shortages in key sectors.

D
Urbanisation represents a form of internal migration with profound consequences. Over the past century, the world has undergone a dramatic shift from predominantly rural to predominantly urban societies. The United Nations estimates that by 2050, nearly 70% of the global population will live in cities. Rapid urbanisation brings economic dynamism but also challenges: overcrowding, housing shortages, strained infrastructure, and the growth of informal settlements.

E
Environmental factors are playing an increasingly important role in driving migration. Prolonged drought, rising sea levels, and extreme weather events are displacing growing numbers of people. The World Bank estimates that without significant climate action, over 200 million people could be internally displaced by environmental factors by 2050. Yet the legal framework for recognising environmentally displaced people remains underdeveloped.

F
The consequences of migration for receiving countries are frequently debated. Economically, migrants often fill labour shortages and contribute to tax revenues. Studies in several high-income countries have found that migrants as a group are net contributors to public finances over their lifetimes. However, distributional effects can be uneven: particular communities or sectors may experience wage pressure or strain on local services, even where the aggregate national impact is positive.

G
Attitudes towards migration are shaped by a complex mix of economic concerns, cultural factors, and political narratives. Research suggests that people's attitudes are rarely determined by economic self-interest alone. Familiarity with migrants and direct personal experience of migration have been shown to reduce hostility, while political messaging that emphasises threat and competition tends to increase it.`,
    questions: [
      {
        range: "1–6", type: "tf",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { no: 1, text: "Migration has occurred throughout human history, not only in the modern era." },
          { no: 2, text: "Forced migrants are protected by the 1951 Refugee Convention." },
          { no: 3, text: "The majority of migrants move for environmental reasons." },
          { no: 4, text: "By 2050, nearly 70% of the global population is expected to live in cities." },
          { no: 5, text: "Studies show migrants are always a net financial burden on receiving countries." },
          { no: 6, text: "Personal contact with migrants has been shown to reduce hostile attitudes." },
        ],
      },
      {
        range: "7–10", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 7,  text: "Remittances are described as:", options: ["A. a form of forced migration", "B. money sent home by migrant workers", "C. government payments to refugees", "D. financial penalties for illegal migration"] },
          { no: 8,  text: "The \"brain drain\" problem refers to:", options: ["A. the overcrowding of urban hospitals", "B. the difficulty of adapting to a new culture", "C. the loss of skilled workers from sending countries", "D. the failure of migrant education systems"] },
          { no: 9,  text: "According to paragraph F, the overall economic effect of migration on receiving countries:", options: ["A. is always strongly negative", "B. varies, with national benefits sometimes unevenly distributed", "C. is purely positive with no drawbacks", "D. is impossible to measure"] },
          { no: 10, text: "Research on attitudes to migration suggests:", options: ["A. economic self-interest is the main determinant of attitudes", "B. all negative attitudes are economically motivated", "C. direct contact with migrants can reduce hostility", "D. political messaging always increases positive attitudes"] },
        ],
      },
      {
        range: "11–13", type: "fill",
        instruction: "Complete the sentences using NO MORE THAN TWO WORDS.",
        items: [
          { no: 11, text: "Voluntary migrants move by __________, while forced migrants flee conflict or persecution." },
          { no: 12, text: "The World Bank estimates over 200 million people could be displaced by __________ factors by 2050." },
          { no: 13, text: "Research shows that wage __________ between countries are a major driver of economic migration." },
        ],
      },
    ],
  },
  {
    passage: 2,
    title: "The Placebo Effect: More Than Just Imagination",
    text: `A
The placebo effect — the measurable, genuine improvement in a patient's condition following treatment with an inert substance or procedure — has long been regarded with scientific suspicion. Critics dismissed it as self-deception or wishful thinking. However, decades of research have revealed that the placebo effect is a real, complex, and neurobiologically grounded phenomenon with important implications for medicine and beyond.

B
Early investigations of the placebo effect focused on pain. Studies in the mid-twentieth century showed that patients given sugar pills described reductions in pain comparable to those receiving active analgesics. Crucially, subsequent research demonstrated that the placebo response involves the actual release of endorphins — the body's natural pain-relieving chemicals. When researchers blocked endorphin receptors with a drug called naloxone, placebo-induced pain relief was significantly reduced, confirming that the response was physiological, not merely psychological.

C
The strength of the placebo effect appears to be influenced by multiple contextual factors. Research has found that larger pills tend to produce stronger placebo effects than smaller ones, that injections generally outperform tablets, and that branded medications are often perceived as more effective than identical generic versions. The colour of a pill can also matter: blue pills have been found more effective for sedation, while red or orange are associated with stimulant effects in some studies.

D
Patient-practitioner interactions also play a powerful role. Warm, confident consultations tend to enhance placebo responses. A landmark study by physician Ted Kaptchuk and colleagues showed that patients with irritable bowel syndrome who were given open-label placebos — told explicitly that they were receiving placebos — showed significant improvement compared to those receiving no treatment. This finding challenges the assumption that deception is necessary for the placebo effect to work.

E
The opposite of the placebo effect — the nocebo effect — describes negative health outcomes resulting from negative expectations. Patients warned of potential side effects often experience those effects even when taking inert substances. In some documented cases, patients given fake diagnoses of serious illness have developed corresponding physical symptoms. The nocebo effect carries significant ethical implications for medical communication.

F
Understanding the mechanisms underlying placebo and nocebo effects has potential applications in clinical practice. Designing treatment environments, consultations, and communication strategies to maximise positive expectations — without deception — could enhance the effectiveness of active treatments. This approach is sometimes called contextual healing or care optimisation.

G
Some critics worry that emphasising placebo effects could encourage unqualified practitioners to offer inert treatments while implying they possess active ingredients. Rigorous regulation of health claims and transparency in treatment are essential safeguards. Nevertheless, the placebo effect reminds medicine that the human mind and body are deeply interconnected — and that the way treatment is delivered matters as much as what is delivered.`,
    questions: [
      {
        range: "14–18", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 14, text: "What evidence confirmed that the placebo pain response was physiological?", options: ["A. Patients reported feeling better after taking sugar pills", "B. Brain scans showed increased activity", "C. Blocking endorphin receptors reduced placebo-induced pain relief", "D. Doctors observed faster recovery rates"] },
          { no: 15, text: "Which of the following influences the strength of a placebo effect?", options: ["A. The patient's nationality", "B. The size of the pill", "C. The length of the prescription", "D. The weather during the consultation"] },
          { no: 16, text: "The open-label placebo study described in paragraph D showed that:", options: ["A. placebos only work when patients are deceived", "B. warmth in consultations always eliminates pain", "C. patients who knew they were receiving placebos still improved", "D. IBS cannot be treated effectively"] },
          { no: 17, text: "The nocebo effect refers to:", options: ["A. enhanced recovery due to positive expectations", "B. improvements caused by warm patient-practitioner relationships", "C. harmful outcomes resulting from negative expectations", "D. the failure of conventional drugs in certain patients"] },
          { no: 18, text: "The author's overall attitude to the placebo effect is:", options: ["A. it should be rejected as unscientific", "B. it is a real, complex phenomenon with medical relevance", "C. it is only relevant to pain management", "D. it proves that most drugs are unnecessary"] },
        ],
      },
      {
        range: "19–23", type: "fill",
        instruction: "Complete the notes using NO MORE THAN TWO WORDS.",
        items: [
          { no: 19, text: "The placebo effect involves the release of __________ in the brain." },
          { no: 20, text: "Blue pills have been found effective as __________ in some studies." },
          { no: 21, text: "Kaptchuk's study involved patients with irritable __________ syndrome." },
          { no: 22, text: "The nocebo effect produces negative outcomes due to negative __________." },
          { no: 23, text: "Maximising positive expectations without deception is sometimes called __________ healing." },
        ],
      },
      {
        range: "24–26", type: "paragraph",
        instruction: "Which paragraph (A–G) contains the following information? Write the correct paragraph letter.",
        paragraphNote: "(Paragraphs are labelled A–G from top to bottom of the passage.)",
        items: [
          { no: 24, text: "Concerns that placebo research could be misused by unqualified practitioners" },
          { no: 25, text: "The role of how a consultation is conducted on placebo outcomes" },
          { no: 26, text: "Evidence that the placebo response is biological rather than purely psychological" },
        ],
      },
    ],
  },
  {
    passage: 3,
    title: "The Economics of Happiness",
    text: `For most of human history, economic progress was equated with improved wellbeing. More income meant more food, better shelter, and longer life expectancy. The logic seemed self-evident: richer is better. But from the 1970s onwards, researchers began to question whether this straightforward equation holds as countries grow wealthy.

The "Easterlin Paradox," named after economist Richard Easterlin, captured an uncomfortable finding. Easterlin's data showed that within a country, richer people tend to report being happier than poorer ones. Yet across time, as countries became wealthier, average happiness levels did not rise correspondingly. At the national level, beyond a certain income threshold, additional wealth seemed to deliver diminishing returns to wellbeing.

Several explanations have been proposed. One influential idea is the concept of the "hedonic treadmill" — the tendency for humans to return to a roughly stable level of happiness after positive or negative life events. Winning the lottery or getting a promotion produces a temporary surge in reported happiness, but people tend to adapt and return to their baseline level. The treadmill keeps moving but progress feels elusive.

Social comparison is another factor. How happy people feel is influenced not just by their absolute income, but by their income relative to others around them. In increasingly unequal societies, even rising average incomes may leave many people feeling relatively worse off. Research has found that measures of income inequality, such as the Gini coefficient, are negatively correlated with national happiness scores in many countries.

Beyond a basic income threshold, the factors most strongly associated with reported happiness are social relationships, good health, meaningful work, a sense of autonomy, and trust in institutions. These findings have prompted some governments to move beyond GDP as a primary measure of national progress. Bhutan famously adopted "Gross National Happiness" as a policy framework. The OECD has developed a Better Life Index that measures wellbeing across multiple dimensions.

Critics of happiness economics raise methodological concerns. Self-reported wellbeing surveys may not accurately capture life satisfaction — people in different cultures interpret and express happiness differently, making cross-national comparisons problematic. Others argue that economic growth remains essential because it funds the healthcare, infrastructure, and public services that underpin wellbeing.

Despite these debates, happiness economics has shifted the conversation in policymaking. An increasing number of governments monitor wellbeing alongside traditional economic indicators, recognising that the ultimate goal of economic activity is not growth for its own sake, but the improvement of human lives.`,
    questions: [
      {
        range: "27–31", type: "mcq4",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          { no: 27, text: "The Easterlin Paradox found that:", options: ["A. richer countries are always happier", "B. happiness rises consistently with national income", "C. beyond a threshold, rising national income does not necessarily increase happiness", "D. happiness is not measurable"] },
          { no: 28, text: "The \"hedonic treadmill\" refers to:", options: ["A. the difficulty of increasing physical fitness", "B. the tendency to return to a stable happiness baseline after life events", "C. the link between exercise and happiness", "D. the positive effects of economic growth"] },
          { no: 29, text: "Social comparison affects happiness because:", options: ["A. people only care about their absolute income", "B. happiness depends partly on income relative to others", "C. wealthy people are always less happy than poor people", "D. inequality always increases national happiness"] },
          { no: 30, text: "Beyond a basic income level, which factor is most strongly linked to happiness?", options: ["A. Owning property", "B. National economic growth", "C. Social relationships and health", "D. Level of education"] },
          { no: 31, text: "One criticism of happiness surveys is that:", options: ["A. they are never used by governments", "B. people in different cultures may interpret happiness differently", "C. they always overestimate wellbeing", "D. they cannot be conducted in wealthy countries"] },
        ],
      },
      {
        range: "32–35", type: "fill",
        instruction: "Complete each sentence using NO MORE THAN TWO WORDS.",
        items: [
          { no: 32, text: "The Easterlin Paradox is named after economist Richard __________." },
          { no: 33, text: "The Gini coefficient is a measure of income __________." },
          { no: 34, text: "Bhutan adopted __________ National Happiness as a policy framework." },
          { no: 35, text: "The OECD's Better Life Index measures wellbeing across multiple __________." },
        ],
      },
      {
        range: "36–40", type: "yng",
        instruction: "Do the following statements agree with the views of the writer? Write YES, NO or NOT GIVEN.",
        items: [
          { no: 36, text: "Within a country, wealthier people tend to report higher happiness than poorer people." },
          { no: 37, text: "All countries that monitor wellbeing have abandoned GDP as a measure." },
          { no: 38, text: "Trust in institutions is one factor associated with greater happiness." },
          { no: 39, text: "Happiness economics has had no influence on government policy." },
          { no: 40, text: "Some critics argue that economic growth is still important because it funds public services." },
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
export default function Variant5({ sessionId, token, user }) {
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
          <span className="topbar__variant">Variant 5</span>
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
                <p>The bar chart below shows the percentage of households with access to high-speed broadband in five countries (Germany, Brazil, India, USA, Japan) in 2023.</p>
                <p>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                <p className="writing-task__min"><strong>Write at least 150 words.</strong></p>
              </div>
              <div className="writing-task__image-wrap">
                <img src={WRITING_IMAGE} alt="Bar chart: Broadband access by country, 2023" className="writing-task__image" />
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
                  Some people argue that zoos play an important role in wildlife conservation, while others believe that keeping animals in captivity is cruel and should be banned.<br /><br />
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
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Variant 5 · {new Date().toLocaleDateString()}</p>
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
