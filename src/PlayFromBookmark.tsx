import { Bookmark } from "../types/bookmark";

interface PlayFromBookmarkProps {
    bookmark: Bookmark;
}

export default function PlayFromBookmark({ bookmark }: PlayFromBookmarkProps) {
    function onPlayFromBookmarkClick() {
        chrome.tabs.query({currentWindow: true, active: true}, function([activeTab]) {
            chrome.tabs.sendMessage(activeTab.id, { type: 'PLAY_FROM_BOOKMARK', value: bookmark.time });
        });
    }

    return (
        <img src="../icons/play.png" title="Start play from bookmark" onClick={onPlayFromBookmarkClick} />
    )
}
