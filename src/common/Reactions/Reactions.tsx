import { useRef } from "preact/hooks";
import { Bookmark } from "../../types/bookmark";
import HappyIcon from "../../icons/HappyIcon";
import './reactions.css';

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
  const reactionsRef = useRef(null);

  return (
    <div className="reactions action" ref={reactionsRef}>
      <span className="reactions-button">
        {bookmark.reaction
          ? <span>{bookmark.reaction}</span>
          : <HappyIcon className="no-reaction" />}

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
      </span>
    </div>
  );
}
