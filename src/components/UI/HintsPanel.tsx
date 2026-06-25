interface HintsPanelProps {
    hints: string[];
    hintsShown: number;
}

export default function HintsPanel({ hints, hintsShown }: HintsPanelProps) {
    if (hintsShown === 0) return null;

    return (
        <div className="mt-3 rounded-lg border-l-2 border-accent bg-accent/10 p-3 text-xs text-text">
            <strong className="mb-1 block font-medium text-accent">Hints</strong>
            <ul className="list-inside list-disc space-y-1 text-muted">
                {hints.slice(0, hintsShown).map((hint, i) => (
                    <li key={i}>{hint}</li>
                ))}
            </ul>
        </div>
    );
}
