import type { UIComponent } from '../types/builder';

interface Props {
    selectedComponent: UIComponent | null;
    updateStyles: (id: string, newStyles: any) => void;
    updateContent: (id: string, content: string) => void;
    updateImageSrc?: (id: string, src: string) => void;
    updateLinkUrl?: (id: string, url: string) => void;
    readOnly?: boolean;
}

export function Inspector({ selectedComponent, updateStyles, updateContent, updateImageSrc, updateLinkUrl, readOnly }: Props) {
    if (!selectedComponent) {
        return (
            <div className="p-6 text-center text-neutral-600">
                <p className="text-sm">Select a component to edit</p>
            </div>
        );
    }

    const showImageUrl = ['Image', 'MemberCard', 'EventCard', 'Hero'].includes(selectedComponent.type);
    const showLinkUrl = ['Button'].includes(selectedComponent.type);

    return (
        <div className="p-4 space-y-4">
            <header>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white uppercase">{selectedComponent.type}</span>
                    <span className="text-[10px] text-neutral-700 font-mono">{selectedComponent.id}</span>
                </div>
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
                    placeholder="Enter content..."
                />
                {selectedComponent.type === 'Navbar' && (
                    <p className="text-[10px] text-neutral-600 mt-1">Format: Logo|Link1,Link2,Link3|CTA</p>
                )}
                {selectedComponent.type === 'Card' && (
                    <p className="text-[10px] text-neutral-600 mt-1">Format: Title|Description|Button</p>
                )}
            </div>

            {/* Image URL */}
            {showImageUrl && updateImageSrc && (
                <div>
                    <label className="block text-xs font-medium mb-2 text-neutral-500 uppercase tracking-wide">Image URL</label>
                    <input
                        type="url"
                        value={selectedComponent.imageSrc || ''}
                        onChange={(e) => updateImageSrc(selectedComponent.id, e.target.value)}
                        disabled={readOnly}
                        className="w-full p-2.5 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:border-neutral-600 outline-none disabled:opacity-50"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            )}

            {/* Link URL */}
            {showLinkUrl && updateLinkUrl && (
                <div>
                    <label className="block text-xs font-medium mb-2 text-neutral-500 uppercase tracking-wide">Link URL</label>
                    <input
                        type="url"
                        value={selectedComponent.linkUrl || ''}
                        onChange={(e) => updateLinkUrl(selectedComponent.id, e.target.value)}
                        disabled={readOnly}
                        className="w-full p-2.5 bg-black border border-neutral-800 rounded-lg text-sm text-white focus:border-neutral-600 outline-none disabled:opacity-50"
                        placeholder="https://example.com"
                    />
                </div>
            )}

            {/* Style Editor */}
            <div className="space-y-3 pt-4 border-t border-neutral-900">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Styles</p>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[10px] text-neutral-600 mb-1">Background</label>
                        <input
                            type="color"
                            value={selectedComponent.styles.backgroundColor || '#ffffff'}
                            onChange={(e) => updateStyles(selectedComponent.id, { backgroundColor: e.target.value })}
                            className="w-full h-8 cursor-pointer rounded overflow-hidden border border-neutral-800 disabled:opacity-50"
                            disabled={readOnly}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] text-neutral-600 mb-1">Text Color</label>
                        <input
                            type="color"
                            value={selectedComponent.styles.color || '#ffffff'}
                            onChange={(e) => updateStyles(selectedComponent.id, { color: e.target.value })}
                            className="w-full h-8 cursor-pointer rounded overflow-hidden border border-neutral-800 disabled:opacity-50"
                            disabled={readOnly}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] text-neutral-600 mb-1">Padding</label>
                    <input
                        type="text"
                        placeholder="e.g. 20px"
                        value={selectedComponent.styles.padding || ''}
                        onChange={(e) => updateStyles(selectedComponent.id, { padding: e.target.value })}
                        className="w-full p-2 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-700 disabled:opacity-50"
                        disabled={readOnly}
                    />
                </div>

                <div>
                    <label className="block text-[10px] text-neutral-600 mb-1">Border Radius</label>
                    <input
                        type="text"
                        placeholder="e.g. 8px"
                        value={selectedComponent.styles.borderRadius || ''}
                        onChange={(e) => updateStyles(selectedComponent.id, { borderRadius: e.target.value })}
                        className="w-full p-2 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-700 disabled:opacity-50"
                        disabled={readOnly}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[10px] text-neutral-600 mb-1">Width</label>
                        <input
                            type="text"
                            placeholder="100% or 200px"
                            value={selectedComponent.styles.width || ''}
                            onChange={(e) => updateStyles(selectedComponent.id, { width: e.target.value })}
                            className="w-full p-2 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-700 disabled:opacity-50"
                            disabled={readOnly}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-neutral-600 mb-1">Height</label>
                        <input
                            type="text"
                            placeholder="auto or 200px"
                            value={selectedComponent.styles.height || ''}
                            onChange={(e) => updateStyles(selectedComponent.id, { height: e.target.value })}
                            className="w-full p-2 bg-black border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-700 disabled:opacity-50"
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}