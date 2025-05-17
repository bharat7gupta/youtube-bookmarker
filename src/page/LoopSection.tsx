import { h } from 'preact';
import { LoopData } from '../types/bookmark';

interface LoopSectionProps {
  loopData: LoopData;
  duration: number;
  hidden: boolean;
}

export default function LoopSection({ loopData, duration, hidden }: LoopSectionProps) {
  if (!loopData?.startTime || !loopData?.endTime) {
    return null;
  }

  const leftPosition = ((loopData.startTime / duration) * 100);
  const rightPosition = (100 - ((loopData.endTime / duration) * 100));
  const className = `ct-bookmarks-loop${hidden ? ' ct-hide-bookmark' : ''}`;
  
  return (
    <div 
      className={className}
      style={{ 
        left: `${leftPosition}%`,
        right: `${rightPosition}%`
      }}
    />
  );
} 