import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import { Bookmark, LoopData } from '../types/bookmark';
import { ContentReducerState } from './contentReducer';

interface ContentAppProps {
  videoId: string;
  loopData: LoopData;
  onVideoDataInit: (videoData: Pick<ContentReducerState, 'bookmarks' | 'lastModifiedByVideoId' | 'videoDuration'>) => void;
  onAdPlayStatusChange: (isPlayingAd: boolean) => void;
  onMessage: (data: unknown & { type: string }) => void;
  onAddBookmark: () => void;
}

export interface ContentAppRef {
  seekTo: (time: number) => void;
}

const ContentApp = forwardRef<ContentAppRef, ContentAppProps>(({
  videoId,
  loopData,
  onVideoDataInit,
  onAdPlayStatusChange,
  onMessage,
  onAddBookmark,
}, ref) => {

  // Refs
  const ytPlayerRef = useRef<HTMLVideoElement | null>(null);
  const adCheckIntervalRef = useRef<number | null>(null);
  
  const fetchBookmarks = useCallback(async (videoId: string): Promise<Bookmark[]> => {
    return new Promise(resolve => {
      chrome.storage.sync.get([videoId], function(data) {
        resolve(data[videoId] ? JSON.parse(data[videoId]) : []);
      });
    });
  }, []);
  
  const fetchLastModifiedData = useCallback(async (): Promise<Record<string, number>> => {
    return new Promise(resolve => {
      chrome.storage.sync.get('lastModifiedByVideoId', function(data) {
        resolve(data.lastModifiedByVideoId ? JSON.parse(data.lastModifiedByVideoId) : {});
      });
    });
  }, []);
  
  const getVideoDurationPromise = useCallback((): Promise<number> => {
    return new Promise(resolve => {
      if (!ytPlayerRef.current) {
        resolve(0);
        return;
      }
      
      if (ytPlayerRef.current.duration) {
        resolve(Math.floor(ytPlayerRef.current.duration));
        return;
      }
      
      const getPlayTime = () => {
        if (ytPlayerRef.current) {
          ytPlayerRef.current.removeEventListener('playing', getPlayTime);
          resolve(Math.floor(ytPlayerRef.current.duration));
        }
      };
      
      ytPlayerRef.current.addEventListener('playing', getPlayTime);
    });
  }, []);
  
  const initLoopSectionIfAny = useCallback((videoId: string) => {
    chrome.storage.sync.get(['loopData'], function(data) {
      if (!data['loopData']) return;
      
      const savedLoopData = JSON.parse(data['loopData']) ?? {};
      const videoLoopData = savedLoopData[videoId];
      
      if (videoLoopData?.isLooping) {
        if (ytPlayerRef.current) {
          ytPlayerRef.current.currentTime = videoLoopData.startTime;
        }
      }
    });
  }, []);

  const hotKeyHandler = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && (e.keyCode === 66 || e.keyCode === 91)) {
      onAddBookmark();
    }
  }, [onAddBookmark]);

  useEffect(() => {
    // init dom element refs
    ytPlayerRef.current = document.getElementsByClassName("html5-main-video")[0] as HTMLVideoElement;

    // setup listener for messages from background or popup pages
    chrome.runtime.onMessage.addListener(function(data) {
      onMessage(data);
    });

    // setup hotkey handler
    document.addEventListener('keyup', hotKeyHandler);
    
    return () => {
      if (adCheckIntervalRef.current) {
        clearInterval(adCheckIntervalRef.current);
      }

      document.removeEventListener('keyup', hotKeyHandler);
    };
  }, []);

  const checkAdPlayStatus = () => {
    const adOverlay = document.getElementsByClassName('ytp-ad-player-overlay')[0];
    const isPlayingAd = Boolean(!!adOverlay);
    onAdPlayStatusChange(isPlayingAd);
  }
  
  useEffect(() => {
    if (!videoId) return;
    
    adCheckIntervalRef.current = window.setInterval(() => {
      checkAdPlayStatus();
    }, 1000);

    Promise.all([
      fetchBookmarks(videoId),
      fetchLastModifiedData(),
      getVideoDurationPromise()
    ]).then(([bookmarks, lastModifiedByVideoId, videoDuration]) => {
      onVideoDataInit({ bookmarks, lastModifiedByVideoId, videoDuration });
      initLoopSectionIfAny(videoId);
    });

    if (ytPlayerRef.current) {
      ytPlayerRef.current.addEventListener('ended', () => {
        if (adCheckIntervalRef.current) {
          clearInterval(adCheckIntervalRef.current);
          adCheckIntervalRef.current = null;
        }
      });
      
      ytPlayerRef.current.addEventListener('pause', () => {
        if (adCheckIntervalRef.current) {
          clearInterval(adCheckIntervalRef.current);
          adCheckIntervalRef.current = null;
        }
      });
      
      ytPlayerRef.current.addEventListener('playing', () => {
        if (!adCheckIntervalRef.current) {
          adCheckIntervalRef.current = window.setInterval(() => {
            checkAdPlayStatus();
          }, 1000);
        }
      });
    }
    
    return () => {
      if (adCheckIntervalRef.current) {
        clearInterval(adCheckIntervalRef.current);
      }
    };
  }, [videoId, fetchBookmarks, fetchLastModifiedData, getVideoDurationPromise, initLoopSectionIfAny]);
  
  useEffect(() => {
    if (!loopData?.isLooping || !ytPlayerRef.current) return;
    
    const loopBetweenBookmarks = () => {
      const [startTime, endTime] = [loopData.startTime, loopData.endTime].map(Number);
      if (ytPlayerRef.current && 
          ytPlayerRef.current.currentTime >= startTime && 
          parseInt(ytPlayerRef.current.currentTime.toString(), 10) === endTime) {
        ytPlayerRef.current.currentTime = startTime;
      }
    };
    
    ytPlayerRef.current.addEventListener('timeupdate', loopBetweenBookmarks);

    return () => {
      ytPlayerRef.current?.removeEventListener('timeupdate', loopBetweenBookmarks);
    };
  }, [loopData]);

  // Expose methods via ref
  useEffect(() => {
    if (ref) {
      (ref as any).current = {
        seekTo: (time: number) => {
          if (ytPlayerRef.current) {
            ytPlayerRef.current.currentTime = time;
          }
        },
      };
    }
  }, [ref]);

  return null;
});

export default ContentApp; 