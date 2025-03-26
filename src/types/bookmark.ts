export interface Bookmark {
    time: number;
    desc: string;
    reaction?: string;
}

export interface LoopData {
    startTime: number;
    endTime: number;
    isLooping: boolean;
}
