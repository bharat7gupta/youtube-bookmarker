import { IconProps } from "./types";

export default function HappyIcon({ width = 20, height = 20, title, className, onClick }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" className={className} onClick={onClick} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {title ? <title>{title}</title> : null}
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M9 9l.01 0" />
            <path d="M15 9l.01 0" />
            <path d="M8 13a4 4 0 1 0 8 0h-8" />
        </svg>
    );
}