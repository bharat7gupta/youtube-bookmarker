import { Bookmark } from "./types/bookmark";

interface DeleteBookmarkProps {
    bookmark: Bookmark;
    onDeleteBookmark: (bookmarkTime: number) => void;
}

export default function DeleteBookmark({ bookmark, onDeleteBookmark }: DeleteBookmarkProps) {
    const onDeleteBookmarkClick = (e) => {
        const { time: bookmarkTime } = bookmark;

        // send message to delete bookmark from page
        chrome.tabs.query({currentWindow: true, active: true}, function([activeTab]) {
            chrome.tabs.sendMessage(activeTab.id, { type: 'DELETE_BOOKMARK', value: bookmarkTime });
        });

        onDeleteBookmark(bookmark.time);
    }
    

    return (
        <img
            src="../icons/delete.png" 
            className="action"
            title="Delete bookmark" 
            onClick={onDeleteBookmarkClick}
        />
    );
}
