import { h } from 'preact';
import { Bookmark } from '../types/bookmark';
import { useRef } from 'preact/hooks';
import Reactions from '../common/Reactions/Reactions';

interface BookmarkItemProps {
  bookmark: Bookmark;
  duration: number;
  hidden: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDescriptionChange: (time: number, newDesc: string) => void;
  onBookmarkReaction: (bookmar: Bookmark, reaction: string) => void;
}

export default function BookmarkItem({ bookmark, duration, hidden, onMouseEnter, onMouseLeave, onDescriptionChange, onBookmarkReaction }: BookmarkItemProps) {
  const position = ((bookmark.time / duration) * 100);
  const className = `ct-bookmark${hidden ? ' ct-hide-bookmark' : ''}`;
  const id = `ct-bookmark-${bookmark.time}`;

  const bookmarkDescRef = useRef(null);

  const stopEventPropagation = (event: MouseEvent) => {
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  const preventEventPropagation = (event: MouseEvent) => {
    event.preventDefault();
    stopEventPropagation(event);
  };

  const handleTooltipMouseDown = (event: MouseEvent) => {
    const isContentEditable = (event.target as HTMLElement).closest('[contenteditable]');

    if (isContentEditable) {
      stopEventPropagation(event);
      return;
    }

    preventEventPropagation(event);
  };

  const handleTooltipBlur = (e: FocusEvent) => {
    const newDesc = (e.target as HTMLElement).textContent || '';

    if (!newDesc) {
      bookmarkDescRef.current.innerText = bookmark.desc;
    }

    if (newDesc !== bookmark.desc) {
      onDescriptionChange(bookmark.time, newDesc);
    }
  };

  const handleTooltipKeyDown = (e: KeyboardEvent) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      const newDesc = (e.target as HTMLElement).textContent || '';
      if (newDesc !== bookmark.desc && onDescriptionChange) {
        onDescriptionChange(bookmark.time, newDesc);
      }
      (e.target as HTMLElement).blur();
    }
  };

  const handleReaction = (reaction: string) => {
    onBookmarkReaction(bookmark, reaction);
  };

  return (
    <div
      id={id}
      className={className} 
      style={{ left: `calc(${position}% - 2px)` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {bookmark.reaction && (
        <div className="ct-bookmark-reaction">{bookmark.reaction}</div>
      )}

      <div 
        className="ct-bookmark-tooltip"
        onBlur={handleTooltipBlur}
        onMouseMove={preventEventPropagation}
        onMouseDown={handleTooltipMouseDown}
        onMouseUp={preventEventPropagation}
      >
        <div
          ref={bookmarkDescRef}
          contenteditable="plaintext-only"
          onKeyDown={handleTooltipKeyDown}
          className="ct-bookmark-desc"
        >
          {bookmark.desc}
        </div>

        <div className="ct-reactions-container">
          <Reactions bookmark={bookmark} onClick={handleReaction} />
        </div>
      </div>
    </div>
  );
}
