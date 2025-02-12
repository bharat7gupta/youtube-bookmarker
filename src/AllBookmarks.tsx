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
        chrome.storage.sync.get().then(function (bookmarksByVideoId) {
            /** Just an unfortunate way of removing keys not required here */
            delete bookmarksByVideoId.hideBookmarks;
            delete bookmarksByVideoId.lastModifiedByVideoId;
            delete bookmarksByVideoId.loopData;

            const allBookmarksParsed = Object.keys(bookmarksByVideoId).reduce((obj: Record<string, Bookmark[]>, key: string) => {
                obj[key] = JSON.parse(bookmarksByVideoId[key]);
                return obj;
            }, {});

            setBookmarksByVideoId(allBookmarksParsed);
        });
    };

    function fetchLastModifiedData() {
        chrome.storage.sync.get('lastModifiedByVideoId', function (data) {
            setLastModifiedByVideoId(data.lastModifiedByVideoId ? JSON.parse(data.lastModifiedByVideoId) : {});
        });
    }

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value);
    };

    let filteredVideoIds;
    if (!searchText || searchText.trim().length === 0) {
        filteredVideoIds = Object.keys(bookmarksByVideoId);
    } else {
        const searchTerm = searchText.toLowerCase();
        filteredVideoIds = Object.keys(bookmarksByVideoId).reduce((videoIds, videoId) => {
            const bookmarks = bookmarksByVideoId[videoId] ?? [];

            if (bookmarks.some(b => b.desc.toLowerCase().indexOf(searchTerm) > -1)) {
                videoIds.push(videoId);
            }

            return videoIds;
        }, [])
    }

    return (
        <div class="all-bookmarks">
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

            {(!filteredVideoIds || filteredVideoIds.length === 0) ? (
                <i class="row">No bookmarks</i>
            ) : (
                filteredVideoIds
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
                    )
                )
            }
        </div>
    );
}