import { IconProps } from "./types";

export default function SaveIcon({ width = 20, height = 20, title, className, onClick }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" className={className} onClick={onClick} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {title ? <title>{title}</title> : null}
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
            <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M14 4l0 4l-6 0l0 -4" />
        </svg>
    );
}
