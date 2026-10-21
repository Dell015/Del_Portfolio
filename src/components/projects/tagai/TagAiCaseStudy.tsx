"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/content/projects";
import "./tagai.css";

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- data (card texts are from the app's own card library) ---------- */

type DeckId = "icebreaker" | "family" | "life" | "deep" | "barkada" | "lovers" | "spicy";
type Sample = { kind: "Truth" | "Dare"; sub: string; text: string; heat: number; line: string };

const T = "Fail or refuse: take a shot";
const D = "Skip it: take a shot";

const DECKS: { id: DeckId; name: string; blurb: string; price: string; cards: Sample[] }[] = [
  {
    id: "icebreaker", name: "Icebreaker", blurb: "Light questions for people who just met.", price: "0.1",
    cards: [
      { kind: "Truth", sub: "Hot take", text: "Jollibee is better than McDo. Fight me.", heat: 1, line: T },
      { kind: "Truth", sub: "Commute", text: "Jeepney or Grab? Which one is the real Filipino commute?", heat: 1, line: T },
      { kind: "Truth", sub: "What if", text: "If you could swap lives with any Filipino celebrity for a day, who?", heat: 1, line: T },
    ],
  },
  {
    id: "family", name: "Family", blurb: "Clean and safe for all ages.", price: "0.1",
    cards: [
      { kind: "Truth", sub: "Family", text: "What's one tradition from your family that you'll pass on?", heat: 1, line: T },
      { kind: "Truth", sub: "Growing up", text: "What rule in your bahay did you always break growing up?", heat: 1, line: T },
    ],
  },
  {
    id: "life", name: "Life", blurb: "Work, money, dreams and growing up.", price: "0.1",
    cards: [
      { kind: "Truth", sub: "School", text: "What's the most embarrassing thing that happened to you in school?", heat: 2, line: T },
      { kind: "Truth", sub: "Real talk", text: "Do you think you're living the life you actually want?", heat: 3, line: T },
    ],
  },
  {
    id: "deep", name: "Deep", blurb: "Honest, slow questions about what matters.", price: "0.2",
    cards: [
      { kind: "Truth", sub: "Honest", text: "Do you think people can truly change, or nah?", heat: 2, line: T },
      { kind: "Dare", sub: "Eyes closed", text: "Everyone closes their eyes. Say one thing you have never told this group out loud.", heat: 4, line: D },
    ],
  },
  {
    id: "barkada", name: "Barkada", blurb: "Banter, roasts and dares for the squad.", price: "0.2",
    cards: [
      { kind: "Truth", sub: "Barkada", text: "Filipino time is just bad time management, not culture.", heat: 2, line: T },
      { kind: "Truth", sub: "Roast", text: "Roast someone's fashion sense in this group. Keep it friendly.", heat: 2, line: T },
      { kind: "Dare", sub: "Language", text: "Speak only Filipino for the next 3 rounds. No English.", heat: 1, line: D },
    ],
  },
  {
    id: "lovers", name: "Lovers", blurb: "Love, trust and what you never said.", price: "0.2",
    cards: [
      { kind: "Truth", sub: "Love", text: "What love language do you speak most?", heat: 1, line: T },
      { kind: "Truth", sub: "Courtship", text: "Do you believe in ligaw (courtship) or is it outdated?", heat: 2, line: T },
      { kind: "Truth", sub: "Honest", text: "Have you ever stayed in a relationship out of pity?", heat: 3, line: T },
    ],
  },
  {
    id: "spicy", name: "Spicy", blurb: "High heat from the first card.", price: "0.3",
    cards: [
      { kind: "Truth", sub: "Controversial", text: "What's an opinion you have that would make this group hate you?", heat: 5, line: T },
      { kind: "Truth", sub: "Unsaid", text: "What's one thing everyone thinks about someone here but no one says?", heat: 4, line: T },
      { kind: "Dare", sub: "Phone", text: "Let the group go through your search history for 30 seconds.", heat: 5, line: D },
    ],
  },
];

const HEAT_LABELS = ["Chill", "Warm", "Spicy", "Hot", "Inferno"];

/* the real engine's step sizes */
const EVENTS = {
  next: { d: 0.3, name: "Next", sub: "+0.3", say: "Card done. The table moves on and the heat creeps up." },
  save: { d: 0.5, name: "Save", sub: "+0.5", say: "Someone saved it. That card landed, so the game leans in." },
  skip: { d: -0.2, name: "Skip", sub: "−0.2", say: "Skipped. The game eases off a little." },
  wild: { d: 0.5, name: "Wild card", sub: "+0.5", say: "A wild card hit the table. Everything jumps." },
} as const;

const DICE_ROLL = {
  q: "Roll the die. Your number decides your fate.",
  out: [
    "Pick someone to take a drink.",
    "You take a drink.",
    "Safe. Nothing happens.",
    "Tell an embarrassing story.",
    "Give a dare to the person on your left.",
    "Everyone takes a drink.",
  ],
};
const COIN_FLIP = { q: "Flip the coin. Luck decides who pays.", out: ["Pick someone to take a drink.", "You take a drink."] };

const KINDS: [string, string][] = [
  ["Truth", "Answer out loud"], ["Dare", "Do it"], ["Dice", "Roll and follow the number"], ["Coin", "Heads or tails decides"],
  ["Bottle", "The bottle picks a player"], ["Wheel", "Spin for a fate"], ["Timer", "Beat the clock"], ["Vote", "Everyone points at once"], ["Rule", "Holds until the next wild card"],
];

const STEPS = [
  { n: "1", title: "Buy your cards", text: "Every deck is a kind of conversation with a price per card. The group has one pot of coins and spends it on how many cards it wants from each deck. Wild cards are always free." },
  { n: "2", title: "Skip what hurts", text: "A list of topics the table can switch off before the first card is drawn, so nobody has to say it out loud in the middle of a game." },
  { n: "3", title: "Pick the drink rule", text: "Shots, sips or forfeits. For tables that don't drink, every drink line turns into a forfeit, same game." },
  { n: "4", title: "Agree on house rules", text: "The group sets its own rules and each player taps to agree, in order. The order matters: a tap is a promise made in front of everyone." },
];

const DECISIONS = [
  { deck: "barkada", t: "Signboard, not app", p: "Bungee headlines like a jeepney sign, a condensed heavy body, chevron trim bands. It looks like something from a Manila street, not a startup template." },
  { deck: "icebreaker", t: "One flat colour per deck", p: "Ten decks, ten colours, no gradients. You know which kind of question is coming from across the table before you read a word." },
  { deck: "spicy", t: "Drunk-proof on purpose", p: "Buttons are at least 56px, card text is huge, there's an undo, and reduced motion is respected. It has to work at midnight with one hand." },
  { deck: "lovers", t: "Hand-drawn icons, no emojis", p: "A small custom SVG set instead of emoji, so the game looks the same on every phone and never reads as AI-generated." },
  { deck: "deep", t: "Comfort first", p: "Topics can be skipped before the game starts, the Adult deck sits behind an 18+ confirmation, and nobody is forced to answer. Dealing with it quietly is part of the design." },
  { deck: "life", t: "Motion with meaning", p: "The card is dealt, then it flips with a spring. The numbers roll. Topic slides go the direction you're moving. Nothing moves just to move." },
];

const BUILT = [
  "Welcome, 18+ check and nickname flow",
  "Four-step setup with the coin pot, topics, drink rules and house rules",
  "Ten deck colours and the card library, with Truth and Dare cards",
  "The heat engine that ramps the game up and down",
  "Tool cards: dice, coin, bottle, wheel, timer and vote on their own screens",
  "A Topic deck of 109 conversation topics",
  "Shop, wallet, saved cards, suggest-a-card, and a recap share image",
  "242 automated tests on the game logic",
];
const TODO = [
  "A real database and accounts (Supabase). Today everything is on mock data in the browser",
  "Live rooms across phones",
  "Payments through PayMongo. No real money moves today",
  "A service worker for true offline play",
  "Filipino-language strings",
  "Real-phone testing across iPhone and Android, then a small friends alpha",
];

/* ---------- pieces ---------- */

function Arrow() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

const Icon = {
  trash: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
  ),
  skip: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 5l9 7-9 7V5zM19 5v14" /></svg>
  ),
  heart: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6-8 11-8 11z" /></svg>
  ),
  check: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  ),
};

