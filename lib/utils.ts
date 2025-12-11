import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Debounce utility */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, wait);
  };
}

// Pick best available mimeType for MediaRecorder
export function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const mt of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported?.(mt)
    ) {
      return mt;
    }
  }
  return "audio/webm";
}

/**
 * Sets a value at a nested path in an object, supporting dot and bracket notation.
 * Returns the modified object (clone).
 */
export function setNestedValue(obj: any, path: string, value: any): any {
    const newObj = structuredClone(obj);
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = newObj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
            // Check if next key is a number to create array
            current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return newObj;
}
