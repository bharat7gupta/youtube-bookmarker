import { Bookmark } from "./types/bookmark";
import { getFormattedTime } from "./common";
import CopyBookmarkLink from "./CopyBookmarkLink";

interface BookmarkMinViewProps {
    videoId: string;
    bookmark: Bookmark;
}

export default function BookmarkMinView({ videoId, bookmark }: BookmarkMinViewProps) {
    const onPlayClick = () => {
        const url = `https://www.youtube.com/watch?v=${videoId}&t=${bookmark.time}s`;
        chrome.tabs.update(undefined, { url });
    };

    return (
        <div key={bookmark.time} class="bookmark-min-view">
            <div class="bookmark-time">{getFormattedTime(bookmark.time)}</div>

            <div class="bookmark-desc">{bookmark.desc}</div>

            <div class="bookmark-min-controls">
                <img src="../icons/play.png" title="Play" onClick={onPlayClick} />
                <CopyBookmarkLink videoId={videoId} bookmark={bookmark} />
            </div>
        </div>
    );
}
