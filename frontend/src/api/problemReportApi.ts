import { ProblemReport } from "@/interfaces/ProblemReport";
import { API_BASE_URL } from "./config";
import { getErrorDetail } from "./http";


export async function sendReportToAdminApi (problemReport: ProblemReport) {
     try {
            const response = await fetch(`${API_BASE_URL}/send-problem-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(problemReport),
            });
            const data: unknown = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(getErrorDetail(response, data));
            }
            return data;
        }
        catch (error) {
            console.error('Ошибка при отправке сообщения о проблеме');
            throw error;
        }
}