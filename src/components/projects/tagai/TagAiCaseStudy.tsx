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
  { n: "1", tab: "Pick decks", title: "Pick your decks", text: "Tick as many decks as the night needs. Cards that show up in more than one deck are only used once, and you can add your own decks and liked cards to the mix." },
  { n: "2", tab: "Set the pot", title: "Set the pot", text: "One coin is one card, and the pot decides how long the game runs. Wild cards are free. When the cards run out, the table can add more." },
  { n: "3", tab: "Take your seats", title: "Who sits where", text: "Tap names in the order people sit around the table. Seat 1 plays first, and the turns go clockwise, so nobody argues about who is next." },
  { n: "4", tab: "Agree on rules", title: "Agree on the house rules", text: "Pick the topics to leave out for everyone, then each player taps their own name to agree. Nobody has to explain why a topic is off the table." },
];

const DECISIONS = [
  { deck: "barkada", t: "Signboard, not app", p: "Bungee headlines like a jeepney sign, a condensed heavy body, hazard stripes and chunky keys. It looks like something off a Manila street, not a startup template." },
  { deck: "icebreaker", t: "One colour per deck", p: "Every deck has its own flat colour, so you know what kind of question is coming before you read a word. Colour always means something." },
  { deck: "spicy", t: "Big where it counts", p: "Menus stay compact. The game screen goes huge: big card text, big buttons, an undo. It has to work at midnight with one hand." },
  { deck: "lovers", t: "Nobody is cornered", p: "Topics can be left out before the game starts, anyone can skip, and the 18+ deck sits behind an age check. Your birth date is used once and never stored." },
  { deck: "deep", t: "Smooth on cheap phones", p: "Motion runs on the compositor only: dealt cards, flips and slides. It stays smooth on mid-range phones and respects reduced motion." },
  { deck: "life", t: "One phone or many", p: "It started as one phone passed around a table. Friends can now join from their own phones while one phone runs the game." },
];

