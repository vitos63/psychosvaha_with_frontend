import { ClientRequestInterface } from "../interfaces/ClientRequestInterface"


const API_BASE_URL: string = 'http://127.0.0.1:8000'


export async function createClientRequest(clientRequest: ClientRequestInterface) {
    try {
        const response = await fetch(`${API_BASE_URL}/client-request/`, {
            method: 'POST',
        })
    const data = await response.json()
    return data
    }
    catch (error){
        console.error('Ошибка при создании заявки клиента')
        throw error
    }
}
