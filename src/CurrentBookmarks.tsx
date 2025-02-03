import { useEffect, useState } from "preact/hooks"
import { Bookmark } from "./types/bookmark";
import BookmarkView from "./BookmarkView";

const APP_PREFIX = 'ytbmr';

export default function CurrentBookmarks() {
    const [currentVideoId, setCurrentVideoId] = useState<string>();
    const [searchText, setSearchText] = useState<string>('');
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [selectedBookmarks, setSelectedBookmarks] = useState<Bookmark[]>([]);
    const [isLooping, setIsLooping] = useState<boolean>(false);

    useEffect(() => {
        initCurrentVideoId();
    }, []);

    useEffect(() => {
        if (currentVideoId) {
            fetchBookmarks();
        }
    }, [currentVideoId]);

    useEffect(() => {
        const messageType = isLooping ? 'START_LOOP_BETWEEN_BOOKMARKS' : 'STOP_LOOP_BETWEEN_BOOKMARKS';

        chrome.tabs.query({currentWindow: true, active: true}, function([activeTab]) {
            const [startTime, endTime] = selectedBookmarks.sort((a, b) => a.time - b.time).map(b => b.time);
            const loopDataKey = `${APP_PREFIX}-loop-data-${currentVideoId}`;
            const loopData = { startTime, endTime, isLooping };

            currentVideoId && window.localStorage.setItem(loopDataKey, JSON.stringify(loopData));

            chrome.tabs.sendMessage(activeTab.id, { type: messageType, startTime, endTime });
        });
    }, [isLooping]);

    useEffect(() => {
        if (selectedBookmarks.length < 2) {
            setIsLooping(false);
        }
    }, [selectedBookmarks]);

    const fetchBookmarks = () => {
        // get all bookmarks for current video and create bookmark elements
        chrome.storage.sync.get([ currentVideoId ], function(data) {
            const bookmarks = data[currentVideoId] ? JSON.parse(data[currentVideoId]) : [];
            setBookmarks(bookmarks);
            setSearchText('');
        });
	}

    const initCurrentVideoId = () => {
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            const activeTab = tabs[0];

            if (activeTab.url.indexOf('youtube.com') > -1) {
                const queryParams = activeTab.url.split('?')[1];
                const urlParams = new URLSearchParams(queryParams);
                const videoId = urlParams.get('v');
                setCurrentVideoId(videoId);

                const loopDataKey = `${APP_PREFIX}-loop-data-${videoId}`;
                const { startTime, endTime, isLooping } = JSON.parse(window.localStorage.getItem(loopDataKey)) ?? {};

                if (startTime && endTime) {
                    const loopBookmarks = [
                        { time: startTime } as Bookmark,
                        { time: endTime } as Bookmark
                    ];

                    setSelectedBookmarks(loopBookmarks);
                    setIsLooping(isLooping);
                }
            }
        });
    }

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value);
    };

    const onBookmarkDescUpdate = (bookmarkTime: number, bookmarkDesc: string) => {
        const updatedBookmarks = bookmarks.map((bookmark) => {
            if (bookmark.time == bookmarkTime) {
                return { ...bookmark, desc: bookmarkDesc };
            }

            return bookmark;
        });

        setBookmarks(updatedBookmarks);

        chrome.storage.sync.set({[currentVideoId]: JSON.stringify(updatedBookmarks)});
    };

    const handleDeleteBookmark = (bookmarkTime: number) => {
        const updatedBookmarks = bookmarks.filter(function(b) { return b.time != bookmarkTime; });

        setBookmarks(updatedBookmarks);

        chrome.storage.sync.set({[currentVideoId]: JSON.stringify(updatedBookmarks)});
    };

    const handleBookmarkSelect = (bookmark: Bookmark, selected: boolean) => {
        const exists = selectedBookmarks.some(b => b.time === bookmark.time);

        if (selected && !exists) {
            setSelectedBookmarks(selectedBookmarks => [...selectedBookmarks, bookmark]);
        } else {
            setSelectedBookmarks(selectedBookmarks => selectedBookmarks.filter(b => b.time !== bookmark.time));
        }
    };

    let filteredBookmarks: Bookmark[] = [];
    if (!searchText || searchText.trim().length === 0) {
        filteredBookmarks = bookmarks;
    } else {
        const searchTerm = searchText.toLowerCase();
        filteredBookmarks = bookmarks.filter(
            bookmark => bookmark.desc.toLowerCase().indexOf(searchTerm) > -1
        );
    }

    return (
        <>
            <div class="current-bookmarks">
                <div class="row heading">
                    Bookmarks in current video
                </div>

                <div class="row search-box">
                    <input 
                        type="text"
                        class="textbox"
                        placeholder="Search for bookmark..."
                        value={searchText}
                        onInput={handleSearchTextChange}
                    />
                </div>

                <div class="bookmarks">
                    {(!filteredBookmarks || filteredBookmarks.length === 0) ? (
                        <i class="row">No bookmarks</i>
                    ): (
                        filteredBookmarks.map(bookmark => (
                            <BookmarkView
                                key={bookmark.time}
                                videoId={currentVideoId}
                                bookmark={bookmark}
                                onBookmarkDescUpdate={onBookmarkDescUpdate}
                                onDeleteBookamrk={handleDeleteBookmark}
                                onSelect={handleBookmarkSelect}
                                selected={selectedBookmarks.some(b => b.time === bookmark.time)}
                                selectionDisabled={
                                    selectedBookmarks.length === 2
                                    && !selectedBookmarks.some(b => b.time === bookmark.time)
                                }
                            />
                        ))
                    )}
                </div>
            </div>

            {bookmarks.length >= 2 ? (
                <>
                    <br/><hr />
                    <div class="row loop-bookmarks">
                        <span>
                            Loop between selected bookmarks
                            <input
                                type="checkbox"
                                className="inline-checkbox"
                                disabled={selectedBookmarks.length < 2}
                                checked={isLooping}
                                onInput={() => setIsLooping(isLooping => !isLooping)}
                            />
                        </span>
                    </div>
                </>
            ) : null}
        </>
    )
}