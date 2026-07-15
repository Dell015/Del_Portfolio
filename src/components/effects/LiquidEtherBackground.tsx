"use client";

import dynamic from "next/dynamic";

const LiquidEther = dynamic(() => import("./LiquidEther"), { ssr: false });

export function LiquidEtherBackground() {
  return (
    <div
      className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--bg) 0%, #1a0a0a 50%, var(--bg) 100%)" }}
    >
      <div className="absolute inset-0">
        <LiquidEther
          colors={["#7c0015", "#F43F5E", "#F97316"]}
          mouseForce={15}
          cursorSize={80}
          isViscous={false}
          viscous={20}
          iterationsViscous={16}
          iterationsPoisson={16}
          resolution={0.3}
          isBounce={false}
          autoDemo
          autoSpeed={0.6}
          autoIntensity={2.5}
          takeoverDuration={0.25}
          autoResumeDelay={500}
          autoRampDuration={0.3}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
