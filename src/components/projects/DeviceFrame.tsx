interface DeviceFrameProps {
  variant: "mobile" | "desktop";
  gradient: [string, string];
  projectName: string;
}

export function DeviceFrame({
  variant,
  gradient,
  projectName,
}: DeviceFrameProps) {
  const aspectClass =
    variant === "mobile" ? "aspect-[9/19.5]" : "aspect-[16/10]";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border ${aspectClass}`}
    >
      {/* Placeholder gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        }}
      />

      {/* Device chrome hint */}
      {variant === "mobile" && (
        <div className="absolute top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-black/20" />
      )}

      {/* Project wordmark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white/90 drop-shadow-md md:text-xl">
          {projectName}
        </span>
      </div>
    </div>
  );
}
