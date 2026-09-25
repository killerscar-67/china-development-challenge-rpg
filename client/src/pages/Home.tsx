import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Crown,
  Factory,
  Flag,
  Globe2,
  Lightbulb,
  LockKeyhole,
  Map,
  Menu,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Timer,
  Trophy,
  Users,
  Wheat,
  X,
  Zap,
} from "lucide-react";

type Phase = "title" | "roles" | "rural" | "think" | "reforms" | "challenge" | "final" | "exit" | "results";
type ReformKey = "A" | "B" | "C" | "D";

type LogEntry = {
  label: string;
  text: string;
  tone?: "gold" | "red" | "green" | "muted";
};

const roleOptions = [
  { name: "Team Leader", icon: Crown, desc: "Keeps the team moving and makes sure every voice is heard." },
  { name: "Economic Adviser", icon: Target, desc: "Analyses the problem and tests the logic of each decision." },
  { name: "People's Representative", icon: Users, desc: "Tracks how reforms change ordinary people's lives." },
  { name: "Recorder", icon: Send, desc: "Captures the team's choices, reasons, and evidence." },
  { name: "Spokesperson", icon: Flag, desc: "Defends the team's strategy when the room turns to you." },
];

const reforms: Record<ReformKey, { title: string; short: string; icon: typeof Wheat; accent: string; effect: string; brief: string }> = {
  A: {
    title: "Rural Reform",
    short: "Household responsibility",
    icon: Wheat,
    accent: "#f2b84b",
    effect: "Effort and household income become more closely connected.",
    brief: "Families provide the required crop quota, then keep or sell surplus output.",
  },
  B: {
    title: "Private Enterprises",
    short: "Room to build and invest",
    icon: Store,
    accent: "#e66b54",
    effect: "Citizens gain more space to invest, operate businesses, and create jobs.",
    brief: "Enterprises are invested in and operated by people in the non-governmental sector.",
  },
  C: {
    title: "SOE Reform",
    short: "Performance and operation",
    icon: Factory,
    accent: "#6e8fb6",
    effect: "State-owned enterprises are pushed toward better operation and performance.",
    brief: "Reform responds to fixed salaries, weak incentives, and limited innovation.",
  },
  D: {
    title: "Opening-up",
    short: "Connect with the world",
    icon: Globe2,
    accent: "#72a58b",
    effect: "External economic connections open channels for trade, investment, and technology.",
    brief: "The economy becomes more connected with other economies beyond China's borders.",
  },
};

const developmentChallenges: Array<{
  title: string;
  eyebrow: string;
  prompt: string;
  answer: ReformKey;
  evidence: string;
}> = [
  {
    title: "Farmers' Motivation",
    eyebrow: "CHALLENGE 01 / RURAL ECONOMY",
    prompt: "If a family works harder and produces more, it wants the family to benefit from the extra effort.",
    answer: "A",
    evidence: "The Household Responsibility System links household income more directly with land, effort, and output.",
  },
  {
    title: "New Jobs Needed",
    eyebrow: "CHALLENGE 02 / RURAL ECONOMY",
    prompt: "Agricultural production is changing. Rural residents want non-agricultural jobs and local governments encourage township and village enterprises.",
    answer: "B",
    evidence: "Private and local non-government businesses can produce market goods and create non-agricultural employment.",
  },
  {
    title: "Factory Trouble",
    eyebrow: "CHALLENGE 03 / STATE ENTERPRISES",
    prompt: "A state-owned factory has fixed salaries and little connection between performance and reward.",
    answer: "C",
    evidence: "SOE reform targets incentives, management, innovation, and overall enterprise performance.",
  },
  {
    title: "The Entrepreneurs",
    eyebrow: "CHALLENGE 04 / BUSINESS",
    prompt: "Citizens have a product idea and want to invest their own money and operate their own business.",
    answer: "B",
    evidence: "Private enterprises are invested in and operated by people in the non-governmental sector.",
  },
  {
    title: "Connecting with the World",
    eyebrow: "CHALLENGE 05 / GLOBAL ECONOMY",
    prompt: "China wants stronger economic connections with other economies.",
    answer: "D",
    evidence: "Opening-up supports investment, trade, technology exchange, and wider economic connections.",
  },
];