function Heat({ level, red }: { level: number; red?: boolean }) {
  return (
    <div className={`tg-heat${red ? " tg-heat--red" : ""}`} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} data-on={i < Math.round(level)} />
      ))}
    </div>
  );
}

function reduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Playground() {
  const [deckId, setDeckId] = useState<DeckId>("barkada");
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const deck = DECKS.find((d) => d.id === deckId)!;
  const card = deck.cards[idx % deck.cards.length];

  const pick = (id: DeckId) => {
    setDeckId(id);
    setIdx(0);
    setOpen(false);
  };
  const next = (stepBy = 1) => {
    setOpen(false);
    setTimeout(() => setIdx((i) => i + stepBy), reduced() ? 0 : 280);
  };

  return (
    <div className="tg-play" data-deck={deckId}>
      <div>
        <div className="tg-chips" role="group" aria-label="Pick a deck">
          {DECKS.map((d) => (
            <button key={d.id} type="button" className="tg-chip" data-deck={d.id} aria-pressed={deckId === d.id} onClick={() => pick(d.id)}>
              <i />
              {d.name}
            </button>
          ))}
        </div>
        <p className="tg-deckblurb">
          <b>{deck.name}.</b> {deck.blurb} <b>{deck.price} coin</b> a card from the pot.
        </p>
        <p className="tg-note">Tap the card to reveal it, then Next. These are real cards from the app&apos;s library.</p>
      </div>

      <div className="tg-cardwrap">
        <div className="tg-hud">
          <Heat level={card.heat} red={card.heat >= 4} />
          <span className="tg-hud__label">{HEAT_LABELS[card.heat - 1]}</span>
        </div>
        <div className="tg-stage">
          <button
            type="button"
            className="tg-cardbtn"
            data-open={open}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Card revealed" : "Tap to reveal the card"}
          >
            <span className="tg-face tg-face--back">
              <span className="tg-sign">Tag.ai</span>
              <span className="tg-face__meta">{card.kind}, {deck.name}</span>
              <span className="tg-face__big">Tap to reveal</span>
            </span>
            <span className="tg-face tg-face--front" aria-hidden={!open}>
              <span className="tg-sign">{card.kind}</span>
              <span className="tg-face__meta">{deck.name} · {card.sub}</span>
              <span className="tg-face__pips">
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} data-on={n <= card.heat} />
                ))}
              </span>
              <span className="tg-face__text">{card.text}</span>
              <span className="tg-face__rule">{card.line}</span>
            </span>
          </button>
        </div>
        <div className="tg-actions">
          <button type="button" className="tg-act" onClick={() => next(1)} aria-label="Trash this card">{Icon.trash}Trash</button>
          <button type="button" className="tg-act" onClick={() => next(1)} aria-label="Skip this card">{Icon.skip}Skip</button>
          <button type="button" className="tg-act" onClick={() => setOpen(true)} aria-label="Save this card">{Icon.heart}Save</button>
          <button type="button" className="tg-act tg-act--next" onClick={() => next(1)} aria-label="Next card">{Icon.check}Next</button>
        </div>
      </div>
    </div>
  );
}

