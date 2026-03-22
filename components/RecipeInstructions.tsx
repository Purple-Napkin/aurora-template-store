/** Split "1. … 2. …" when the API returns one paragraph instead of newlines. */
function instructionLines(text: string): string[] {
  const raw = text.replace(/\r\n/g, "\n").trim();
  if (!raw) return [];
  const byNewline = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  const one = byNewline[0] ?? raw;
  const splitSteps = one
    .split(/(?=\s\d{1,3}[.)]\s+)/g)
    .map((p) => p.trim())
    .filter(Boolean);
  if (splitSteps.length > 1 && splitSteps.every((p) => /^\d{1,3}[.)]\s+/.test(p))) {
    return splitSteps;
  }
  return [one];
}

/**
 * Renders kit / combo instructions: numbered lines become an ordered list;
 * otherwise preserves line breaks / paragraphs.
 */
export function RecipeInstructions({ text, className = "" }: { text: string; className?: string }) {
  const lines = instructionLines(text);

  const numbered = lines.filter((l) => /^\d{1,3}[.)]\s+/.test(l));
  const allNumbered = lines.length > 0 && numbered.length === lines.length;

  if (allNumbered) {
    return (
      <ol className={`list-decimal list-outside space-y-2 pl-5 text-aurora-text ${className}`.trim()}>
        {lines.map((line, i) => (
          <li key={i} className="pl-1 marker:font-semibold">
            {line.replace(/^\d{1,3}[.)]\s+/, "").trim()}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={`space-y-3 whitespace-pre-wrap text-aurora-text ${className}`.trim()}>{text.trim()}</div>
  );
}

