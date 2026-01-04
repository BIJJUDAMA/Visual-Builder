interface Props {
    value: string;
    onChange: (color: string) => void;
    label?: string;
}

const COLORS = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
];

export function ColorPicker({ value, onChange, label }: Props) {
    return (
        <div>
            {label && <label className="text-neutral-500 text-xs block mb-1.5">{label}</label>}
            <div className="flex gap-1.5">
                {COLORS.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onChange(color.value)}
                        className={`w-6 h-6 rounded-md border-2 transition-all ${value === color.value
                                ? 'border-white scale-110'
                                : 'border-neutral-700 hover:border-neutral-500'
                            }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
}
