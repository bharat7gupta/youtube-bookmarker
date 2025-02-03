import { Bookmark } from "../types/bookmark";
import BookmarkMinView from "./BookmarkMinView";
import BookmarkView from "./BookmarkView";

interface VideoBookmarksCardProps {
    videoId: string;
    bookmarks: Bookmark[];
}

export default function VideoBookmarksCard({ videoId, bookmarks }: VideoBookmarksCardProps) {
    return (
        <div className="video-bookmarks-card">
            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank">
                <img src={`https://i.ytimg.com/vi/${videoId}/default.jpg`} className="video-thumbnail" />
            </a>

            <div class="bookmarks-min-view">
                {(!bookmarks || bookmarks.length === 0) ? (
                    <i class="row">No bookmarks</i>
                ) : (
                    bookmarks.map(bookmark => (
                        <BookmarkMinView
                            videoId={videoId}
                            bookmark={bookmark}
                        />
                    )))}
            </div>
        </div>
    );
}
