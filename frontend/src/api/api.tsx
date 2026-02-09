import { ClientRequestInterface } from "../interfaces/ClientRequestInterface"
import { TherapistInterface } from "@/interfaces/TherapistInterface"


const API_BASE_URL: string = 'http://127.0.0.1:8000'


export async function createClientRequest(clientRequest: ClientRequestInterface) {
    try {
        const response = await fetch(`${API_BASE_URL}/client-request/`, {
            method: 'POST',
             headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientRequest),
        })
    const data = await response.json()
    return data
    }
    catch (error){
        console.error('Ошибка при создании заявки клиента')
        throw error
    }
}


export async function createTherapist(therapist: TherapistInterface) {
    try {
        const response = await fetch(`${API_BASE_URL}/therapist/`, {
            method: 'POST',
             headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(therapist),
        })
    const data = await response.json()
    return data
    }
    catch (error){
        console.error('Ошибка при создании терапевта')
        throw error
    }
}