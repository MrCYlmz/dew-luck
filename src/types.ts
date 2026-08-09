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
    people: Person[];
}
export interface GroupDetails {
    id: string;
    name: string;
    respectEarlySelection: boolean;
    people: Person[];
}