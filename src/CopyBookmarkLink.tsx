import { Bookmark } from "./types/bookmark";

interface CopyBookmarkLinkProps {
    videoId: string;
    bookmark: Bookmark
}

export default function CopyBookmarkLink({ bookmark, videoId }: CopyBookmarkLinkProps) {
    const onCopyBookmarkLinkClick = () => {
        const url = `https://www.youtube.com/watch?v=${videoId}&t=${bookmark.time}s`;
    
        navigator.clipboard.writeText(url);
    }

    return <img src="../icons/copy-link.png" title="Copy bookmark link" onClick={onCopyBookmarkLinkClick} />;
}