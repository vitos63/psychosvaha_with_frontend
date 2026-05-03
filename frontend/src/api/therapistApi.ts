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
    catch (error) {
        console.error('Ошибка при создании терапевта');
        throw error;
    }
}

export async function updateTherapist(therapist, tg_id) {
    const formData = new FormData();

    Object.entries(therapist).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (value instanceof File) {
            formData.append(key, value);
            return;
        }

        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });

    const response = await fetch(`${API_BASE_URL}/therapist/${tg_id}`, {
        method: 'PUT',
        body: formData,
    });

    const data = await response.json();
    return data;
}