function HeatDemo() {
  const [heat, setHeat] = useState(1.6);
  const [skips, setSkips] = useState(0);
  const [log, setLog] = useState("Press a button. These are the engine's real step sizes.");

  const fire = (k: keyof typeof EVENTS) => {
    let d: number = EVENTS[k].d;
    let msg: string = EVENTS[k].say;
    let s = k === "skip" ? skips + 1 : 0;
    if (k === "skip" && s >= 3) {
      d += -1;
      s = 0;
      msg = "Three skips in a row. The game drops a whole level to cool the table.";
    }
    setSkips(s);
    setHeat((h) => Math.max(1, Math.min(5, Math.round((h + d) * 10) / 10)));
    setLog(msg);
  };
  const level = Math.floor(heat);

  return (
    <div className="tg-meter">
      <div className="tg-meter__top">
        <span className="tg-meter__name">{HEAT_LABELS[level - 1]}</span>
        <span className="tg-meter__num">{heat.toFixed(1)} / 5</span>
      </div>
      <Heat level={level} red={level >= 4} />
      <div className="tg-meter__btns">
        {(Object.keys(EVENTS) as (keyof typeof EVENTS)[]).map((k) => (
          <button key={k} type="button" className={`tg-key${k === "wild" ? " tg-key--accent" : ""}`} onClick={() => fire(k)}>
            {EVENTS[k].name}
            <small>{EVENTS[k].sub}</small>
          </button>
        ))}
      </div>
      <p className="tg-meter__log" aria-live="polite">{log}</p>
      <button type="button" className="tg-meter__reset" onClick={() => { setHeat(1.6); setSkips(0); setLog("Back to the start."); }}>Reset</button>
    </div>
  );
}

