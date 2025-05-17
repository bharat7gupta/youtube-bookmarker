import DeleteIcon from "../icons/DeleteIcon";
import { Bookmark } from "../types/bookmark";

interface DeleteBookmarkProps {
    bookmark: Bookmark;
    onDeleteBookmark: (bookmarkTime: number) => void;
}

export default function DeleteBookmark({ bookmark, onDeleteBookmark }: DeleteBookmarkProps) {
    const onDeleteBookmarkClick = () => {
        const { time: bookmarkTime } = bookmark;

        // send message to delete bookmark from page
        chrome.tabs.query({currentWindow: true, active: true}, function([activeTab]) {
            chrome.tabs.sendMessage(activeTab.id, { type: 'DELETE_BOOKMARK', bookmarkTime });
        });

        onDeleteBookmark(bookmark.time);
    }
    

    return (
        <DeleteIcon title="Delete bookmark" onClick={onDeleteBookmarkClick} className="action" />
    );
}
