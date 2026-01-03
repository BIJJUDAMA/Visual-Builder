import type { UIComponent } from './builder';


export type MutationType =
    | 'ADD_COMPONENT'
    | 'UPDATE_STYLE'
    | 'UPDATE_CONTENT'
    | 'DELETE_COMPONENT'
    | 'RESET_LAYOUT';


export interface MutationPayload {
    type: MutationType;
    id?: string;
    data?: any;
    actorId: string;
}


export interface MutationRecord {
    id: number;
    session_id: string;
    user_id?: string;
    payload: MutationPayload;
    created_at: string;
}

export interface PageSessionRecord {
    id: string;
    name: string;
    layout: UIComponent[];
    updated_at: string;
}