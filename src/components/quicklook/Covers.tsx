import Image from "next/image";

/**
 * Picture banners for the Quick Look project cards. Plain HTML/CSS over each
 * project's own colors, so they stay sharp and light. A project without one here
 * keeps the gradient + big letter cover.
 */

const mono = "font-[family-name:var(--font-mono)]";

/** Karela: the app's runner sprite on a running track, with a faded "ghost pacer" behind. */
function KarelaCover() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #7CF205 0%, #209F77 70%, #0f5a44 100%)" }}>
      {/* track lanes */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-black/25" />
      <div className="absolute inset-x-0 bottom-[38%] h-px bg-white/35" />
      <div className="absolute inset-x-0 bottom-[19%] h-px bg-white/15" />
      {/* speed streaks */}
      <span className="ql-streak absolute right-[36%] top-[30%] h-[3px] w-24 bg-white/40" />
      <span className="ql-streak absolute right-[40%] top-[46%] h-[2px] w-16 bg-white/30 [animation-delay:-0.4s]" />
      <span className="ql-streak absolute right-[34%] top-[58%] h-[2px] w-20 bg-white/25 [animation-delay:-0.8s]" />
      <span className="absolute left-5 top-1/2 w-[46%] max-w-[232px] -translate-y-1/2 bg-[#0b1f17]/85 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <Image src="/karela/karela_word-logo.png" alt="" width={360} height={63} className="block h-auto w-full" />
      </span>
      {/* ghost pacer, then the runner */}
      <span aria-hidden="true" className="ql-sprite absolute bottom-[14%] right-[24%] opacity-30 [filter:brightness(2)_saturate(0)] [--h:112px]" />
      <span aria-hidden="true" className="ql-sprite absolute bottom-[10%] right-[7%] [--h:136px]" />
      <span className={`absolute bottom-3 left-5 ${mono} text-[9px] uppercase tracking-[0.18em] text-black/55`}>Ghost pacing · GPS runs · AI coach</span>
    </div>
  );
}

/** Tag.Ai: three real screens fanned out like a hand of cards. */
function TagAiCover() {
  const shots = [
    { src: "/tagai/s-decks.webp", r: -12, x: "-58%", z: 1 },
    { src: "/tagai/s-play.webp", r: 0, x: "-50%", z: 3 },
    { src: "/tagai/s-pot.webp", r: 12, x: "-42%", z: 2 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #C93B96 0%, #FF8FCF 100%)" }}>
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, #000 0 2px, transparent 2px 14px)" }}
      />
      {shots.map((s, i) => (
        <div
          key={s.src}
          className="ql-fan absolute left-[64%] top-[16%] w-[26%] max-w-[118px] origin-bottom overflow-hidden rounded-[10px] border-2 border-black/80 shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
          style={{ zIndex: s.z, ["--r" as string]: `${s.r}deg`, ["--x" as string]: s.x, ["--i" as string]: i }}
        >
          <Image src={s.src} alt="" width={480} height={1038} sizes="120px" className="block h-auto w-full" />
        </div>
      ))}
      <span className={`absolute bottom-3 left-5 ${mono} text-[9px] uppercase tracking-[0.18em] text-black/60`}>Pass the phone · Online rooms</span>
    </div>
  );
}

export const COVERS: Record<string, () => React.JSX.Element> = {
  karela: KarelaCover,
  "tag-ai": TagAiCover,
};
