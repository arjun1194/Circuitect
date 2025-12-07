import { useRef } from 'react';

interface ExportImportButtonsProps {
    onExport: () => void;
    onImport: (json: string) => void;
}

export default function ExportImportButtons({ onExport, onImport }: ExportImportButtonsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result as string;
            if (json) {
                onImport(json);
            }
        };
        reader.readAsText(file);

        // Reset the input so the same file can be selected again
        e.target.value = '';
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onExport}
                className="px-3 py-1.5 text-xs text-[#7dcfff] border border-[#7dcfff] rounded hover:bg-[#7dcfff] hover:text-[#1a1c23] transition-colors"
                title="Export circuit as JSON file"
            >
                Export
            </button>
            <button
                onClick={handleImportClick}
                className="px-3 py-1.5 text-xs text-[#9ece6a] border border-[#9ece6a] rounded hover:bg-[#9ece6a] hover:text-[#1a1c23] transition-colors"
                title="Import circuit from JSON file"
            >
                Import
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
