import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { IconButton } from './primitives';

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
        <div className="flex items-center gap-0.5">
            <IconButton label="Export circuit as JSON" onClick={onExport}>
                <Download size={18} />
            </IconButton>
            <IconButton label="Import circuit from JSON" onClick={handleImportClick}>
                <Upload size={18} />
            </IconButton>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
