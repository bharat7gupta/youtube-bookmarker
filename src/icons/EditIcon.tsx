import { IconProps } from "./types";

export default function EditIcon({ width = 20, height = 20, title, className, onClick }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" className={className} onClick={onClick} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {title ? <title>{title}</title> : null}
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
            <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
            <path d="M16 5l3 3" />
        </svg>
    );
}
