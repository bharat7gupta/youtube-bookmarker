import { h } from 'preact';
import { Bookmark } from '../types/bookmark';
import { useRef } from 'preact/hooks';

interface BookmarkItemProps {
  bookmark: Bookmark;
  duration: number;
  hidden: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function BookmarkItem({ bookmark, duration, hidden, onMouseEnter, onMouseLeave }: BookmarkItemProps) {
  const position = ((bookmark.time / duration) * 100);
  const className = `ct-bookmark${hidden ? ' ct-hide-bookmark' : ''}`;
  const id = `ct-bookmark-${bookmark.time}`;

  const bookmarkItemRef = useRef<HTMLDivElement>();

  return (
    <div 
      ref={bookmarkItemRef}
      id={id}
      className={className} 
      style={{ left: `calc(${position}% - 2px)` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {bookmark.reaction && (
        <div className="ct-bookmark-reaction">{bookmark.reaction}</div>
      )}

      <div className="ct-bookmark-tooltip">{bookmark.desc}</div>
    </div>
  );
}
