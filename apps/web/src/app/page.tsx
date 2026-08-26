import { WORLD_IDS } from "@keypath/curriculum";
import { PACKAGE_NAME as engineName } from "@keypath/typing-engine";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-start justify-center gap-4 px-8 py-16 font-sans">
      <p className="font-mono text-sm text-zinc-500">Phase 0</p>
      <h1 className="text-3xl font-semibold tracking-tight">Keypath</h1>
      <p className="max-w-md text-zinc-600">
        Monorepo toolchain is up. Lesson UI starts in Phase 2. Typing engine work starts
        in Phase 1.
      </p>
      <p className="font-mono text-xs text-zinc-400">
        {engineName} · {WORLD_IDS.length} worlds registered
      </p>
    </main>
  );
}
