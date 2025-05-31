import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import { Bookmark, LoopData } from '../types/bookmark';
import { VideoInitData } from '../types/content';

interface ContentAppProps {
  videoId: string;
  loopData: LoopData;
  onVideoDataInit: (videoData: VideoInitData) => void;
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
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get([videoId], function(data) {
          try {
            const bookmarks = data && data[videoId] ? JSON.parse(data[videoId]) : [];
            resolve(bookmarks);
          } catch (error) {
            console.error('Error parsing bookmarks:', error);
            resolve([]);
          }
        });
      } catch (error) {
        console.error('Error accessing Chrome storage:', error);
        resolve([]);
      }
    });
  }, []);
  
  const fetchLastModifiedData = useCallback(async (): Promise<Record<string, number>> => {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(['lastModifiedByVideoId'], function(data) {
          try {
            const lastModifiedByVideoId = data && data['lastModifiedByVideoId'] 
              ? JSON.parse(data['lastModifiedByVideoId']) 
              : {};
            resolve(lastModifiedByVideoId);
          } catch (error) {
            console.error('Error parsing last modified data:', error);
            resolve({});
          }
        });
      } catch (error) {
        console.error('Error accessing Chrome storage:', error);
        resolve({});
      }
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
  
  const fetchLoopData = useCallback(async (videoId: string): Promise<LoopData | undefined> => {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(['loopData'], function(data) {
          try {
            if (!data || !data['loopData']) {
              resolve(undefined);
              return;
            }
            
            const savedLoopData = JSON.parse(data['loopData']) ?? {};
            const videoLoopData = savedLoopData[videoId];
            
            resolve(videoLoopData);
          } catch (error) {
            console.error('Error parsing loop data:', error);
            resolve(undefined);
          }
        });
      } catch (error) {
        console.error('Error accessing Chrome storage:', error);
        resolve(undefined);
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

    // Function to handle messages
    const messageListener = (data: any) => {
      try {
        onMessage(data);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    // Add message listener with error handling
    let messageListenerAdded = false;
    try {
      chrome.runtime.onMessage.addListener(messageListener);
      messageListenerAdded = true;
    } catch (error) {
      console.error('Failed to add message listener:', error);
    }

    // Setup hotkey handler with error handling
    const handleKeyUp = (e: KeyboardEvent) => {
      try {
        hotKeyHandler(e);
      } catch (error) {
        console.error('Error in keyup handler:', error);
      }
    };
    
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      if (adCheckIntervalRef.current) {
        clearInterval(adCheckIntervalRef.current);
        adCheckIntervalRef.current = undefined;
      }

      document.removeEventListener('keyup', hotKeyHandler);
    };
  }, [onMessage]);

  const checkAdPlayStatus = () => {
    try {
      const adOverlay = document.getElementsByClassName('ytp-ad-player-overlay')[0];
      const isPlayingAd = Boolean(adOverlay);
      onAdPlayStatusChange(isPlayingAd);
    } catch (error) {
      console.error('Error checking ad status:', error);
    }
  };
  
  useEffect(() => {
    if (!videoId) return;
    
    adCheckIntervalRef.current = window.setInterval(() => {
      checkAdPlayStatus();
    }, 1000);

    Promise.all([
      fetchBookmarks(videoId),
      fetchLastModifiedData(),
      getVideoDurationPromise(),
      fetchLoopData(videoId)
    ])
    .then(([bookmarks, lastModifiedByVideoId, videoDuration, loopData]) => {
      onVideoDataInit({ bookmarks, lastModifiedByVideoId, videoDuration, loopData });
    })
    .catch(error => {
      console.error('Error initializing video data:', error);
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
  }, [videoId, fetchBookmarks, fetchLastModifiedData, getVideoDurationPromise, fetchLoopData]);
  
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

  const seekTo = (time: number) => {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.currentTime = time;
    }
  };

  // Expose methods via ref
  useEffect(() => {
    if (ref) {
      (ref as any).current = {
        seekTo,
      };
    }
  }, [ref]);

  return null;
});

export default ContentApp; 