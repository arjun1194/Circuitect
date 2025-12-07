interface HintsPanelProps {
    hints: string[];
    hintsShown: number;
}

export default function HintsPanel({ hints, hintsShown }: HintsPanelProps) {
    if (hintsShown === 0) return null;

    return (
        <div className="mt-3 bg-[#7aa2f7]/10 border-l-4 border-[#7aa2f7] p-3 rounded text-xs text-[#7aa2f7]">
            <strong className="block mb-1">Hints:</strong>
            <ul className="list-disc list-inside space-y-1">
                {hints.slice(0, hintsShown).map((hint, i) => (
                    <li key={i}>{hint}</li>
                ))}
            </ul>
        </div>
    );
}
