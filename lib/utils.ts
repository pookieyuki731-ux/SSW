import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  //const seconds = Math.floor((ms % 60000) / 1000);
  const seconds = Math.floor((ms / 1000) % 60);
  const milliseconds = ms % 1000;
  
  if (minutes === 0) {
      return `${seconds}:${milliseconds.toString().padStart(3, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

export function formatGap(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms / 1000) % 60);
  const milliseconds = ms % 1000;
  
  return `+${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}