const finalQuestions: Array<{ prompt: string; answer: ReformKey }> = [
  { prompt: "Farmers lack production incentives.", answer: "A" },
  { prompt: "Citizens want to establish and operate their own businesses.", answer: "B" },
  { prompt: "State-owned factories need changes to management and operation.", answer: "C" },
  { prompt: "China wants stronger economic connections with the outside world.", answer: "D" },
];

function AppButton({ children, onClick, variant = "primary", disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "quiet" | "choice" | "danger"; disabled?: boolean }) {
  return (
    <button className={`app-button ${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function App() {
  const [phase, setPhase] = useState<Phase>("title");
  const [roles, setRoles] = useState<string[]>([]);
  const [roleNames, setRoleNames] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([
    { label: "SYSTEM", text: "Simulation loaded. Awaiting a National Development Team.", tone: "muted" },
  ]);
  const [ruralChoice, setRuralChoice] = useState<string | null>(null);
  const [thinkChoice, setThinkChoice] = useState<string | null>(null);
  const [selectedReforms, setSelectedReforms] = useState<ReformKey[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<ReformKey | null>(null);
  const [challengeLocked, setChallengeLocked] = useState(false);
  const [finalIndex, setFinalIndex] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState<ReformKey | null>(null);
  const [finalLocked, setFinalLocked] = useState(false);
  const [exitText, setExitText] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const addLog = (label: string, text: string, tone: LogEntry["tone"] = "muted") => {
    setLog((current) => [...current.slice(-5), { label, text, tone }]);
  };

  const advance = (next: Phase) => {
    setPhase(next);
    setMobileMenu(false);
  };

  const beginSimulation = () => {
    addLog("MISSION", "You have 30 minutes to transform a development challenge into a strategy.", "gold");
    advance("roles");
  };

  const toggleRole = (name: string) => {
    setRoles((current) => current.includes(name) ? current.filter((role) => role !== name) : [...current, name]);
  };

  const confirmRoles = () => {
    const namedRoles = roleOptions.filter(({ name }) => roles.includes(name) || roleNames[name]?.trim()).map(({ name }) => name);
    setRoles(namedRoles);
    addLog("TEAM", `${namedRoles.length || 1} role${namedRoles.length === 1 ? "" : "s"} assigned. The village is waiting.`, "green");
    advance("rural");
  };

  const chooseRural = (choice: string) => {
    if (ruralChoice) return;
    setRuralChoice(choice);
    if (choice === "Work less") {
      setScore((current) => current + 2);
      addLog("INSIGHT +2", "Equal reward can weaken the reason to work harder.", "gold");
    } else {
      setScore((current) => current + 1);
      addLog("INSIGHT +1", "You made a prediction. Now test it against the production system.", "muted");
    }
  };

  const chooseThink = (choice: string) => {
    if (thinkChoice) return;
    setThinkChoice(choice);
    if (choice === "Motivation falls and production may suffer") {
      setScore((current) => current + 2);
      addLog("ANALYSIS +2", "You connected weak incentives to lower motivation and output.", "gold");
    } else {
      setScore((current) => current + 1);
      addLog("ANALYSIS +1", "Reasonable hypothesis logged. The reform phase will test it.", "muted");
    }
  };

  const toggleReform = (key: ReformKey) => {
    setSelectedReforms((current) => {
      if (current.includes(key)) return current.filter((reform) => reform !== key);
      if (current.length >= 2) return current;
      return [...current, key];
    });
  };

  const lockReforms = () => {
    if (selectedReforms.length !== 2) return;
    addLog("REFORM LOCKED", `${selectedReforms.join(" + ")} selected. Two coins spent.`, "red");
    advance("challenge");
  };

  const submitChallenge = () => {
    if (!challengeAnswer || challengeLocked) return;
    const question = developmentChallenges[challengeIndex];
    const correct = challengeAnswer === question.answer;
    setChallengeLocked(true);
    if (correct) {
      setScore((current) => current + 2);
      addLog("CHALLENGE +2", `${question.title}: reform match confirmed.`, "gold");
    } else {
      addLog("REVEAL", `${question.title}: the strongest match is ${question.answer}.`, "red");
    }
  };

  const nextChallenge = () => {
    if (challengeIndex < developmentChallenges.length - 1) {
      setChallengeIndex((current) => current + 1);
      setChallengeAnswer(null);
      setChallengeLocked(false);
    } else {
      addLog("ROUND CLEAR", "Five development challenges resolved. Final matching round unlocked.", "green");
      advance("final");
    }
  };

  const submitFinal = () => {
    if (!finalAnswer || finalLocked) return;
    const question = finalQuestions[finalIndex];
    setFinalLocked(true);
    if (finalAnswer === question.answer) {
      setScore((current) => current + 1);
      addLog("RAPID +1", `Question ${finalIndex + 1} correct.`, "gold");
    } else {
      addLog("RAPID MISS", `Question ${finalIndex + 1}: answer ${question.answer}.`, "red");
    }
  };

  const nextFinal = () => {
    if (finalIndex < finalQuestions.length - 1) {
      setFinalIndex((current) => current + 1);
      setFinalAnswer(null);
      setFinalLocked(false);
    } else {
      addLog("ASSESSMENT", "Complete the exit ticket in your own words.", "green");
      advance("exit");
    }
  };

  const resetGame = () => {
    setPhase("title");
    setRoles([]); setRoleNames({}); setScore(0); setLog([{ label: "SYSTEM", text: "Simulation reset. Awaiting a National Development Team.", tone: "muted" }]);
    setRuralChoice(null); setThinkChoice(null); setSelectedReforms([]); setChallengeIndex(0); setChallengeAnswer(null); setChallengeLocked(false); setFinalIndex(0); setFinalAnswer(null); setFinalLocked(false); setExitText("");
  };

  const progress = useMemo(() => {
    const map: Record<Phase, number> = { title: 0, roles: 8, rural: 20, think: 30, reforms: 42, challenge: 60, final: 82, exit: 94, results: 100 };
    return map[phase];
  }, [phase]);

  const canFinishExit = exitText.trim().length >= 16;

  return (
    <div className="game-shell">
      <div className="grain" />
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Map size={18} /></div>
          <div><p className="micro-label">NATIONAL DEVELOPMENT SIM</p><p className="brand-name">China / 1978+</p></div>
        </div>
        <div className="top-actions">
          <div className="save-chip"><ShieldCheck size={15} /> LOCAL SESSION</div>
          <button className="menu-button" onClick={() => setMobileMenu((current) => !current)} aria-label="Toggle log menu"><Menu size={20} /></button>
        </div>
      </header>

      <main className="game-layout">
        <aside className={`left-rail ${mobileMenu ? "mobile-open" : ""}`}>
          <section className="score-panel">
            <div className="score-top"><span className="micro-label">DEVELOPMENT POINTS</span><Coins size={18} color="#f2b84b" /></div>
            <div className="score-number">{score.toString().padStart(2, "0")}</div>
            <div className="score-bar"><span style={{ width: `${Math.min(score * 4, 100)}%` }} /></div>
            <p className="score-caption">Build a strategy that connects <b>problem → reform → effect</b>.</p>
          </section>

          <section className="campaign-panel">
            <div className="panel-heading"><span className="micro-label">CAMPAIGN MAP</span><span className="chapter-count">01 / 07</span></div>
            {[
              ["roles", "01", "Assemble the team"], ["rural", "02", "The production problem"], ["reforms", "03", "Spend reform coins"], ["challenge", "04", "Development challenges"], ["final", "05", "Rapid matching"], ["exit", "06", "Exit ticket"], ["results", "07", "Development results"],
            ].map(([key, number, label]) => <div key={key} className={`map-row ${phase === key ? "active" : ""} ${progress > (key === "roles" ? 8 : key === "rural" ? 20 : key === "reforms" ? 42 : key === "challenge" ? 60 : key === "final" ? 82 : key === "exit" ? 94 : 100) ? "done" : ""}`}><span>{number}</span><strong>{label}</strong>{phase === key && <ChevronRight size={15} />}</div>)}
          </section>

          <section className="codex-panel">
            <div className="panel-heading"><span className="micro-label">REFORM CODEX</span><BookOpen size={16} /></div>
            {(Object.entries(reforms) as [ReformKey, typeof reforms[ReformKey]][]).map(([key, item]) => { const Icon = item.icon; return <div className="codex-row" key={key}><span className="codex-key" style={{ color: item.accent }}>{key}</span><Icon size={15} /><span>{item.title}</span></div>; })}
          </section>

          <div className="rail-foot">TEXT RPG / CLASSROOM MODE<br /><span>Choose. Explain. Adapt.</span></div>
        </aside>

        <section className="story-column">
          <div className="story-header">
            <div><p className="micro-label">LIVE NARRATIVE / {phase.toUpperCase()}</p><h1>{phase === "title" ? "China Development Challenge" : phase === "results" ? "Development Results" : phase === "roles" ? "Form your National Development Team" : phase === "rural" ? "Round 1 / The Production Challenge" : phase === "think" ? "Pause. Read the system." : phase === "reforms" ? "Round 2 / You are the reformers" : phase === "challenge" ? "Round 3 / Development challenge" : phase === "final" ? "Final round / Match the reform" : "Exit ticket / Explain the chain"}</h1></div>
            <div className="progress-wrap"><div className="progress-label"><span>CAMPAIGN PROGRESS</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
          </div>

          <div className="story-screen">
            {phase === "title" && <div className="title-scene">
              <div className="title-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-sun" /><div className="art-land land-one" /><div className="art-land land-two" /><div className="art-label label-a">A</div><div className="art-label label-b">B</div><div className="art-label label-c">C</div><div className="art-label label-d">D</div></div>
              <div className="title-copy"><p className="eyebrow"><Sparkles size={16} /> A TEXT RPG ABOUT ECONOMIC CHANGE</p><h2>Can your team<br /><em>transform the economy?</em></h2><p className="title-lede">Lead a national development team through incentives, enterprise, performance, and global connection. Every decision earns a consequence.</p><div className="title-meta"><span><Timer size={15} /> 30 MINUTES</span><span><Users size={15} /> TEAM PLAY</span><span><Trophy size={15} /> HIGH SCORE</span></div><AppButton onClick={beginSimulation}>ENTER THE SIMULATION <ArrowRight size={18} /></AppButton></div>
            </div>}

            {phase === "roles" && <div className="scene-stack"><div className="scene-intro"><span className="scene-number">01</span><div><p className="eyebrow">MISSION BRIEFING</p><h2>You are a National Development Team.</h2><p>Write a name under each role, then use the team to identify the problem, choose a reform, and predict the effect.</p></div></div><div className="role-grid">{roleOptions.map(({ name, icon: Icon, desc }) => { const assigned = roles.includes(name) || !!roleNames[name]?.trim(); return <div key={name} className={`role-card ${assigned ? "selected" : ""}`}><div className="role-icon"><Icon size={21} /></div><div><b>{name}</b><p>{desc}</p></div><input className="role-name-input" aria-label={`${name} student name`} placeholder="Student name" value={roleNames[name] || ""} onChange={(event) => { const value = event.target.value; setRoleNames((current) => ({ ...current, [name]: value })); if (value.trim() && !roles.includes(name)) setRoles((current) => [...current, name]); }} /><span className="role-status">{assigned ? <Check size={16} /> : <span>+</span>}</span></div>; })}</div><div className="scene-footer"><span>{roleOptions.filter(({ name }) => roles.includes(name) || roleNames[name]?.trim()).length} named roles assigned / write the student name for each role</span><AppButton onClick={confirmRoles}>START ROUND 1 <ArrowRight size={17} /></AppButton></div></div>}

            {phase === "rural" && <div className="scene-stack"><div className="round-kicker"><span className="chapter-stamp">ROUND 1</span><span className="eyebrow">THE PRODUCTION CHALLENGE</span></div><div className="rural-intro"><div><h2>Five households produce <em>50 units</em> of crops.</h2><p>The crops are shared equally. Everyone receives <b>10 units</b>. But the households did not contribute equally.</p></div><div className="crop-counter"><Wheat size={30} /><strong>50</strong><span>UNITS</span></div></div><div className="household-table"><div className="table-row table-head"><span>HOUSEHOLD</span><span>CONTRIBUTION</span><span>RECEIVED</span></div>{[["A", "Extremely hard-working", "10 units"], ["B", "Hard-working", "10 units"], ["C", "Normal", "10 units"], ["D", "Very little work", "10 units"], ["E", "Almost no work", "10 units"]].map(([house, effort, received], i) => <div key={house} className={`table-row ${i === 0 ? "highlight-row" : ""}`}><span className="house-label">{house === "A" ? "HOUSEHOLD A" : house}</span><span className={i === 0 ? "effort-hard" : ""}>{effort}</span><span>{received}</span></div>)}</div><div className="decision-bar"><div><p className="eyebrow">YOU ARE HOUSEHOLD A</p><b>You worked the hardest. What do you do next year?</b></div><div className="decision-actions"><button onClick={() => chooseRural("Work harder")} className={ruralChoice === "Work harder" ? "picked positive" : ""} disabled={!!ruralChoice}>Work harder</button><button onClick={() => chooseRural("Work the same")} className={ruralChoice === "Work the same" ? "picked neutral" : ""} disabled={!!ruralChoice}>Work the same</button><button onClick={() => chooseRural("Work less")} className={ruralChoice === "Work less" ? "picked negative" : ""} disabled={!!ruralChoice}>Work less</button></div></div>{ruralChoice && <div className="scene-footer"><span className="reveal-line"><Lightbulb size={16} /> Your prediction is logged. Now examine the system.</span><AppButton onClick={() => advance("think")}>THINK IT THROUGH <ArrowRight size={17} /></AppButton></div>}</div>}

            {phase === "think" && <div className="scene-stack centered-scene"><div className="scene-number huge">02</div><p className="eyebrow">SYSTEM DIAGNOSTIC / 02:00</p><h2>What could happen if rewards are shared regardless of contribution?</h2><p className="center-lede">Your Economic Adviser must connect the human response to the production result.</p><div className="think-options"><button onClick={() => chooseThink("Motivation falls and production may suffer")} className={thinkChoice === "Motivation falls and production may suffer" ? "picked" : ""} disabled={!!thinkChoice}><span>01</span> Motivation falls and production may suffer</button><button onClick={() => chooseThink("Everyone becomes more productive")} className={thinkChoice === "Everyone becomes more productive" ? "picked" : ""} disabled={!!thinkChoice}><span>02</span> Everyone becomes more productive</button><button onClick={() => chooseThink("Nothing changes in the village")} className={thinkChoice === "Nothing changes in the village" ? "picked" : ""} disabled={!!thinkChoice}><span>03</span> Nothing changes in the village</button></div>{thinkChoice && <div className="answer-note"><Zap size={17} /> <span><b>KEY PROBLEM:</b> lack of production incentives. Lower motivation can make production suffer.</span></div>}<div className="scene-footer"><span className="reveal-line"><BookOpen size={16} /> Complete Round 1 on your handout.</span><AppButton onClick={() => advance("reforms")} disabled={!thinkChoice}>TIME TO REFORM <ArrowRight size={17} /></AppButton></div></div>}

            {phase === "reforms" && <div className="scene-stack"><div className="scene-intro"><span className="scene-number">03</span><div><p className="eyebrow">REFORM BUDGET / TWO COINS</p><h2>Choose only two reforms first.</h2><p>Resources are limited. Pick the policies that best respond to the problem you diagnosed.</p></div><div className="coin-stack"><Coins size={29} /><strong>{selectedReforms.length}</strong><span>/ 2 COINS</span></div></div><div className="reform-grid">{(Object.entries(reforms) as [ReformKey, typeof reforms[ReformKey]][]).map(([key, item]) => { const Icon = item.icon; const selected = selectedReforms.includes(key); return <button key={key} className={`reform-card ${selected ? "selected" : ""}`} onClick={() => toggleReform(key)}><div className="reform-top"><span className="reform-letter" style={{ color: item.accent }}>{key}</span><Icon size={22} color={item.accent} />{selected ? <Check size={18} className="role-check" /> : <span className="role-add">+</span>}</div><b>{item.title}</b><span className="reform-short">{item.short}</span><p>{item.brief}</p><div className="effect-line"><ArrowRight size={14} /> {item.effect}</div></button>; })}</div><div className="scene-footer"><span>{selectedReforms.length === 2 ? "Two coins selected. Lock the strategy." : "Select exactly two reform coins."}</span><AppButton onClick={lockReforms} disabled={selectedReforms.length !== 2}><LockKeyhole size={17} /> LOCK IN DECISION</AppButton></div></div>}

            {phase === "challenge" && (() => { const q = developmentChallenges[challengeIndex]; return <div className="scene-stack"><div className="challenge-top"><div><p className="eyebrow">{q.eyebrow}</p><h2>{q.title}</h2></div><div className="timer-pill"><Timer size={16} /> 10 SEC</div></div><div className="challenge-prompt"><span className="quote-mark">“</span><p>{q.prompt}</p><span className="quote-mark closing">”</span></div><div className="choice-grid">{(Object.entries(reforms) as [ReformKey, typeof reforms[ReformKey]][]).map(([key, item]) => { const Icon = item.icon; return <button key={key} className={`mini-choice ${challengeAnswer === key ? "selected" : ""} ${challengeLocked && key === q.answer ? "correct" : ""} ${challengeLocked && challengeAnswer === key && key !== q.answer ? "incorrect" : ""}`} onClick={() => !challengeLocked && setChallengeAnswer(key)}><span className="choice-letter" style={{ color: item.accent }}>{key}</span><Icon size={18} /><span>{item.title}</span>{challengeLocked && key === q.answer && <Check size={16} />}{challengeLocked && challengeAnswer === key && key !== q.answer && <X size={16} />}</button>; })}</div>{challengeLocked && <div className={`answer-note ${challengeAnswer === q.answer ? "good" : ""}`}><Sparkles size={17} /><span><b>{challengeAnswer === q.answer ? "CORRECT MATCH" : `BEST MATCH: ${q.answer}`}</b> — {q.evidence}</span></div>}<div className="scene-footer"><span>Challenge {challengeIndex + 1} of {developmentChallenges.length}</span>{!challengeLocked ? <AppButton onClick={submitChallenge} disabled={!challengeAnswer}><Send size={17} /> SUBMIT ANSWER</AppButton> : <AppButton onClick={nextChallenge}>{challengeIndex === developmentChallenges.length - 1 ? "UNLOCK FINAL ROUND" : "NEXT CHALLENGE"} <ArrowRight size={17} /></AppButton>}</div></div>; })()}

            {phase === "final" && (() => { const q = finalQuestions[finalIndex]; return <div className="scene-stack centered-scene"><div className="final-head"><div><p className="eyebrow">FINAL ROUND / NO DISCUSSION</p><h2>Match the reform in five seconds.</h2></div><div className="rapid-number">0{finalIndex + 1}</div></div><div className="rapid-prompt"><span>{q.prompt}</span><div className="countdown">5... 4... 3... 2... 1...</div></div><div className="choice-grid final-grid">{(Object.entries(reforms) as [ReformKey, typeof reforms[ReformKey]][]).map(([key, item]) => { const Icon = item.icon; return <button key={key} className={`mini-choice ${finalAnswer === key ? "selected" : ""} ${finalLocked && key === q.answer ? "correct" : ""} ${finalLocked && finalAnswer === key && key !== q.answer ? "incorrect" : ""}`} onClick={() => !finalLocked && setFinalAnswer(key)}><span className="choice-letter" style={{ color: item.accent }}>{key}</span><Icon size={18} /><span>{item.title}</span>{finalLocked && key === q.answer && <Check size={16} />}</button>; })}</div>{finalLocked && <div className="answer-note"><Sparkles size={17} /><span><b>ANSWER {q.answer}</b> — {reforms[q.answer].title} is the best fit.</span></div>}<div className="scene-footer"><span>Question {finalIndex + 1} of {finalQuestions.length}</span>{!finalLocked ? <AppButton onClick={submitFinal} disabled={!finalAnswer}><Zap size={17} /> SHOW ANSWER</AppButton> : <AppButton onClick={nextFinal}>{finalIndex === finalQuestions.length - 1 ? "OPEN EXIT TICKET" : "NEXT QUESTION"} <ArrowRight size={17} /></AppButton>}</div></div>; })()}

            {phase === "exit" && <div className="scene-stack centered-scene"><div className="scene-number">06</div><p className="eyebrow">INDIVIDUAL WORK / 02:00</p><h2>Complete the chain in your own words.</h2><p className="center-lede">Name the four reforms, then explain one connection from <b>problem → reform → effect</b>.</p><div className="exit-chain"><span>PROBLEM</span><ArrowRight size={18} /><span>REFORM</span><ArrowRight size={18} /><span>EFFECT</span></div><textarea value={exitText} onChange={(event) => setExitText(event.target.value)} placeholder="Example: Farmers lacked production incentives, so rural reform linked income more closely to household effort..." /><div className="scene-footer"><span>{exitText.trim().length}/16 characters minimum</span><AppButton onClick={() => advance("results")} disabled={!canFinishExit}><Trophy size={17} /> SEE DEVELOPMENT RESULTS</AppButton></div></div>}

            {phase === "results" && <div className="results-scene"><div className="results-hero"><div className="trophy-ring"><Trophy size={33} /></div><div><p className="eyebrow">SIMULATION COMPLETE</p><h2>Development results</h2><p>{score >= 18 ? "Your team built a high-confidence reform strategy." : score >= 12 ? "Your team found the pattern and adapted well." : "Your team has a foundation. Replay to sharpen the connections."}</p></div><div className="final-score"><span>FINAL SCORE</span><b>{score}</b><small>PTS</small></div></div><div className="results-grid"><div className="result-card"><p className="eyebrow">THE FOUR REFORMS</p>{(Object.entries(reforms) as [ReformKey, typeof reforms[ReformKey]][]).map(([key, item]) => <div className="result-row" key={key}><span style={{ color: item.accent }}>{key}</span><b>{item.title}</b><span>{item.effect}</span></div>)}</div><div className="result-card pattern-card"><p className="eyebrow">THE BIG PICTURE</p><div className="pattern-flow"><b>PROBLEM</b><ArrowRight size={15} /><b>REFORM</b><ArrowRight size={15} /><b>EFFECT</b></div><p>Do not just memorize the reform. Understand <em>why it happened</em> and what changed for people, enterprises, or the wider economy.</p><div className="tag-row"><span><Check size={14} /> incentives</span><span><Check size={14} /> enterprise</span><span><Check size={14} /> connection</span></div></div></div><div className="results-footer"><div><p className="eyebrow">TEAM LOG</p><p>Highest score wins the challenge. Keep your exit ticket as evidence of your reasoning.</p></div><AppButton variant="quiet" onClick={resetGame}><RotateCcw size={16} /> REPLAY SIMULATION</AppButton></div></div>}
          </div>

          <div className="terminal-log"><div className="terminal-title"><span className="status-dot" /> DECISION LOG</div><div className="log-lines">{log.map((entry, index) => <div className={`log-line ${entry.tone || ""}`} key={`${entry.label}-${index}`}><span>[{entry.label}]</span><p>{entry.text}</p></div>)}</div></div>
        </section>
      </main>
    </div>
  );
}

export default App;
