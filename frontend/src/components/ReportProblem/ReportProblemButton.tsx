import { useState } from "react"
import { sendReportToAdminApi } from "@/api/problemReportApi"
import { ProblemReport } from "@/interfaces/ProblemReport"

function ReportProblem () {
    const [isFormVisible, setIsFormVisible] = useState(false)
    const [problemDescription, setProblemDescription ] = useState("")
    const [isSending, setIsSending] = useState(false)

    const tgUsername = window.Telegram?.WebApp.initDataUnsafe?.user?.username ?? ""

    async function sendProblemReport () {
        setIsSending(true)
        const report: ProblemReport = {
            tg_username: tgUsername,
            problem_description: problemDescription
        }
        try {
            await sendReportToAdminApi(report)
        }
        catch (error) {
            console.error("Не удалось отправить сообщение о проблеме:", error)
        } finally {
            setIsSending(false)
        }
        
    }
    return (
        <div>
        <button onClick={() => setIsFormVisible(true)}>
            Сообщить о проблеме
        </button>
        {isFormVisible && (
            <div>
                <p>Опишите проблему, администратор может связаться с вам для уточнения информации</p>
                <textarea 
                value={problemDescription}
                onChange={(event) =>
                            setProblemDescription(event.target.value)
                        } 
                placeholder="Подробно опишите ваши шаги до возникновения проблемы, а затем саму проблему"
                rows={6}
                />
                <button 
                onClick={sendProblemReport}
                disabled={!problemDescription.trim() || isSending}>
                    {isSending ? "Отправка..." : "Отправить"}
                </button>
                <button onClick={() => setIsFormVisible(false)}
                     disabled={isSending}>
                    Отменить
                </button>
            </div>
        )}
        </div>
        
    )
}

export default ReportProblem