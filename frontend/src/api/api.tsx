import { ClientRequestInterface } from "../interfaces/ClientRequestInterface"
import {
    TherapistByTgIdResponse,
    TherapistCreateInterface,
    TherapistUpdateInterface,
} from "interfaces/TherapistInterface"

// Must match FastAPI paths exactly (no trailing slash) — otherwise Starlette 307 redirect
// can point to http:// behind nginx and trigger mixed-content blocking in the browser.
export const API_BASE_URL: string = process.env.REACT_APP_API_URL || process.env.VITE_API_BASE_URL || ""

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

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


export async function createTherapist(therapist: TherapistCreateInterface) {
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

export async function updateTherapist(
    therapist: TherapistUpdateInterface,
    tg_id: number,
    file?: File | null,
): Promise<TherapistByTgIdResponse> {
    try {
        const formData = new FormData()
        formData.append('first_name', therapist.first_name)
        formData.append('last_name', therapist.last_name)
        formData.append('city', therapist.city ?? '')
        formData.append('phone_number', therapist.phone_number ?? '')
        formData.append('email', therapist.email ?? '')
        formData.append('pitch', therapist.pitch ?? '')
        formData.append('site', therapist.site ?? '')
        formData.append('sex', therapist.sex)
        formData.append('age', therapist.age)
        formData.append('experience', therapist.experience)
        formData.append('min_client_age', therapist.min_client_age)
        formData.append('max_client_age', therapist.max_client_age)
        formData.append('online', String(therapist.online))
        formData.append('consent', String(therapist.consent))
        formData.append('currency_amount', JSON.stringify(therapist.currency_amount))
        formData.append('contacts_for_client', therapist.contacts_for_client)
        formData.append('available_to_call', String(therapist.available_to_call))
        formData.append('tag_ids', JSON.stringify(therapist.tag_ids))

        if (file) {
            formData.append('file', file)
        }

        const response = await fetch(`${API_BASE_URL}/therapist/${tg_id}`, {
            method: 'PUT',
            body: formData,
        })

        const data: unknown = await response.json().catch(() => ({}))

        if (!response.ok) {
            const detail =
                typeof data === 'object' && data !== null && 'detail' in data
                    ? String((data as { detail: unknown }).detail)
                    : `HTTP ${response.status}`
            throw new Error(detail)
        }

        return data as TherapistByTgIdResponse
    } catch (error) {
        console.error('Ошибка при обновлении терапевта')
        throw error
    }
}

export async function getTherapistByTgId(tg_id: number): Promise<TherapistByTgIdResponse> {
    const response = await fetch(`${API_BASE_URL}/therapist/${tg_id}`)
    const data: unknown = await response.json().catch(() => ({}))

    if (!response.ok) {
        const detail =
            typeof data === 'object' && data !== null && 'detail' in data
                ? String((data as { detail: unknown }).detail)
                : `HTTP ${response.status}`
        throw new ApiError(detail, response.status)
    }

    return data as TherapistByTgIdResponse
}
