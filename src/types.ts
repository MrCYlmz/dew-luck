export type SelectionStyle = 'wheel' | 'cards';

export const DEFAULT_SELECTION_STYLE: SelectionStyle = 'wheel';

export interface Person {
    id: string;
    name: string;
    weight: number;
    isSelected: boolean;
}

export interface GroupCreateRequest {
    id?: string;
    name: string;
    respectEarlySelection: boolean;
    selectionStyle: SelectionStyle;
    people: Person[];
}
export interface GroupDetails {
    id: string;
    name: string;
    respectEarlySelection: boolean;
    selectionStyle: SelectionStyle;
    people: Person[];
}
