import { Bookmark } from "../types/bookmark";
import { ContentReducerState, VideoInitData } from "../types/content";

export const initialState: ContentReducerState = {
  videoId: null as string | null,
  bookmarks: [] as Bookmark[],
  videoDuration: null as number | null,
  hideBookmarks: false,
  loopData: null,
  isPlayingAd: false,
  lastModifiedByVideoId: {} as Record<string, number>
};

function contentReducer(state: ContentReducerState, action) {
  switch(action.type) {
    case 'NEW_VIDEO': {
      const { videoId } = action;
      return { ...initialState, videoId };
    }
    case 'VIDEO_DATA_INIT': {
      const { bookmarks, lastModifiedByVideoId, videoDuration } = action.videoData as VideoInitData;
      return {
        ...state,
        bookmarks,
        lastModifiedByVideoId,
        videoDuration
      };
    }
    case 'AD_PLAY_STATUS': {
      const { isPlayingAd } = action;
      return { ...state, isPlayingAd };
    }
    case 'HIDE_BOOKMARKS': {
      const { hideBookmarks } = action;
      return { ...state, hideBookmarks };
    }
    case 'ADD_NEW_BOOKMARK': {
      const { videoId, newBookmark, existingBookmarks } = action;
      const updatedBookmarks = [...existingBookmarks, newBookmark].sort((a, b) => a.time - b.time);
      const updatedLastModified = {
        ...state.lastModifiedByVideoId,
        [videoId]: Date.now()
      };

      chrome.storage.sync.set({
        [videoId]: JSON.stringify(updatedBookmarks),
        'lastModifiedByVideoId': JSON.stringify(updatedLastModified)
      });

      return {
        ...state,
        bookmarks: updatedBookmarks,
        lastModifiedByVideoId: updatedLastModified
      }
    }
    case 'DELETE_BOOKMARK': {
      if (state.bookmarks.length > 0 && state.videoId) {
        const { bookmarkTime } = action;
        const newBookmarks = state.bookmarks.filter(b => b.time !== bookmarkTime);

        chrome.storage.sync.set({[state.videoId]: JSON.stringify(newBookmarks)});

        return {
          ...state,
          bookmarks: newBookmarks
        };
      }
      
      return state;
    }
    case 'START_LOOP_BETWEEN_BOOKMARKS': {
      const { startTime, endTime } = action;
      return { ...state, loopData: { startTime, endTime, isLooping: true }};
    }
    case 'STOP_LOOP_BETWEEN_BOOKMARKS': {
      return { ...state, loopData: null };
    }
    case 'ADD_REACTION': {
      if (state.videoId) {
        const { bookmarkTime, reaction } = action;
        const newBookmarks = state.bookmarks.map(b => 
          b.time === bookmarkTime
            ? { ...b, reaction } 
            : b
        );

        chrome.storage.sync.set({[state.videoId]: JSON.stringify(newBookmarks)});

        return { ...state, bookmarks: newBookmarks }
      }

      return state;
    }
    default:
      return state;
  }
}

export default contentReducer;
