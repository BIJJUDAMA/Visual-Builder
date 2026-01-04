import { useState, useRef, useEffect } from 'react';
import type { UIComponent } from '../types/builder';

interface Props {
    component: UIComponent;
    isSelected: boolean;
    onClick: () => void;
    onUpdateContent: (id: string, content: string) => void;
    onUpdateImageSrc?: (id: string, src: string) => void;
    isViewMode?: boolean;
}

// Inline editable text component
function EditableText({
    value,
    onChange,
    className = '',
    placeholder = 'Click to edit',
    style
}: {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    style?: React.CSSProperties;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setText(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (text !== value) {
            onChange(text);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
        if (e.key === 'Escape') {
            setText(value);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`bg-transparent border-b border-white/50 outline-none ${className}`}
                style={{ width: `${Math.max(text.length, placeholder.length) * 0.6 + 2}em` }}
            />
        );
    }

    return (
        <span
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className={`cursor-text hover:bg-white/10 px-1 -mx-1 rounded transition-colors ${className}`}
            style={style}
        >
            {value || placeholder}
        </span>
    );
}

export function RenderNode({ component, isSelected, onClick, onUpdateContent, onUpdateImageSrc, isViewMode = false }: Props) {
    const baseStyles = "relative transition-all duration-200";
    const widthStyles = component.type === 'Button' || component.type === 'Card' ? 'w-fit' : 'w-full';
    const selectionStyles = isSelected
        ? "ring-1 ring-white ring-offset-2 ring-offset-black"
        : "hover:ring-1 hover:ring-neutral-700 hover:ring-offset-1 hover:ring-offset-black";

    // Helper to update content by joining parts with |
    const updatePart = (index: number, newValue: string, currentContent: string) => {
        const parts = currentContent?.split('|') || [];
        parts[index] = newValue;
        return parts.join('|');
    };

    // For Button/Image/Card, don't apply container background - they handle their own
    const containerStyles = component.type === 'Button' || component.type === 'Image' || component.type === 'Card'
        ? { ...component.styles, backgroundColor: 'transparent' }
        : component.styles;

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={containerStyles}
            className={`${baseStyles} ${widthStyles} ${selectionStyles}`}
        >
            {component.type === 'Text' && (
                <EditableText
                    value={component.content || ''}
                    onChange={(val) => onUpdateContent(component.id, val)}
                    className="min-h-[1em] text-white block"
                    placeholder="Click to add text"
                />
            )}

            {component.type === 'Button' && (
                <button
                    className={`w-full h-full rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-150 ${isViewMode
                        ? 'hover:brightness-90 hover:scale-[0.98] active:scale-95 active:brightness-75 cursor-pointer'
                        : ''
                        }`}
                    style={{
                        backgroundColor: component.styles.backgroundColor || '#ffffff',
                        color: component.styles.color || '#000000',
                        borderRadius: component.styles.borderRadius || '8px',
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isViewMode) {
                            // In view mode, show a visual click feedback
                            console.log('Button clicked:', component.content);
                        }
                    }}
                >
                    {isViewMode ? (
                        <span style={{ color: component.styles.color || '#000000' }}>
                            {component.content || 'Button'}
                        </span>
                    ) : (
                        <EditableText
                            value={component.content || 'Button'}
                            onChange={(val) => onUpdateContent(component.id, val)}
                            className=""
                            style={{ color: component.styles.color || '#000000' }}
                            placeholder="Button"
                        />
                    )}
                </button>
            )}

            {component.type === 'Image' && (
                component.imageSrc ? (
                    <div className="relative group">
                        <img
                            src={component.imageSrc}
                            alt={component.content || 'Image'}
                            className="w-full h-full object-cover rounded-lg"
                            style={{ minHeight: '100px' }}
                        />
                        {isSelected && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4">
                                <p className="text-neutral-400 text-xs mb-2">Change image:</p>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {[1, 2, 3].map((n) => (
                                        <button
                                            key={n}
                                            onClick={(e) => { e.stopPropagation(); onUpdateImageSrc?.(component.id, `/${n}.png`); }}
                                            className="w-10 h-10 rounded overflow-hidden border border-neutral-600 hover:border-white transition-colors"
                                        >
                                            <img src={`/${n}.png`} alt={`Image ${n}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="w-full bg-neutral-900 flex flex-col items-center justify-center border border-dashed border-neutral-800 text-neutral-600 rounded-lg p-4"
                        style={{ minHeight: component.styles.height || '200px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-xs text-neutral-500 mb-3">Choose an image:</p>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {[1, 2, 3].map((n) => (
                                <button
                                    key={n}
                                    onClick={(e) => { e.stopPropagation(); onUpdateImageSrc?.(component.id, `/${n}.png`); }}
                                    className="w-12 h-12 rounded-lg overflow-hidden border-2 border-neutral-700 hover:border-white transition-colors"
                                >
                                    <img src={`/${n}.png`} alt={`Image ${n}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )
            )}

            {component.type === 'Section' && (
                <div
                    className="w-full bg-neutral-900/50 border border-dashed border-neutral-700 rounded-lg relative"
                    style={{
                        minHeight: component.styles.height || '300px',
                        backgroundColor: component.styles.backgroundColor || 'transparent'
                    }}
                >
                    <div className="absolute top-2 left-2 text-[10px] uppercase tracking-wider text-neutral-600 bg-neutral-900/80 px-2 py-0.5 rounded">
                        <EditableText
                            value={component.content || 'Section'}
                            onChange={(val) => onUpdateContent(component.id, val)}
                            className="text-neutral-500"
                            placeholder="Section name"
                        />
                    </div>
                </div>
            )}

            {component.type === 'Navbar' && (() => {
                const parts = component.content?.split('|') || ['Logo', 'Home,About,Contact', 'Sign Up'];
                const logo = parts[0] || 'Logo';
                const links = parts[1]?.split(',') || ['Home', 'About', 'Contact'];
                const cta = parts[2] || 'Sign Up';
                return (
                    <nav className="w-full h-full flex items-center justify-between overflow-hidden px-6">
                        <EditableText
                            value={logo}
                            onChange={(val) => onUpdateContent(component.id, updatePart(0, val, component.content || ''))}
                            className="text-white font-bold text-lg whitespace-nowrap"
                            placeholder="Logo"
                        />
                        <div className="flex items-center gap-4 flex-shrink-0">
                            {links.map((link, i) => (
                                <EditableText
                                    key={i}
                                    value={link.trim()}
                                    onChange={(val) => {
                                        const newLinks = [...links];
                                        newLinks[i] = val;
                                        onUpdateContent(component.id, updatePart(1, newLinks.join(','), component.content || ''));
                                    }}
                                    className="text-neutral-400 text-sm hover:text-white whitespace-nowrap"
                                    placeholder="Link"
                                />
                            ))}
                        </div>
                        <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0">
                            <EditableText
                                value={cta}
                                onChange={(val) => onUpdateContent(component.id, updatePart(2, val, component.content || ''))}
                                className="text-black whitespace-nowrap"
                                placeholder="CTA"
                            />
                        </button>
                    </nav>
                );
            })()}

            {component.type === 'Footer' && (
                <footer className="w-full h-full flex items-center justify-center px-6">
                    <EditableText
                        value={component.content || ''}
                        onChange={(val) => onUpdateContent(component.id, val)}
                        className="text-neutral-500 text-sm"
                        placeholder="Footer text"
                    />
                </footer>
            )}

            {component.type === 'Card' && (() => {
                const parts = component.content?.split('|') || ['Card Title', 'Description', 'Learn More'];
                return (
                    <div className="flex flex-col">
                        <EditableText
                            value={parts[0] || 'Card Title'}
                            onChange={(val) => onUpdateContent(component.id, updatePart(0, val, component.content || ''))}
                            className="text-lg font-semibold text-white mb-2"
                            placeholder="Title"
                        />
                        <EditableText
                            value={parts[1] || 'Description'}
                            onChange={(val) => onUpdateContent(component.id, updatePart(1, val, component.content || ''))}
                            className="text-neutral-400 text-sm mb-4"
                            placeholder="Description"
                        />
                        <button className="w-full py-2 bg-neutral-800 text-white rounded-lg font-medium text-sm">
                            <EditableText
                                value={parts[2] || 'Learn More'}
                                onChange={(val) => onUpdateContent(component.id, updatePart(2, val, component.content || ''))}
                                className="text-white"
                                placeholder="Button"
                            />
                        </button>
                    </div>
                );
            })()}
        </div>
    );
}