import { API_BASE_URL } from "./config";
import { getErrorDetail } from "./http";
import { TherapistCreateInterface, TherapistUpdateInterface } from "interfaces/TherapistInterface";

export async function createTherapist(therapist: TherapistCreateInterface) {
    try {
        const response = await fetch(`${API_BASE_URL}/therapist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(therapist),
        });
        const data: unknown = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(getErrorDetail(response, data));
        }
        return data;
    }
    catch (error){
        console.error('Ошибка при создании терапевта');
        throw error;
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
        });
        const data: unknown = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(getErrorDetail(response, data));
        }
        return data;
    }
    catch (error){
        console.error('Ошибка при обновлении терапевта');
        throw error;
    }
}
