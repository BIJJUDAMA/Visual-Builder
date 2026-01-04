export type ComponentType =
    | 'Text'
    | 'Button'
    | 'Image'
    | 'Section'
    | 'Navbar'
    | 'Footer'
    | 'Card';

export interface UIComponent {
    id: string;
    type: ComponentType;
    parentId?: string;  // Reference to parent Section for containment
    content?: string;
    imageSrc?: string; // For Image components - URL to display
    linkUrl?: string;  // For Button/Link components - where they navigate
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
        margin?: string;
        maxWidth?: string;
        // Free positioning
        x?: number;
        y?: number;
        zIndex?: number;
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