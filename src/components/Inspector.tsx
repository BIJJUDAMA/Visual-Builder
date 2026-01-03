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
            <div className="p-8 text-center text-slate-400">
                <p className="text-sm italic">Select a component on the canvas to edit its properties.</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <header>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Properties</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedComponent.id}</p>
            </header>

            {/* Content Editor */}
            <div>
                <label className="block text-xs font-semibold mb-2">Content</label>
                <input
                    type="text"
                    value={selectedComponent.content || ''}
                    onChange={(e) => updateContent(selectedComponent.id, e.target.value)}
                    disabled={readOnly}
                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                />
            </div>

            {/* Style Editor */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-500 uppercase">Background</label>
                    <input
                        type="color"
                        value={selectedComponent.styles.backgroundColor || '#ffffff'}
                        onChange={(e) => updateStyles(selectedComponent.id, { backgroundColor: e.target.value })}
                        className="w-full h-8 cursor-pointer rounded overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={readOnly}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-500 uppercase">Padding</label>
                    <input
                        type="text"
                        placeholder="e.g. 20px"
                        value={selectedComponent.styles.padding || ''}
                        onChange={(e) => updateStyles(selectedComponent.id, { padding: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded text-sm disabled:bg-slate-50 disabled:text-slate-400"
                        disabled={readOnly}
                    />
                </div>
            </div>
        </div>
    );
}