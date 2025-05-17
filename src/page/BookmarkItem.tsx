import { h } from 'preact';
import { Bookmark } from '../types/bookmark';

interface BookmarkItemProps {
  bookmark: Bookmark;
  duration: number;
  hidden: boolean;
}

export default function BookmarkItem({ bookmark, duration, hidden }: BookmarkItemProps) {
  const position = ((bookmark.time / duration) * 100);
  const className = `ct-bookmark${hidden ? ' ct-hide-bookmark' : ''}`;
  const id = `ct-bookmark-${bookmark.time}`;
  
  return (
    <div 
      id={id}
      className={className} 
      style={{ left: `calc(${position}% - 2px)` }}
    >
      {bookmark.reaction && (
        <div className="ct-bookmark-reaction">{bookmark.reaction}</div>
      )}
    </div>
  );
} 