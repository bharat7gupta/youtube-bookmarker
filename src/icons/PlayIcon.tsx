import { IconProps } from "./types";

export default function PlayIcon({ width = 20, height = 20, title, className, onClick }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" className={className} onClick={onClick} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {title ? <title>{title}</title> : null}
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M7 4v16l13 -8z" />
        </svg>
    );
}