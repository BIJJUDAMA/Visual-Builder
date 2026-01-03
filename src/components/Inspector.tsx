import type { UIComponent } from '../types/builder';

interface Props {
    selectedComponent: UIComponent | null;
    updateStyles: (id: string, newStyles: any) => void;
    updateContent: (id: string, content: string) => void;
    readOnly?: boolean;
}

export function Inspector({ selectedComponent, updateStyles, updateContent, readOnly }: Props) {
    if (!selectedComponent) {
        return (
            <div className="p-6 text-center text-neutral-600">
                <p className="text-sm">Select a component to edit</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-5">
            <header>
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Properties</h3>
                <p className="text-[10px] text-neutral-700 font-mono mt-1">{selectedComponent.id}</p>
            </header>

            {/* Content Editor */}
            <div>
                <label className="block text-xs font-medium mb-2 text-neutral-500 uppercase tracking-wide">Content</label>
                <input
                    type="text"
                    value={selectedComponent.content || ''}
                    onChange={(e) => updateContent(selectedComponent.id, e.target.value)}
                    disabled={readOnly}
                    className="w-full p-2.5 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:border-neutral-600 outline-none disabled:opacity-50"
                />
            </div>

            {/* Style Editor */}
            <div className="space-y-4 pt-4 border-t border-neutral-900">
                <div>
                    <label className="block text-xs font-medium mb-2 text-neutral-500 uppercase tracking-wide">Background</label>
                    <input
                        type="color"
                        value={selectedComponent.styles.backgroundColor || '#ffffff'}
                        onChange={(e) => updateStyles(selectedComponent.id, { backgroundColor: e.target.value })}
                        className="w-full h-9 cursor-pointer rounded-lg overflow-hidden border border-neutral-800 disabled:opacity-50"
                        disabled={readOnly}
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium mb-2 text-neutral-500 uppercase tracking-wide">Padding</label>
                    <input
                        type="text"
                        placeholder="e.g. 20px"
                        value={selectedComponent.styles.padding || ''}
                        onChange={(e) => updateStyles(selectedComponent.id, { padding: e.target.value })}
                        className="w-full p-2.5 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-700 disabled:opacity-50"
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>
    );
}