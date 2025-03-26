import { IconProps } from "./types";


export default function DownArrow({ width = 6, height = 6, title, className, onClick }: IconProps) {
    return (
        <svg fill="#a5a5a5" height={height} width={width} version="1.1" viewBox="0 0 330 330" className={className} onClick={onClick}>
        {title ? <title>{title}</title> : null}
        <path d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
            c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
            s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"/>
        </svg>
    );
}
