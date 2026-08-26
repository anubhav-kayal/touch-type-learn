const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function segmentGraphemes(text: string): string[] {
  const normalized = text.normalize("NFC");
  if (segmenter) {
    return [...segmenter.segment(normalized)].map((part) => part.segment);
  }
  return Array.from(normalized);
}

export function firstGrapheme(text: string): string | null {
  const graphemes = segmentGraphemes(text);
  return graphemes[0] ?? null;
}
