import { API_BASE_URL } from "./config";
import { getErrorDetail } from "./http";
import { AdminMainInfoResponse } from "../interfaces/AdminMainInfoInterface";
import { ApproveClientRequestInterface, ApproveTherapistInterface } from "../interfaces/AdminApproveInterface";

export async function fetchAdminMainInfo(tgId: number): Promise<AdminMainInfoResponse> {
    const params = new URLSearchParams({ tg_id: String(tgId) });
    const response = await fetch(`${API_BASE_URL}/admin/main-info?${params.toString()}`, {
        method: 'GET',
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return data;
}

export async function approveClientRequest(payload: ApproveClientRequestInterface): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/approve-client-request`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data: unknown = await response.json().catch(() => ({}));
        throw new Error(getErrorDetail(response, data));
    }
}

export async function approveTherapist(payload: ApproveTherapistInterface): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/approve-therapist`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data: unknown = await response.json().catch(() => ({}));
        throw new Error(getErrorDetail(response, data));
    }
}
