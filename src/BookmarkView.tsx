import { useState, useEffect } from "preact/hooks";

import PlayFromBookmark from "./PlayFromBookmark";
import CopyBookmarkLink from "./CopyBookmarkLink";
import DeleteBookmark from "./DeleteBookmark";

import { getFormattedTime } from "./common";
import { Bookmark } from "../types/bookmark";

interface BookmarkViewProps {
    videoId: string;
    bookmark: Bookmark;
    selectionDisabled: boolean;
    selected: boolean;
    onBookmarkDescUpdate: (bookmarkTime: number, bookmarkDesc: string) => void;
    onDeleteBookamrk: (bookmarkTime: number) => void;
    onSelect: (bookmark: Bookmark, selected: boolean) => void;
}

export default function BookmarkView({ videoId, bookmark, selectionDisabled, selected, onBookmarkDescUpdate, onDeleteBookamrk, onSelect }: BookmarkViewProps) {
    const [isEditingDesc, setIsEditingDesc] = useState<boolean>(false);
    const [bookmarkDescText, setBookmarkDescText] = useState<string>(bookmark.desc);

    const handleBookmarkDescChange = (e) => {
        setBookmarkDescText(e.target.value);
    };

    const handleEditClick = () => {
        if (isEditingDesc) {
            onBookmarkDescUpdate(bookmark.time, bookmarkDescText);
        }

        setIsEditingDesc(isEditing => !isEditing);
    }

    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            onBookmarkDescUpdate(bookmark.time, bookmarkDescText);
            setIsEditingDesc(false);
        }
    }

    return (
        <div key={bookmark.time} class="bookmark">
            <input
                type="checkbox"
                class="loop-between-bookmarks-checkbox"
                disabled={selectionDisabled}
                onInput={(e) => onSelect(bookmark, (e.target as HTMLInputElement).checked)}
                checked={selected}
            />

            <div class="bookmark-time">{getFormattedTime(bookmark.time)}</div>

            <div class="bookmark-desc">
                {isEditingDesc ? (
                    <input
                        type="text"
                        className="textbox mini-textbox"
                        value={bookmarkDescText}
                        onInput={handleBookmarkDescChange}
                        onKeyPress={handleKeyPress}
                    />
                ): <span>{bookmark.desc}</span>}
            </div>

            <div class="bookmark-controls">
                <img
                    src={isEditingDesc ? '../icons/save.png' : '../icons/edit.png'}
                    title={isEditingDesc ? 'Save bookmark description' : 'Edit bookmark description'}
                    onClick={handleEditClick}
                />
                <PlayFromBookmark bookmark={bookmark} />
                <CopyBookmarkLink videoId={videoId} bookmark={bookmark} />
                <DeleteBookmark bookmark={bookmark} onDeleteBookmark={onDeleteBookamrk}/>
            </div>
        </div>
    )
}