export type ComponentType = 'Text' | 'Button' | 'Image' | 'Section';

export interface UIComponent {
    id: string;
    type: ComponentType;
    content?: string;
    // We keep styles flexible but define common properties for Autocomplete
    styles: {
        width?: string;
        height?: string;
        backgroundColor?: string;
        color?: string;
        fontSize?: string;
        padding?: string;
        marginTop?: string;
        marginBottom?: string;
        marginLeft?: string;
        marginRight?: string;
        borderRadius?: string;
        textAlign?: 'left' | 'center' | 'right';
        display?: string;
        flexDirection?: 'row' | 'column';
        gap?: string;
        border?: string;
    };
}

// Helper for the page_sessions table structure
export interface PageSession {
    id: string;
    name?: string;
    layout: UIComponent[];
    updated_at?: string;
    owner_name?: string;
}