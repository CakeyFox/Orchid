export interface Background {
    id: string,
    name: string,
    cakes: number,
    filename: string,
    description: string,
    author: string,
    inactive: boolean,
}

export interface Layout {
    id: string,
    name: string,
    cakes: number,
    filename: string,
    description: string,
    inactive: boolean,
    author: string,
    darkText: boolean,
}

export interface Decoration {
    id: string,
    name: string,
    cakes: number,
    filename: string,
    description: string,
    inactive: boolean,
    isMask: boolean,
}