import { useState } from "react"
import { sendReportToAdminApi } from "../../api/problemReportApi"
import type { ProblemReport } from "../../interfaces/ProblemReport"
import "./ReportProblemButton.css"

interface ReportProblemProps {
    tgUsername?: string
}

type SubmitStatus = "idle" | "success" | "error"

function ReportProblem({ tgUsername = "" }: ReportProblemProps) {
    const [isFormVisible, setIsFormVisible] = useState(false)
    const [problemDescription, setProblemDescription] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle")

    function openForm() {
        setSubmitStatus("idle")
        setIsFormVisible(true)
    }

    function closeForm() {
        if (isSending) return

        setIsFormVisible(false)
        setProblemDescription("")
        setSubmitStatus("idle")
    }

    async function sendProblemReport() {
        const description = problemDescription.trim()
        if (!description || isSending) return

        const report: ProblemReport = {
            tg_username: tgUsername,
            problem_description: description,
        }

        try {
            setIsSending(true)
            setSubmitStatus("idle")
            await sendReportToAdminApi(report)
            setProblemDescription("")
            setSubmitStatus("success")
        } catch (error) {
            setSubmitStatus("error")
            console.error("Не удалось отправить сообщение о проблеме:", error)
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="report-problem">
            <button
                className="report-problem__launcher"
                type="button"
                onClick={openForm}
                aria-haspopup="dialog"
            >
                <span className="report-problem__launcher-icon" aria-hidden="true">!</span>
                <span>Сообщить о проблеме</span>
            </button>

            {isFormVisible && (
                <div className="report-problem__overlay" onMouseDown={closeForm}>
                    <section
                        className="report-problem__dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="report-problem-title"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="report-problem__header">
                            <div>
                                <span className="report-problem__eyebrow">Обратная связь</span>
                                <h2 id="report-problem-title">Сообщить о проблеме</h2>
                            </div>
                            <button
                                className="report-problem__close"
                                type="button"
                                onClick={closeForm}
                                disabled={isSending}
                                aria-label="Закрыть окно"
                            >
                                ×
                            </button>
                        </div>

                        {submitStatus === "success" ? (
                            <div className="report-problem__result report-problem__result--success" role="status">
                                <span aria-hidden="true">✓</span>
                                <div>
                                    <strong>Сообщение отправлено</strong>
                                    <p>Спасибо! Администратор изучит обращение и при необходимости свяжется с вами.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="report-problem__description">
                                    Опишите шаги до возникновения ошибки и расскажите, что произошло.
                                </p>
                                <label className="report-problem__field" htmlFor="problem-description">
                                    Описание проблемы
                                </label>
                                <textarea
                                    id="problem-description"
                                    className="report-problem__textarea"
                                    value={problemDescription}
                                    onChange={(event) => setProblemDescription(event.target.value)}
                                    placeholder="Например: я открыл анкету, нажал кнопку «Отправить», после чего…"
                                    rows={6}
                                    autoFocus
                                    disabled={isSending}
                                />

                                {submitStatus === "error" && (
                                    <p className="report-problem__error" role="alert">
                                        Не удалось отправить сообщение. Проверьте подключение и попробуйте ещё раз.
                                    </p>
                                )}
                            </>
                        )}

                        <div className="report-problem__actions">
                            {submitStatus !== "success" && (
                                <button
                                    className="report-problem__button report-problem__button--primary"
                                    type="button"
                                    onClick={sendProblemReport}
                                    disabled={!problemDescription.trim() || isSending}
                                >
                                    {isSending ? "Отправляем…" : "Отправить"}
                                </button>
                            )}
                            <button
                                className="report-problem__button report-problem__button--secondary"
                                type="button"
                                onClick={closeForm}
                                disabled={isSending}
                            >
                                {submitStatus === "success" ? "Готово" : "Отменить"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}

export default ReportProblem
