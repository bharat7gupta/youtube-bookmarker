import { useState, useEffect } from "preact/hooks";

import PlayFromBookmark from "./PlayFromBookmark";
import CopyBookmarkLink from "./CopyBookmarkLink";
import DeleteBookmark from "./DeleteBookmark";
import Reactions from "../common/Reactions/Reactions";

import { getFormattedTime } from "../common";
import { Bookmark } from "../types/bookmark";
import EditIcon from "../icons/EditIcon";
import SaveIcon from "../icons/SaveIcon";

interface BookmarkViewProps {
    videoId: string;
    bookmark: Bookmark;
    selectionDisabled: boolean;
    selected: boolean;
    onBookmarkDescUpdate: (bookmarkTime: number, bookmarkDesc: string) => void;
    onBookmarkReaction: (bookmarkTime: number, reaction: string) => void;
    onDeleteBookamrk: (bookmarkTime: number) => void;
    onSelect: (bookmark: Bookmark, selected: boolean) => void;
}

export default function BookmarkView({ videoId, bookmark, selectionDisabled, selected, onBookmarkDescUpdate, onBookmarkReaction, onDeleteBookamrk, onSelect }: BookmarkViewProps) {
    const [isEditingDesc, setIsEditingDesc] = useState<boolean>(false);
    const [bookmarkDescText, setBookmarkDescText] = useState<string>(bookmark.desc);

    const handleBookmarkDescChange = (event) => {
        setBookmarkDescText(event.target.value);
    };

    const handleEditClick = () => {
        if (isEditingDesc) {
            onBookmarkDescUpdate(bookmark.time, bookmarkDescText);
        }

        setIsEditingDesc(isEditing => !isEditing);
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            onBookmarkDescUpdate(bookmark.time, bookmarkDescText);
            setIsEditingDesc(false);
        }
    }

    const handleReaction = (reaction: string) => {
        onBookmarkReaction(bookmark.time, reaction);
    };

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
                ): <span title={bookmark.desc}>{bookmark.desc}</span>}
            </div>

            <div class="bookmark-controls">
                {isEditingDesc
                    ? <SaveIcon title="Save bookmark description" onClick={handleEditClick} className="action" />
                    : <EditIcon title="Edit bookmark description" onClick={handleEditClick} className="action" />
                }
                <PlayFromBookmark bookmark={bookmark} />
                <CopyBookmarkLink videoId={videoId} bookmark={bookmark} />
                <DeleteBookmark bookmark={bookmark} onDeleteBookmark={onDeleteBookamrk} />
                <Reactions bookmark={bookmark} onClick={handleReaction} />
            </div>
        </div>
    )
}