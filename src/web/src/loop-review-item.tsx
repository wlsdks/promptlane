export function LoopReviewItem({
  footer,
  lines,
}: {
  footer: string;
  lines: readonly string[];
}) {
  return (
    <div className="loop-review-item">
      {lines.map((line) => (
        <p className="loops-status-line" key={line}>
          {line}
        </p>
      ))}
      <p className="loops-status-line">{footer}</p>
    </div>
  );
}
