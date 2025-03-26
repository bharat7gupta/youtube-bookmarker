import LinkIcon from "./icons/LinkIcon";
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

    return (
        <LinkIcon title="Copy bookmark link" onClick={onCopyBookmarkLinkClick} className="action" />
    );
}
