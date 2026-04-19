import { ClientRequestInterface } from "../interfaces/ClientRequestInterface"
import { TherapistInterface } from "@/interfaces/TherapistInterface"

// Must match FastAPI paths exactly (no trailing slash) — otherwise Starlette 307 redirect
// can point to http:// behind nginx and trigger mixed-content blocking in the browser.
const API_BASE_URL: string = process.env.REACT_APP_API_URL

export async function createClientRequest(clientRequest: ClientRequestInterface) {
    try {
        const response = await fetch(`${API_BASE_URL}/client-request`, {
            method: 'POST',
             headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientRequest),
        })
        const data: unknown = await response.json().catch(() => ({}))
        if (!response.ok) {
            const detail =
                typeof data === 'object' && data !== null && 'detail' in data
                    ? String((data as { detail: unknown }).detail)
                    : `HTTP ${response.status}`
            throw new Error(detail)
        }
        return data
    }
    catch (error){
        console.error('Ошибка при создании заявки клиента')
        throw error
    }
}


export async function createTherapist(therapist: TherapistInterface) {
    try {
        const response = await fetch(`${API_BASE_URL}/therapist`, {
            method: 'POST',
             headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(therapist),
        })
        const data: unknown = await response.json().catch(() => ({}))
        if (!response.ok) {
            const detail =
                typeof data === 'object' && data !== null && 'detail' in data
                    ? String((data as { detail: unknown }).detail)
                    : `HTTP ${response.status}`
            throw new Error(detail)
        }
        return data
    }
    catch (error){
        console.error('Ошибка при создании терапевта')
        throw error
    }
}
