"use client";

interface IntroCardProps {
  title: string;
  body: string;
  newKeys: string[];
  onContinue: () => void;
}

export function IntroCard({ title, body, newKeys, onContinue }: IntroCardProps) {
  return (
    <section
      className="flex w-full max-w-lg flex-col gap-8"
      data-testid="lesson-intro"
    >
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-[0.2em] text-legend uppercase">
          Introduce
        </p>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        <p className="text-base leading-relaxed text-legend">{body}</p>
      </div>
      {newKeys.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="New keys">
          {newKeys.map((key) => (
            <span
              key={key}
              className="inline-flex min-w-12 items-center justify-center rounded-lg bg-keycap px-3 py-2 font-mono text-2xl text-ink"
            >
              {key === " " ? "space" : key}
            </span>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onContinue}
        className="w-fit rounded-full bg-ink px-6 py-3 font-display text-desk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bump"
      >
        Start typing
      </button>
    </section>
  );
}
