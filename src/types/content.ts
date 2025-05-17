import { Bookmark, LoopData } from "./bookmark";

export interface ContentReducerState {
  videoId: string | null;
  bookmarks: Bookmark[];
  videoDuration: number | null;
  hideBookmarks: boolean;
  loopData: LoopData | null;
  isPlayingAd: boolean;
  lastModifiedByVideoId: Record<string, number>
}

export type VideoInitData = Pick<ContentReducerState, 'bookmarks' | 'lastModifiedByVideoId' | 'videoDuration'>;
