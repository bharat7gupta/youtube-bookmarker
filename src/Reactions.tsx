import { useRef, useState } from "preact/hooks";
import { useClickInside } from "./hooks/useClickInside";
import { useClickOutside } from "./hooks/useClickOutside";
import { Bookmark } from "./types/bookmark";
import DownArrow from "./icons/DownArrow";

const ALL_REACTIONS = [
    '😀',
    '😂',
    '😍',
    '😲',
    '😢',
    '🥳',
    '🙌',
    '👍',
];

interface ReactionsProps {
    bookmark: Bookmark;
    onClick: (reaction: string) => void;
}

export default function Reactions({ bookmark, onClick }: ReactionsProps) {
    const [showReactions, setShowReactions] = useState(false);
    const reactionsRef = useRef(null);

    useClickInside(reactionsRef, () => setShowReactions(true));
    useClickOutside(reactionsRef, () => setShowReactions(false));

    return (
        <div className="reactions action" ref={reactionsRef}>
            <span
                className="reactions-button"
                onClick={() => setShowReactions(toggle => !toggle)}
                style={{ filter: `grayscale(${bookmark.reaction ? 0 : 1 })` }}
            >
                {bookmark.reaction ?? '😃'}
                <DownArrow width={6} height={6} className="arrow-down" />
            </span>

            {showReactions ? (
                <div className="reactions-panel">
                    {ALL_REACTIONS.map(reaction => (
                        <span
                            className="reaction-emoji"
                            onClick={() => onClick(reaction)}
                        >
                            {reaction}
                        </span>
                    ))}
                </div>
            ): null}
        </div>
    );
}
