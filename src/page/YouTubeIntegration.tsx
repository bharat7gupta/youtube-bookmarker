import { h, Fragment, VNode } from 'preact';
import { useEffect, useState, useCallback, useReducer, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import BookmarkButton from './BookmarkButton';
import BookmarkItem from './BookmarkItem';
import LoopSection from './LoopSection';
import ContentApp, { ContentAppRef } from './ContentApp';
import prependPortal from './prependPortal';
import { getFormattedTime } from '../common';
import contentReducer, { initialState } from './contentReducer';
import { VideoInitData } from '../types/content';

function YouTubeIntegration() {
  const contentAppRef = useRef<ContentAppRef>(null);
  const [bookmarkButtonContainer, setBookmarkButtonContainer] = useState<HTMLElement | null>(null);
  const [bookmarksContainer, setBookmarksContainer] = useState<HTMLElement | null>(null);
  
  const [state, dispatch] = useReducer(contentReducer, initialState);

  const onVideoDataInit = (videoData: VideoInitData) => {
    dispatch({ type: 'VIDEO_DATA_INIT', videoData });
  };

  const onAdPlayStatusChange = (isPlayingAd: boolean) => {
    dispatch({ type: 'AD_PLAY_STATUS', isPlayingAd });
  };

  const handleAddBookmark = useCallback(() => {
    if (state.isPlayingAd) return;
    
    const videoId = state.videoId;

    if (!videoId) return;
    
    const video = document.getElementsByClassName("html5-main-video")[0] as HTMLVideoElement;
    const currentTime = Math.floor(video.currentTime);

    if (!currentTime) return;
    
    const newBookmark = { 
      time: currentTime,
      desc: `Bookmark at ${getFormattedTime(currentTime)}`
    };

    chrome.storage.sync.get([videoId], function(data) {
      const existingBookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
      const isDuplicate = existingBookmarks.some(d => d.time === newBookmark.time);

      if (isDuplicate) return;

      dispatch({
        type: 'ADD_NEW_BOOKMARK',
        videoId,
        newBookmark,
        existingBookmarks
      });
    });
  }, [state.isPlayingAd, state.videoId]);

  const processMessage = useCallback((data: any) => {
    switch(data.type) {
      case 'PLAY_FROM_BOOKMARK':
        contentAppRef.current.seekTo(data.bookmarkTime);
        break;
      case 'START_LOOP_BETWEEN_BOOKMARKS':
        contentAppRef.current.seekTo(data.startTime);
        break;
      default:
        break;
    }

    dispatch(data);
  }, [state.bookmarks, state.videoId]);

  const renderContentApp = () => {
    return h(ContentApp, {
      videoId: state.videoId,
      loopData: state.loopData,
      onVideoDataInit,
      onAdPlayStatusChange,
      onAddBookmark: handleAddBookmark,
      onMessage: processMessage,
      ref: contentAppRef
    });
  };
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const ytRightControls = document.getElementsByClassName('ytp-right-controls')[0] as HTMLElement;
      const ytTimedmarkersContainer = document.getElementsByClassName('ytp-timed-markers-container')[0] as HTMLDivElement;

      if (ytRightControls && !bookmarkButtonContainer) {
        setBookmarkButtonContainer(ytRightControls);
      }
      
      if (ytTimedmarkersContainer && !bookmarksContainer) {
        // increase z-index so that markers are visible even over the time seeker button
        ytTimedmarkersContainer.style.zIndex = '50';

        setBookmarksContainer(ytTimedmarkersContainer);
      }
  
      if (bookmarkButtonContainer && bookmarksContainer) {
        observer.disconnect();
      }
    });
    
    // Watch for DOM changes to catch YouTube's player loading
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, [bookmarkButtonContainer, bookmarksContainer]);

  const renderBookmarkButtonPortal = (): VNode | null => {
    if (!bookmarkButtonContainer || !contentAppRef.current) return null;

    return prependPortal(
      h(BookmarkButton, { 
        onAddBookmark: handleAddBookmark 
      }),
      bookmarkButtonContainer
    );
  };

  const setYTTooltipVisibility = (visibility: 'visible' | 'hidden') => {
    const ytTooltipElement = document.getElementsByClassName('ytp-tooltip')[0] as HTMLDivElement;

    if (ytTooltipElement) {
      ytTooltipElement.style.visibility = visibility;
    }
  }
  
  const renderBookmarksPortal = (): VNode | null => {
    if (!bookmarksContainer || state.videoDuration === null) {
      return null;
    }
    
    return createPortal(
      h(Fragment, {}, [
        ...state.bookmarks.map(bookmark => 
          h(BookmarkItem, { 
            key: bookmark.time,
            bookmark,
            duration: state.videoDuration,
            hidden: state.hideBookmarks,
            onMouseEnter: () => {
              setYTTooltipVisibility('hidden');
            },
            onMouseLeave: () => {
              setYTTooltipVisibility('visible');
            }
          })
        ),
        state.loopData?.isLooping && 
          h(LoopSection, { 
            loopData: state.loopData,
            duration: state.videoDuration,
            hidden: state.hideBookmarks
          })
      ]),
      bookmarksContainer
    );
  };

  return h(Fragment, {}, [
    renderContentApp(),
    renderBookmarkButtonPortal(),
    renderBookmarksPortal()
  ]);
}

export default YouTubeIntegration;
