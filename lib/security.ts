/**
 * Sanitizes a plain string by removing all HTML tags using regex.
 * This is a lightweight server-safe alternative to DOMPurify for basic needs.
 * 
 * @param text The text to sanitize
 * @returns Plain text without HTML
 */
export function stripHtml(text: string): string {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Basic HTML sanitizer that prevents common XSS but is lightweight.
 * For now, it strips all tags to ensure safety and avoid jsdom dependency issues on server.
 * 
 * @param html The raw HTML string
 * @param mode 'STRICT' or 'BASIC'
 * @returns Sanitized string
 */
export function sanitizeHtml(html: string, mode: 'STRICT' | 'BASIC' = 'BASIC'): string {
    if (!html) return '';
    
    // For now, both modes strip all tags to avoid the jsdom/DOMPurify ESM issue on Vercel
    // In the future, we can implement a safe white-list based regex or use a server-safe library
    return stripHtml(html);
}