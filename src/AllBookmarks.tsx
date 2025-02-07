import { useEffect, useState } from "preact/hooks"
import { Bookmark } from "./types/bookmark";
import VideoBookmarksCard from "./VideoBookmarksCard";

export default function AllBookmarks() {
    const [bookmarksByVideoId, setBookmarksByVideoId] = useState<Record<string, Bookmark[]>>({});
    const [lastModifiedByVideoId, setLastModifiedByVideoId] = useState<Record<string, number>>({});
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        fetchLastModifiedData();
        fetchAllBookmarks();
    }, []);

    const fetchAllBookmarks = () => {
        chrome.storage.sync.get().then(function(bookmarksByVideoId) {
            delete bookmarksByVideoId.hideBookmarks;

            const allBookmarksParsed = Object.keys(bookmarksByVideoId).reduce((obj: Record<string, Bookmark[]>, key: string) => {
                obj[key] = JSON.parse(bookmarksByVideoId[key]);
                return obj;
            }, {});

            setBookmarksByVideoId(allBookmarksParsed);
        });	
    };

    function fetchLastModifiedData() {
        chrome.storage.sync.get('lastModifiedByVideoId', function(data) {
            setLastModifiedByVideoId(data.lastModifiedByVideoId ? JSON.parse(data.lastModifiedByVideoId) : {});
        });
	}

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value);
    };

    return (
        <div class="current-bookmarks">
            <div class="row heading">
                All Bookmarks
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

            {Object.keys(bookmarksByVideoId)
                .sort((id1, id2) => lastModifiedByVideoId[id2] - lastModifiedByVideoId[id1])
                .map(videoId => (
                    bookmarksByVideoId[videoId]?.length > 0 ? (
                        <VideoBookmarksCard
                            key={videoId}
                            videoId={videoId}
                            bookmarks={bookmarksByVideoId[videoId]}
                        />
                    ) : null
                )
            )}
        </div>
    );
}