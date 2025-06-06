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
  reactionsPanelStyle?: any;
}

export default function Reactions({ bookmark, onClick, reactionsPanelStyle }: ReactionsProps) {
  return (
    <div className="reactions">
      <span className="reactions-button" style={bookmark.reaction ? { marginTop: '-7px' } : null}>
        {bookmark.reaction
          ? <span>{bookmark.reaction}</span>
          : <HappyIcon />}
      </span>

      <div className="reactions-panel" style={reactionsPanelStyle}>
        {ALL_REACTIONS.map(reaction => (
          <span
            className="reaction-emoji"
            onClick={() => onClick(reaction)}
          >
            {reaction}
          </span>
        ))}
      </div>
    </div>
  );
}
