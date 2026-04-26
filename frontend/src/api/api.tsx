import { AdminMainInfoResponse } from "../interfaces/AdminMainInfoInterface"
import { ClientRequestInterface } from "../interfaces/ClientRequestInterface"
import { TherapistCreateInterface, TherapistUpdateInterface } from "interfaces/TherapistInterface"


const API_BASE_URL: string = process.env.REACT_APP_API_URL

export async function fetchAdminMainInfo(tgId: number): Promise<AdminMainInfoResponse> {
    const params = new URLSearchParams({ tg_id: String(tgId) })
    const response = await fetch(`${API_BASE_URL}/admin/main-info?${params.toString()}`, {
        method: 'GET',
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(response.statusText)
    }
    return data
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


export async function updateTherapist(therapist: TherapistUpdateInterface, tg_id: number) {
    try {
        const response = await fetch(`${API_BASE_URL}/therapist/${tg_id}`, {
            method: 'PUT',
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
        console.error('Ошибка при обновлении терапевта')
        throw error
    }
}