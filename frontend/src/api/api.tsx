export const API_BASE_URL: string = process.env.REACT_APP_API_URL || process.env.VITE_API_BASE_URL || ""


export function avatarPathToMediaUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath?.trim()) {
        return null
    }
    const cleanPath = avatarPath.replace(/^\/+/, '').replace(/^media\//, '')
    const configured = API_BASE_URL.trim()
    let origin: string
    if (configured) {
        try {
            origin = new URL(configured).origin
        } catch {
            origin = window.location.origin
        }
    } else {
        origin = window.location.origin
    }
    return `${origin}/media/${cleanPath}`
}

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}
