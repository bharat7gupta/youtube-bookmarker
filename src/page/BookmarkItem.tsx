import { Bookmark } from '../types/bookmark';
import { useRef, useState } from 'preact/hooks';
import Reactions from '../common/Reactions/Reactions';

interface BookmarkItemProps {
  bookmark: Bookmark;
  duration: number;
  hidden: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDescriptionChange: (time: number, newDesc: string) => void;
  onBookmarkReaction: (bookmarTime: number, reaction: string) => void;
}

export default function BookmarkItem({ bookmark, duration, hidden, onMouseEnter, onMouseLeave, onDescriptionChange, onBookmarkReaction }: BookmarkItemProps) {
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [reactionsPanelStyle, setReactionsPanelStyle] = useState({});

  const position = ((bookmark.time / duration) * 100);
  const className = `ct-bookmark${hidden ? ' ct-hide-bookmark' : ''}`;
  const id = `ct-bookmark-${bookmark.time}`;

  const bookmarkDescRef = useRef(null);
  const bookmarkItemRef = useRef(null);

  const stopEventPropagation = (event: MouseEvent) => {
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  const preventEventPropagation = (event: MouseEvent) => {
    event.preventDefault();
    stopEventPropagation(event);
  };

  const handleMouseEnter = () => {
    onMouseEnter();
    updateTooltipPosition();
  };

  const updateTooltipPosition = () => {
    if (!bookmarkItemRef.current) return;
    
    const bookmarkItem = bookmarkItemRef.current;
    const leftPos = bookmarkItem.offsetLeft;
    
    let newTooltipStyle: any = {};
    let newReactionsPanelStyle: any = {};

    if (leftPos < 150) {
      newReactionsPanelStyle.right = '-90px';
    }

    const ytPlayer = document.getElementsByClassName("html5-main-video")[0] as HTMLVideoElement;
    const ytPlayerWidth = ytPlayer.offsetWidth;

    if (leftPos < 120) {
      newTooltipStyle.left = '0';
      newTooltipStyle.transform = 'translateX(0) scaleY(0.5)';
    }
    else if (leftPos > ytPlayerWidth - 120) {
      newTooltipStyle.right = '0';
      newTooltipStyle.transform = 'translateX(0) scaleY(0.5)';
    } else {
      newTooltipStyle.left = '50%';
      newTooltipStyle.transform = 'translateX(-50%) scaleY(0.5)';
    }
    
    setTooltipStyle(newTooltipStyle);
    setReactionsPanelStyle(newReactionsPanelStyle);
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
    onBookmarkReaction(bookmark.time, reaction);
  };

  return (
    <div
      ref={bookmarkItemRef}
      id={id}
      className={className} 
      style={{ left: `calc(${position}% - 2px)` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {bookmark.reaction && (
        <div className="ct-bookmark-reaction">{bookmark.reaction}</div>
      )}

      <div 
        className="ct-bookmark-tooltip"
        style={tooltipStyle}
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

        <div className="ct-reactions-container" style={reactionsPanelStyle}>
          <Reactions bookmark={bookmark} onClick={handleReaction} reactionsPanelStyle={reactionsPanelStyle} />
        </div>
      </div>
    </div>
  );
}
