export interface ClientRequestInterface {
    client_id: number
    problem_description: string
    sex: string
    age: string
    currency_amount: Record<string, number>
    city?: string
    is_online: boolean
    psychotherapist_sex: string | null
    need_psychiatrist?: boolean | null
}