const BUILT = [
  "The full game: setup, seating, house rules, play, recap",
  "Decks with their own colours, plus wild cards and rule cards",
  "Dice, coin, bottle, wheel, timer and vote cards, free to use",
  "Accounts, coins and a shop on a live database",
  "Online rooms: join by code or QR, one shared pot, one phone runs the game",
  "Friends, an inbox, invite links and a community cards feed",
  "Your own decks, liked cards and a Topic deck for talking",
  "An admin screen for cards, suggestions and coins",
];
const TODO = [
  "More friends playing real games, then fixing what breaks",
  "Paying by QR works, but coins are added by hand. Automatic payments come later",
  "Sign-in emails sent from our own address",
  "True offline play",
  "Filipino-language text",
  "More cards, more decks, more of the Philippines in them",
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
          <b>{deck.name}.</b> {deck.blurb} <b>1 coin</b> a card from the pot.
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
  const [log, setLog] = useState("Higher heat means bolder cards next. Press a button to see it move.");

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
            {st.tab}
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
                [["icebreaker", "Icebreaker", false], ["barkada", "Barkada", true], ["lovers", "Lovers", false], ["spicy", "Spicy", true]] as [string, string, boolean][]
              ).map(([id, name, on]) => (
                <div className="tg-mini__row" data-deck={id} data-on={on} key={id}>
                  <i />
                  <span>{name}</span>
                  <u aria-hidden>{on ? "✓" : ""}</u>
                </div>
              ))}
              <p className="tg-note">Example picks. Your own decks and liked cards sit above the built-in ones.</p>
            </div>
          )}
          {n === 1 && (
            <div className="tg-potbox">
              <div className="tg-potbox__num"><u aria-hidden>−</u><b>10</b><u aria-hidden>+</u></div>
              <p className="tg-potbox__sub">coins, 10 cards</p>
              <div className="tg-potbox__pre" aria-hidden>
                {[10, 20, 30, 50, 100].map((v, i) => <span key={v} data-on={i === 0}>{v}</span>)}
              </div>
              <p className="tg-note">Wild cards are free on top.</p>
            </div>
          )}
          {n === 2 && (
            <div className="tg-seats" aria-label="Three players seated around a table">
              <i className="tg-seats__ring" />
              <span className="tg-seat" style={{ left: "50%", top: "6%" }} data-deck="barkada"><b>R</b><em>1</em><small>Randel</small></span>
              <span className="tg-seat" style={{ left: "86%", top: "62%" }} data-deck="family"><b>M</b><em>2</em><small>Mark</small></span>
              <span className="tg-seat" style={{ left: "14%", top: "62%" }} data-deck="lovers"><b>K</b><em>3</em><small>Kenneth</small></span>
              <span className="tg-seats__mid">Ready</span>
            </div>
          )}
          {n === 3 && (
            <div>
              {[["Politics", true], ["Exes", true], ["Money", false], ["Family", false], ["Work", false], ["Religion", true]].map(([t, skip]) => (
                <span className="tg-tag" data-skip={skip as boolean} key={t as string}>{t as string}</span>
              ))}
              <p className="tg-note">Crossed out topics never make it into the game.</p>
              <div className="tg-agree" aria-hidden>
                {[["R", "barkada"], ["M", "family"], ["K", "lovers"]].map(([l, d]) => (
                  <span data-deck={d} key={l}>{l}<i>✓</i></span>
                ))}
                <small>Everyone taps to agree</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RoomDemo() {
  const FRIENDS = [
    { n: "Rap", d: "family" },
    { n: "Yhen", d: "lovers" },
    { n: "Rhian", d: "life" },
  ];
  const TARGET = 10;
  const [paid, setPaid] = useState<Record<string, boolean>>({});
  const total = Object.values(paid).filter(Boolean).length * 5;
  const full = total >= TARGET;
  return (
    <div className="tg-room">
      <div className="tg-room__code" aria-label="Example room code">
        <span>Room code</span>
        <b>K7M2QX</b>
        <small>example</small>
      </div>
      <p className="tg-room__q">Tap a friend to chip in 5 coins. Tap again to take them back.</p>
      <div className="tg-room__row">
        {FRIENDS.map((f) => (
          <button key={f.n} type="button" className="tg-room__f" data-deck={f.d} aria-pressed={!!paid[f.n]} onClick={() => setPaid((p) => ({ ...p, [f.n]: !p[f.n] }))}>
            <i>{f.n[0]}</i>
            <span>{f.n}</span>
            <small>{paid[f.n] ? "+5" : "5"}</small>
          </button>
        ))}
      </div>
      <div className="tg-room__bar" role="progressbar" aria-valuemin={0} aria-valuemax={TARGET} aria-valuenow={Math.min(total, TARGET)} aria-label="Pot filled">
        <i style={{ width: `${Math.min(100, (total / TARGET) * 100)}%` }} data-full={full} />
      </div>
      <p className="tg-room__num"><b>{Math.min(total, TARGET)}</b> / {TARGET} coins in the pot</p>
      <button type="button" className={`tg-key ${full ? "tg-key--accent" : ""}`} disabled={!full} style={{ width: "100%", opacity: full ? 1 : 0.45 }}>
        {full ? "Host can start the game" : "Waiting for the pot"}
      </button>
    </div>
  );
}

const WHEEL = ["Funny face", "Tell a joke", "Animal sound", "Spin again", "High five", "Free pass"];
const PLAYERS = [
  { n: "Randel", l: "R", d: "barkada" },
  { n: "Mark", l: "M", d: "family" },
  { n: "Kenneth", l: "K", d: "lovers" },
];

function Tools() {
  const [die, setDie] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [coin, setCoin] = useState<number | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [bottle, setBottle] = useState({ deg: 0, hit: -1, spinning: false });
  const [wheel, setWheel] = useState({ deg: 0, hit: -1, spinning: false });
  const [left, setLeft] = useState<number | null>(null);
  const [voteN, setVoteN] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const ticker = useRef<number | null>(null);
  const voter = useRef<number | null>(null);
  useEffect(() => () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    if (ticker.current) window.clearInterval(ticker.current);
    if (voter.current) window.clearInterval(voter.current);
  }, []);

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
  const spinBottle = () => {
    if (bottle.spinning) return;
    const hit = Math.floor(Math.random() * PLAYERS.length);
    // the bottle points up at 0deg; players sit at 0, 120 and 240 degrees
    const deg = bottle.deg + 360 * 3 + (hit * 120 - (bottle.deg % 360) + 360) % 360;
    setBottle({ deg, hit: -1, spinning: true });
    timers.current.push(window.setTimeout(() => setBottle({ deg, hit, spinning: false }), reduced() ? 0 : 2400));
  };
  const spinWheel = () => {
    if (wheel.spinning) return;
    const hit = Math.floor(Math.random() * WHEEL.length);
    // segment i is centred at i*60 degrees; the pointer sits at the top
    const target = (360 - hit * 60) % 360;
    const deg = wheel.deg + 360 * 4 + ((target - (wheel.deg % 360) + 360) % 360);
    setWheel({ deg, hit: -1, spinning: true });
    timers.current.push(window.setTimeout(() => setWheel({ deg, hit, spinning: false }), reduced() ? 0 : 3200));
  };
  const startTimer = () => {
    if (ticker.current) window.clearInterval(ticker.current);
    setLeft(30);
    ticker.current = window.setInterval(() => {
      setLeft((v) => {
        if (v === null || v <= 1) {
          if (ticker.current) window.clearInterval(ticker.current);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };
  const startVote = () => {
    if (voter.current) window.clearInterval(voter.current);
    setVoteN(3);
    voter.current = window.setInterval(() => {
      setVoteN((v) => {
        if (v === null || v <= 0) {
          if (voter.current) window.clearInterval(voter.current);
          return 0;
        }
        return v - 1;
      });
    }, 900);
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

      <div className="tg-tool" data-deck="barkada">
        <span className="tg-sign">Bottle</span>
        <p className="tg-tool__q">Spin the bottle. Say one thing you like about the player it lands on.</p>
        <div className="tg-tool__stage tg-tool__stage--tall">
          <div className="tg-bottle">
            {PLAYERS.map((p, i) => (
              <span key={p.n} className="tg-bottle__p" data-hit={bottle.hit === i} style={{ ["--a" as string]: `${i * 120}deg` }}>
                <b data-deck={p.d}>{p.l}</b>
              </span>
            ))}
            <svg className="tg-bottle__b" viewBox="0 0 40 120" width="40" height="120" style={{ transform: `rotate(${bottle.deg}deg)`, transition: bottle.spinning && !reduced() ? "transform 2.4s cubic-bezier(0.15, 0.7, 0.15, 1)" : "none" }} aria-hidden>
              <path d="M16 4h8v6c0 6 8 10 8 22v76a8 8 0 01-8 8H16a8 8 0 01-8-8V32c0-12 8-16 8-22V4z" fill="currentColor" />
              <path d="M16 4h8v14h-8z" fill="rgb(24 19 16)" opacity="0.35" />
            </svg>
          </div>
        </div>
        <p className="tg-tool__out" aria-live="polite">{bottle.hit >= 0 && !bottle.spinning ? `It landed on ${PLAYERS[bottle.hit].n}. Say one thing you like about them.` : "Spin to find out."}</p>
        <button type="button" className="tg-key" onClick={spinBottle}>{bottle.spinning ? "Spinning…" : "Spin"}</button>
      </div>

      <div className="tg-tool" data-deck="lovers">
        <span className="tg-sign">Wheel</span>
        <p className="tg-tool__q">Spin the wheel and do what it says.</p>
        <div className="tg-tool__stage tg-tool__stage--tall">
          <div className="tg-wheelwrap">
            <i className="tg-wheelwrap__pin" aria-hidden />
            <div
              className="tg-wheel"
              style={{
                background: `conic-gradient(from -30deg, ${WHEEL.map((_, i) => `var(--w${i}) ${i * 60}deg ${(i + 1) * 60}deg`).join(", ")})`,
                transform: `rotate(${wheel.deg}deg)`,
                transition: wheel.spinning && !reduced() ? "transform 3.2s cubic-bezier(0.15, 0.7, 0.15, 1)" : "none",
              }}
              aria-hidden
            />
          </div>
        </div>
        <p className="tg-tool__out" aria-live="polite">{wheel.hit >= 0 && !wheel.spinning ? `${WHEEL[wheel.hit]}.` : "Spin to find out."}</p>
        <button type="button" className="tg-key" onClick={spinWheel}>{wheel.spinning ? "Spinning…" : "Spin"}</button>
      </div>

      <div className="tg-tool" data-deck="icebreaker">
        <span className="tg-sign">Timer</span>
        <p className="tg-tool__q">You have 30 seconds. Name as many Filipino foods as you can.</p>
        <div className="tg-tool__stage">
          <div className="tg-clock" data-low={left !== null && left > 0 && left <= 5} data-done={left === 0}>
            <b aria-live="off">{left === null ? 30 : left}</b>
            <small>{left === 0 ? "Time's up" : "seconds"}</small>
          </div>
        </div>
        <p className="tg-tool__out" aria-live="polite">{left === 0 ? "Time's up. The group counts the foods." : left === null ? "Start the clock when you're ready." : "Go go go."}</p>
        <button type="button" className="tg-key" onClick={startTimer}>{left === null ? "Start" : "Start again"}</button>
      </div>

      <div className="tg-tool" data-deck="family">
        <span className="tg-sign">Vote</span>
        <p className="tg-tool__q">Who here has the best laugh? Count down and point.</p>
        <div className="tg-tool__stage">
          <div className="tg-vote">
            {voteN === null ? (
              <div className="tg-vote__row">
                {PLAYERS.map((p) => <b key={p.n} data-deck={p.d}>{p.l}</b>)}
              </div>
            ) : voteN > 0 ? (
              <span className="tg-vote__n" key={voteN}>{voteN}</span>
            ) : (
              <span className="tg-vote__go">Point!</span>
            )}
          </div>
        </div>
        <p className="tg-tool__out" aria-live="polite">{voteN === 0 ? "Most fingers wins and picks someone to take a drink." : voteN === null ? "Everybody points at the same time." : "Get ready…"}</p>
        <button type="button" className="tg-key" onClick={startVote}>{voteN === null ? "Count down" : "Again"}</button>
      </div>
    </div>
  );
}

const SHOTS = [
  { src: "/tagai/s-home.webp", t: "Home", d: "Deal in, or join a room." },
  { src: "/tagai/s-decks.webp", t: "Pick decks", d: "Tick as many as you like." },
  { src: "/tagai/s-pot.webp", t: "The pot", d: "One coin, one card." },
  { src: "/tagai/s-seats.webp", t: "Seats", d: "Tap names clockwise." },
  { src: "/tagai/s-deal.webp", t: "Your turn", d: "Face down until you tap." },
  { src: "/tagai/s-play.webp", t: "The card", d: "Big text, clear drink line." },
];

/* ---------- page ---------- */


const MARQUEE = ["Icebreaker", "Family", "Life", "Deep", "Barkada", "Lovers", "Spicy", "Chaos"];
const MARQUEE_DECK = ["icebreaker", "family", "life", "deep", "barkada", "lovers", "spicy", "chaos"];

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
              <h1 className="tg-sign tg-title">
                Tag<span>.Ai</span>
              </h1>
              <p className="tg-tagline">Pass the phone. Answer the card. <s>Take the shot.</s></p>
              <p className="tg-lead tg-sub">{project.pitch}</p>
              <div className="tg-cta">
                <a className="tg-key tg-key--accent" href="#play">Deal me a card</a>
                {project.liveUrl && (
                  <a className="tg-key tg-key--ghost" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Try the early beta <Arrow /></a>
                )}
                {project.repoUrl && (
                  <a className="tg-key tg-key--ghost" href={project.repoUrl} target="_blank" rel="noopener noreferrer">Source code <Arrow /></a>
                )}
              </div>
            </div>
            <div className="tg-fan" aria-hidden>
              {(
                [["icebreaker", -28, "-44%"], ["family", -14, "-22%"], ["barkada", 0, "0%"], ["lovers", 14, "22%"], ["spicy", 28, "44%"]] as [string, number, string][]
              ).map(([d, r, x], i) => (
                <div className="tg-fan__card" data-deck={d} key={d} style={{ ["--r" as string]: `${r}deg`, ["--x" as string]: x, ["--i" as string]: i }}>
                  <b>Tag.ai</b>
                  <em>?</em>
                </div>
              ))}
              <span className="tg-fan__tag">one phone, one table</span>
            </div>
          </div>
        </div>
      </section>

      <div className="tg-belt" aria-hidden>
        <div className="tg-belt__track">
          {[0, 1].map((k) => (
            <div className="tg-belt__set" key={k}>
              {MARQUEE.map((m, i) => (
                <span data-deck={MARQUEE_DECK[i]} key={m + k}>{m}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FACTS */}
      <div className="tg-wrap" style={{ paddingTop: "clamp(2rem,5vw,3rem)" }}>
        <Reveal>
          <dl className="tg-facts">
            {[
              ["Role", project.role],
              ["Team", project.teamSize],
              ["Platform", "Web app, phone first"],
              ["Status", "Early beta, being tested"],
            ].map(([k, v]) => (
              <div className="tg-fact" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* IDEA: yellow band */}
      <section className="tg-section tg-band tg-band--yellow">
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">The idea</span>
            <h2 className="tg-h2">A drinking game that makes you <em>look up</em> from your phone.</h2>
            <p className="tg-lead">One phone goes around the table. Whoever holds it draws a card and the whole group has to look at them, not at a screen. Built for Filipino barkadas, ages 18 to 30.</p>
          </Reveal>
        </div>
      </section>
      <div className="tg-trim" aria-hidden />

      {/* PLAYGROUND */}
      <section className="tg-section" id="play">
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Try it</span>
            <h2 className="tg-h2">Pick a deck. <em>Deal a card.</em></h2>
            <p className="tg-lead">Every deck has its own colour and its own kind of question. This is the real card face from the game, running right here.</p>
          </Reveal>
          <Playground />
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

      {/* ONLINE: pink band */}
      <section className="tg-section tg-band tg-band--pink">
        <div className="tg-wrap">
          <div className="tg-twocol">
            <Reveal>
              <span className="tg-eyebrow">Own phones, same table</span>
              <h2 className="tg-h2">Friends can <em>join from their own phones.</em></h2>
              <p className="tg-lead">Share a room code, a QR or an invite link. Everyone chips coins into one pot from their own wallet, one phone runs the game, and the rest watch it live. If that phone drops, another one takes over.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <RoomDemo />
            </Reveal>
          </div>
        </div>
      </section>
      <div className="tg-trim tg-trim--red" aria-hidden />

      {/* HEAT */}
      <section className="tg-section">
        <div className="tg-wrap">
          <div className="tg-engine">
            <Reveal>
              <span className="tg-eyebrow">The heat</span>
              <h2 className="tg-h2">The game reads the table and <em>turns it up.</em></h2>
              <p className="tg-lead">The heat decides how bold the next card is. Low heat draws light, easy questions. High heat draws the spicy ones. It moves with how the table plays: finishing or saving cards raises it, skipping cools it, and three skips in a row drops a whole level. So a shy group gets eased in and a loud one gets pushed. Short games move faster, and Family stays gentle.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <HeatDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Cards that bring their own tool</span>
            <h2 className="tg-h2">Nobody has to <em>find a dice.</em></h2>
            <p className="tg-lead">Dice, coin, bottle, wheel, timer and vote cards open on their own full-screen stage, so the table just follows the result. All six tools are free, and all of them work below.</p>
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

      {/* COMMUNITY */}
      <section className="tg-section tg-band tg-band--blue">
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Made by the barkada</span>
            <h2 className="tg-h2">Write cards. <em>Cheer the good ones.</em></h2>
            <p className="tg-lead">Players post their own cards to a shared feed, cheer the ones they love, and save favourites into decks of their own. Those decks can go straight into your next game.</p>
          </Reveal>
          <div className="tg-trio">
            {[
              ["Post", "Write a card in a few taps: pick its type, its deck, then type your words onto it."],
              ["Cheer", "One cheer per card. The best ones rise to the top of the feed."],
              ["Collect", "Save cards into your own decks and play from them."],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.07}>
                <div className="tg-trio__c"><b>{t}</b><p>{d}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <div className="tg-trim" aria-hidden />

      {/* REAL SCREENS */}
      <section className="tg-section">
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">From the build</span>
            <h2 className="tg-h2">Real screens, <em>demo players.</em></h2>
            <p className="tg-lead">Screenshots from the game running on my machine with made-up players.</p>
          </Reveal>
          <div className="tg-shots">
            {SHOTS.map((s, i) => (
              <Reveal key={s.src} delay={i * 0.05} className="tg-shot">
                <figure>
                  <div className="tg-shot__frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.src} alt={`Tag.ai screen: ${s.t}`} width={480} height={1038} loading="lazy" decoding="async" />
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
            <p className="tg-18">Tag.Ai is for adults. The 18+ deck needs every player to confirm they are 18 or older. Please drink responsibly.</p>
          </Reveal>
        </div>
      </section>

      {/* STATUS */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Where it stands</span>
            <h2 className="tg-h2">Playable, early, and <em>still being built.</em></h2>
          </Reveal>
          <div className="tg-board">
            <Reveal>
              <div className="tg-col tg-col--done">
                <h3 className="tg-h3"><span className="tg-sign">Working today</span></h3>
                <ul>{BUILT.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="tg-col tg-col--todo">
                <h3 className="tg-h3"><span className="tg-sign">What we&apos;re working on</span></h3>
                <ul>{TODO.map((b) => <li key={b}>{b}</li>)}</ul>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <p className="tg-honest">It is an early beta. A few friends have played it so far, and I&apos;m fixing what they find before inviting more people.</p>
          </Reveal>
        </div>
      </section>

      {/* STACK */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <span className="tg-eyebrow">Stack</span>
            <div className="tg-stack" aria-label="Tech stack">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand", "Supabase", "Vitest"].map((t) => <span key={t}>{t}</span>)}
              <span className="is-plan">PayMongo · planned</span>
            </div>
            <p className="tg-stacknote">Solid chips are in use today. The outlined chip is next.</p>
          </Reveal>
        </div>
      </section>

      {/* CLOSE */}
      <section className="tg-section" style={{ paddingTop: 0 }}>
        <div className="tg-wrap">
          <Reveal>
            <div className="tg-links">
              <span className="tg-eyebrow">Your turn</span>
              <h2 className="tg-sign tg-links__h">Pass the phone.</h2>
              <p>The early beta is open to try on your phone. Expect rough edges, and tell me what breaks.</p>
              <div className="tg-cta">
                {project.liveUrl && <a className="tg-key" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Try the early beta <Arrow /></a>}
                <Link className="tg-key tg-key--ghost" href="/#projects">Back to projects</Link>
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
