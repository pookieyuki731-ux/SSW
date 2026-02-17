export function parseLapTimeToMs(input: string): number {
  if (!input || typeof input !== 'string') {
    throw new Error("Input must be a non-empty string.");
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Input cannot be empty or whitespace only.");
  }

  // Regex for formats:
  // M:SS.mmm (e.g., 1:32.554 or 01:32.554)
  // SS.mmm (e.g., 92.554)
  
  // Strategy: Split by colon to detect minutes.
  const parts = trimmed.split(':');

  if (parts.length > 3) {
    throw new Error("Invalid format: Too many colons. Use M:SS:mmm or M:SS.mmm or SS.mmm");
  }

  let totalMs = 0;

  if (parts.length === 3) {
    // Has minutes: "M:SS:mmm"
    const [minutesStr, secondsStr, msStr] = parts;

    if (!/^\d+$/.test(minutesStr)) {
        throw new Error("Invalid format: Minutes part must be a non-negative integer.");
    }
    const minutes = parseInt(minutesStr, 10);

    if (!/^\d{2}$/.test(secondsStr)) {
         throw new Error("Invalid format: Seconds part must be 2 digits.");
    }
    const secondsVal = parseInt(secondsStr, 10);
    if (secondsVal >= 60) {
        throw new Error("Invalid time: Seconds must be less than 60.");
    }

    if (!/^\d{3}$/.test(msStr)) {
         throw new Error("Invalid format: Milliseconds part must be 3 digits.");
    }
    const msVal = parseInt(msStr, 10);
    
    totalMs = (minutes * 60 * 1000) + (secondsVal * 1000) + msVal;
  } else if (parts.length === 2) {
    // Check if it's "M:SS.mmm" (old style) or "SS:mmm" (new style without minutes) or "M:SS" (if we supported it, but we enforce millis)
    
    const [part1, part2] = parts;
    
    if (part2.includes('.')) {
        // "M:SS.mmm"
        const minutesStr = part1;
        const secondsStr = part2;

        if (!/^\d+$/.test(minutesStr)) {
            throw new Error("Invalid format: Minutes part must be a non-negative integer.");
        }
        const minutes = parseInt(minutesStr, 10);

        if (!/^\d{1,2}\.\d{3}$/.test(secondsStr)) {
            throw new Error("Invalid format: Seconds part must be SS.mmm with exactly 3 decimal places.");
        }
        
        const secondsVal = parseFloat(secondsStr);
        if (secondsVal >= 60) {
            throw new Error("Invalid time: Seconds must be less than 60.");
        }

        totalMs = (minutes * 60 * 1000) + Math.round(secondsVal * 1000);
    } else {
        // Assume "SS:mmm" (e.g. 55:123) OR could be attempt at M:SS (but we require millis)
        // If part1 is large, it could be seconds.
        
        if (/^\d+$/.test(part1) && /^\d{3}$/.test(part2)) {
             const secondsVal = parseInt(part1, 10);
             const msVal = parseInt(part2, 10);
             totalMs = (secondsVal * 1000) + msVal;
        } else {
             // Fallback/Error
             throw new Error("Invalid format. Use M:SS:mmm, M:SS.mmm, or SS:mmm / SS.mmm");
        }
    }

  } else {
    // One part: "SS.mmm"
    const secondsStr = parts[0];
    
    if (!/^\d+\.\d{3}$/.test(secondsStr)) {
         // Maybe just milliseconds? "mmm"? No.
         throw new Error("Invalid format: Must be SS.mmm with exactly 3 decimal places (or use colons).");
    }

    const seconds = parseFloat(secondsStr);
    totalMs = Math.round(seconds * 1000);
  }

  if (isNaN(totalMs)) {
      throw new Error("Invalid time: Result is NaN.");
  }
  
  return totalMs;
}
export function formatMsToLapTime(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    throw new Error("Input must be a non-negative number.");
  }

  const minutes = Math.floor(ms / 60000);
  const remainingMs = ms % 60000;
  const seconds = Math.floor(remainingMs / 1000);
  const milliseconds = remainingMs % 1000;

  const mStr = minutes.toString();
  const sStr = seconds.toString().padStart(2, '0');
  const msStr = milliseconds.toString().padStart(3, '0');

  // Use colon for milliseconds separator as requested
  if (minutes === 0) {
      return `${sStr}:${msStr}`;
  }
  return `${mStr}:${sStr}:${msStr}`;
}
