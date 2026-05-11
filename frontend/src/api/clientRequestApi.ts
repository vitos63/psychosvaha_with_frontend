import { API_BASE_URL } from './config';
import { getErrorDetail } from './http';
import { ClientRequestInterface } from '../interfaces/ClientRequestInterface';
import { Therapist } from '../interfaces/TherapistInterface';

export async function createClientRequest(clientRequest: ClientRequestInterface) {
  try {
    const response = await fetch(`${API_BASE_URL}/client-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientRequest),
    });
    const data: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getErrorDetail(response, data));
    }
    return data;
  } catch (error) {
    console.error('Ошибка при создании заявки клиента');
    throw error;
  }
}

export async function getRecommendedTherapists(requestId: number): Promise<Therapist[]> {
  const response = await fetch(`${API_BASE_URL}/recommended_therapists/${requestId}`, {
    method: 'GET',
  });
  const data: unknown = await response.json().catch(() => ([]));

  if (!response.ok) {
    throw new Error(getErrorDetail(response, data));
  }

  return Array.isArray(data) ? (data as Therapist[]) : [];
}
