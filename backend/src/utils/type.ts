export interface NoteResponse {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: NoteItem[];
}

export interface NoteItem {
    collectionId: string;
    collectionName: string;
    content: string;
    created: string;
    id: string;
    title: string;
    updated: string;
    userId: number;
}