import type { ProblemReport } from "../interfaces/ProblemReport";
import { API_BASE_URL } from "./config";
import { getErrorDetail } from "./http";


export async function sendReportToAdminApi(problemReport: ProblemReport): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/send-problem-report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemReport),
    });

    if (!response.ok) {
        const data: unknown = await response.json().catch(() => ({}));
        throw new Error(getErrorDetail(response, data));
    }
}