function Steps() {
  const [n, setN] = useState(0);
  const s = STEPS[n];
  return (
    <>
      <div className="tg-tabs" role="tablist" aria-label="Setup steps">
        {STEPS.map((st, i) => (
          <button key={st.n} type="button" role="tab" id={`tg-tab-${i}`} aria-controls="tg-panel" aria-selected={n === i} className="tg-tab" onClick={() => setN(i)}>
            <b>{st.n}</b>
            {st.title}
          </button>
        ))}
      </div>
      <div className="tg-step" role="tabpanel" id="tg-panel" aria-labelledby={`tg-tab-${n}`} key={n}>
        <div>
          <span className="tg-step__n">Step {s.n} of 4</span>
          <h3 className="tg-h3">{s.title}</h3>
          <p className="tg-p">{s.text}</p>
        </div>
        <div>
          {n === 0 && (
            <div className="tg-mini">
              {(
                [["icebreaker", "Icebreaker", 0], ["barkada", "Barkada", 6], ["lovers", "Lovers", 2], ["spicy", "Spicy", 3]] as [string, string, number][]
              ).map(([id, name, c]) => (
                <div className="tg-mini__row" data-deck={id} key={id}>
                  <i />
                  <span>{name}</span>
                  <u>−</u>
                  <em>{c}</em>
                  <u>+</u>
                </div>
              ))}
              <div className="tg-pot"><span>Pot used</span><b>2.4 / 6</b></div>
              <p className="tg-note">Example numbers. The pot and prices come from the app.</p>
            </div>
          )}
          {n === 1 && (
            <div>
              {[["Politics", true], ["Exes", true], ["Money", false], ["Family", false], ["Work", false], ["Religion", true]].map(([t, skip]) => (
                <span className="tg-tag" data-skip={skip as boolean} key={t as string}>{t as string}</span>
              ))}
              <p className="tg-note">Crossed out topics never make it into the game.</p>
            </div>
          )}
          {n === 2 && (
            <div>
              <span className="tg-tag" style={{ background: "var(--accent)", color: "var(--ink)" }}>Take a shot</span>
              <span className="tg-tag">Take a sip</span>
              <span className="tg-tag">Do a forfeit</span>
              <p className="tg-note">&ldquo;Fail or refuse: take a shot&rdquo; becomes &ldquo;do a forfeit&rdquo; at a table that doesn&apos;t drink.</p>
            </div>
          )}
          {n === 3 && (
            <div className="tg-mini">
              {["Randel", "Mika", "Jun"].map((p, i) => (
                <div className="tg-mini__row" key={p} data-deck={i === 0 ? "barkada" : "family"}>
                  <i />
                  <span>{p}</span>
                  <em style={{ minWidth: "5rem" }}>{i === 0 ? "Agreed" : "Tap to agree"}</em>
                </div>
              ))}
              <p className="tg-note">Players tap their own name, in order.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Tools() {
  const [die, setDie] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [coin, setCoin] = useState<number | null>(null);
  const [flipping, setFlipping] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    const result = 1 + Math.floor(Math.random() * 6);
    timers.current.push(window.setTimeout(() => { setDie(result); setRolling(false); }, reduced() ? 0 : 750));
  };
  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    const result = Math.floor(Math.random() * 2);
    timers.current.push(window.setTimeout(() => { setCoin(result); setFlipping(false); }, reduced() ? 0 : 1000));
  };

  return (
    <div className="tg-tools">
      <div className="tg-tool" data-deck="chaos">
        <span className="tg-sign">Dice</span>
        <p className="tg-tool__q">{DICE_ROLL.q}</p>
        <div className="tg-tool__stage">
          <div className="tg-die" data-rolling={rolling} aria-live="polite" aria-label={die ? `Rolled ${die}` : "Die"}>{rolling ? "?" : die ?? "6"}</div>
        </div>
        <p className="tg-tool__out" aria-live="polite">{die && !rolling ? DICE_ROLL.out[die - 1] : "Roll to find out."}</p>
        <button type="button" className="tg-key" onClick={roll}>{rolling ? "Rolling…" : "Roll"}</button>
      </div>
      <div className="tg-tool" data-deck="life">
        <span className="tg-sign">Coin</span>
        <p className="tg-tool__q">{COIN_FLIP.q}</p>
        <div className="tg-tool__stage">
          <div className="tg-coinwrap"><div className="tg-coin" data-flip={flipping}>{coin === null || flipping ? "TAG.AI" : coin === 0 ? "HEADS" : "TAILS"}</div></div>
        </div>
        <p className="tg-tool__out" aria-live="polite">{coin !== null && !flipping ? `${coin === 0 ? "Heads" : "Tails"}: ${COIN_FLIP.out[coin]}` : "Flip to find out."}</p>
        <button type="button" className="tg-key" onClick={flip}>{flipping ? "Flipping…" : "Flip"}</button>
      </div>
    </div>
  );
}

const SHOTS = [
  { src: "/tagai/welcome.webp", t: "Welcome", d: "The deck of colours, dealt in." },
  { src: "/tagai/buy.webp", t: "Buy your cards", d: "Spend the pot deck by deck." },
  { src: "/tagai/deal.webp", t: "Your turn", d: "Face down until you tap." },
  { src: "/tagai/reveal.webp", t: "The card", d: "Big text, clear drink line." },
];

/* ---------- page ---------- */

export function TagAiCaseStudy({ project, others }: { project: Project; others: Project[] }) {
  return (
    <main id="main" tabIndex={-1} className="tg outline-none">
      {/* HERO */}
      <section className="tg-hero">
        <div className="tg-wrap">
          <Link href="/#projects" className="tg-back">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            Back to projects
          </Link>
          <div className="tg-hero__grid">
            <div>
              <div className="tg-status"><i />{project.status} · MVP stage</div>
              <h1 className="tg-sign tg-title">
                Tag<span>.Ai</span>
              </h1>
              <p className="tg-tagline">Pass the phone. Answer the card. <s>Take the shot.</s></p>
              <p className="tg-lead tg-sub">{project.pitch}</p>
              <div className="tg-cta">
                <a className="tg-key tg-key--accent" href="#play">Deal me a card</a>
                {project.repoUrl && (
                  <a className="tg-key tg-key--ghost" href={project.repoUrl} target="_blank" rel="noopener noreferrer">Source code <Arrow /></a>
                )}
                {project.liveUrl && (
                  <a className="tg-key tg-key--ghost" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Open it <Arrow /></a>
                )}
              </div>
            </div>
            <div className="tg-fan" aria-hidden>
              {(
                [["icebreaker", -26, "-40%"], ["family", -13, "-20%"], ["barkada", 0, "0%"], ["lovers", 13, "20%"], ["spicy", 26, "40%"]] as [string, number, string][]
              ).map(([d, r, x], i) => (
                <div className="tg-fan__card" data-deck={d} key={d} style={{ ["--r" as string]: `${r}deg`, ["--x" as string]: x, ["--i" as string]: i }}>
                  <b>Tag.ai</b>
                </div>
              ))}
              <span className="tg-fan__tag">one phone, one table</span>
            </div>
          </div>
        </div>
      </section>

      <div className="tg-trim" aria-hidden />

      {/* FACTS */}
      <div className="tg-wrap" style={{ paddingTop: "clamp(2rem,5vw,3rem)" }}>
        <Reveal>
          <dl className="tg-facts">
            {[
              ["Role", project.role],
              ["Team", project.teamSize],
              ["Platform", "Web app, phone first"],
              ["Status", "Frontend done, backend next"],
            ].map(([k, v]) => (
              <div className="tg-fact" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* IDEA */}
      <section className="tg-section">
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">The idea</span>
            <h2 className="tg-h2">A drinking game that makes you <em>look up</em> from your phone.</h2>
            <p className="tg-lead">One phone goes around the table. Whoever holds it draws a card and the whole group has to look at them, not at a screen. Built for Filipino barkadas, ages 18 to 30.</p>
          </Reveal>
        </div>
      </section>

      {/* PLAYGROUND */}
      <section className="tg-section" id="play" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Try it</span>
            <h2 className="tg-h2">Pick a deck. <em>Deal a card.</em></h2>
            <p className="tg-lead">Each deck has its own colour and its own kind of question. This is the real card face from the app, running here.</p>
          </Reveal>
          <Playground />
        </div>
      </section>

      <div className="tg-trim tg-trim--red" aria-hidden />

      {/* HEAT */}
      <section className="tg-section">
        <div className="tg-wrap">
          <div className="tg-engine">
            <Reveal>
              <span className="tg-eyebrow">The heat engine</span>
              <h2 className="tg-h2">The game reads the table and <em>turns it up.</em></h2>
              <p className="tg-lead">Sessions start light and ramp up. Finishing a card, saving one or hitting a wild card raises the heat. Skipping cools it down, and three skips in a row drops a full level. Family mode caps the heat so it never gets out of hand.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <HeatDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* SETUP */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Before the first card</span>
            <h2 className="tg-h2">Four steps that set the <em>whole night.</em></h2>
          </Reveal>
          <Steps />
        </div>
      </section>

      {/* TOOLS */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Cards that bring their own tool</span>
            <h2 className="tg-h2">Nobody has to <em>find a dice.</em></h2>
            <p className="tg-lead">Dice, coin, bottle, wheel, timer and vote cards open on their own full-screen stage, so the table just follows the result.</p>
          </Reveal>
          <Reveal>
            <Tools />
          </Reveal>
          <div className="tg-kinds">
            {KINDS.map(([k, v]) => (
              <span className="tg-kind" key={k}>{k} <span>· {v}</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* REAL SCREENS */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">From the build</span>
            <h2 className="tg-h2">Real screens, <em>running locally.</em></h2>
            <p className="tg-lead">Screenshots from the app on my machine with demo players. It isn&apos;t deployed yet.</p>
          </Reveal>
          <div className="tg-shots">
            {SHOTS.map((s, i) => (
              <Reveal key={s.src} delay={i * 0.06} className="tg-shot">
                <figure>
                  <div className="tg-shot__frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={`Tag.ai screen: ${s.t}`} width={480} height={1039} loading="lazy" decoding="async" />
                  </div>
                  <figcaption><b>{s.t}</b>{s.d}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DECISIONS */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Design decisions</span>
            <h2 className="tg-h2">Made to be used <em>half asleep.</em></h2>
          </Reveal>
          <div className="tg-dec">
            {DECISIONS.map((d, i) => (
              <Reveal key={d.t} delay={(i % 2) * 0.07}>
                <article className="tg-d" data-deck={d.deck}>
                  <h3 className="tg-h3">{d.t}</h3>
                  <p>{d.p}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="tg-18">Tag.Ai is for adults. The Adult deck needs every player to confirm they are 18 or older. Please drink responsibly.</p>
          </Reveal>
        </div>
      </section>

      {/* STATUS */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Where it stands</span>
            <h2 className="tg-h2">Honest status: <em>front of house is done.</em></h2>
          </Reveal>
          <div className="tg-board">
            <Reveal>
              <div className="tg-col tg-col--done">
                <h3 className="tg-h3"><span className="tg-sign">Built</span></h3>
                <ul>{BUILT.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="tg-col tg-col--todo">
                <h3 className="tg-h3"><span className="tg-sign">Not yet</span></h3>
                <ul>{TODO.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <p className="tg-honest">Nothing here has shipped. The order from here: friends alpha, then the database and accounts, then payments, then a public beta.</p>
          </Reveal>
        </div>
      </section>

      {/* STACK */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Stack</span>
            <div className="tg-stack" aria-label="Tech stack">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand", "Vitest"].map((t) => <span key={t}>{t}</span>)}
              {["Supabase", "PayMongo"].map((t) => <span className="is-plan" key={t}>{t} · planned</span>)}
            </div>
            <p className="tg-stacknote">Solid chips are in the build today. Outlined chips are the next stage.</p>
          </Reveal>
        </div>
      </section>

      {/* CLOSE */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <div className="tg-links">
              <span className="tg-eyebrow">Next</span>
              <h2 className="tg-sign" style={{ marginTop: "0.9rem", fontSize: "clamp(1.9rem,1rem + 4vw,3.4rem)", color: "var(--ink)", maxWidth: "14ch", lineHeight: 1.02 }}>
                Pass the phone.
              </h2>
              <p>The next milestone is a friends alpha: a few real tables on real phones, then the database. I&apos;ll post it here when it&apos;s live.</p>
              <div className="tg-cta">
                <Link className="tg-key" href="/#projects">Back to projects</Link>
                {project.repoUrl && <a className="tg-key tg-key--ghost" href={project.repoUrl} target="_blank" rel="noopener noreferrer">Source code</a>}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OTHERS */}
      <section className="tg-foot">
        <div className="tg-wrap">
          <span className="tg-eyebrow">More work</span>
          <div className="tg-others">
            {others.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="tg-other">
                <b>{p.name}</b>
                <span>{p.pitch}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
