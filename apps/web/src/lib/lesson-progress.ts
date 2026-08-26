const STORAGE_KEY = "keypath.progress.v1";
const CHANGE_EVENT = "keypath-progress";

interface ProgressPayload {
  version: 1;
  stars: Record<string, number>;
}

function emptyStars(): Record<string, number> {
  return {};
}

export function readStars(): Record<string, number> {
  if (typeof window === "undefined") {
    return emptyStars();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyStars();
    }
    const parsed = JSON.parse(raw) as ProgressPayload;
    if (parsed.version !== 1 || typeof parsed.stars !== "object" || parsed.stars === null) {
      return emptyStars();
    }
    return parsed.stars;
  } catch {
    return emptyStars();
  }
}

export function recordStars(lessonId: string, stars: number): void {
  const current = readStars();
  const next = { ...current, [lessonId]: Math.max(current[lessonId] ?? 0, stars) };
  const payload: ProgressPayload = { version: 1, stars: next };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeProgress(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
