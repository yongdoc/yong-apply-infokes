export function getSliceBetween(text: string, startChar: string, endChar: string): string {
    const startIndex = text.indexOf(startChar);
    if (startIndex === -1) return "";
    const endIndex = text.indexOf(endChar, startIndex + startChar.length);
    if (endIndex === -1) return "";

    return text.slice(startIndex + startChar.length, endIndex);
}