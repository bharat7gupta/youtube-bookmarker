import { h } from 'preact';
import { useCallback } from 'preact/hooks';

interface BookmarkButtonProps {
  onAddBookmark: () => void;
}

export default function BookmarkButton({ onAddBookmark }: BookmarkButtonProps) {
  const handleClick = useCallback(() => {
    onAddBookmark();
  }, [onAddBookmark]);

  return (
    <img 
      src={chrome.runtime.getURL('icons/bookmark.png')}
      className="ytp-button bookmark-button"
      title="Click to bookmark this moment (Ctrl + B)"
      onClick={handleClick}
    />
  );
} 