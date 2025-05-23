import { IconProps } from "./types";

export default function LinkIcon({ width = 20, height = 20, title, className, onClick }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" className={className} onClick={onClick} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {title ? <title>{title}</title> : null}
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 15l6 -6" />
            <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
            <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
        </svg>
    );
}