export function getErrorDetail(response: Response, data: unknown): string {
    if (typeof data === 'object' && data !== null && 'detail' in data) {
        return String((data as { detail: unknown }).detail);
    }
    return `HTTP ${response.status}`;
}
