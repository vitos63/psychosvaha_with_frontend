export interface TherapistCreateInterface {
    tg_id: number
    first_name: string
    last_name: string
    consent: boolean
}


export interface TherapistUpdateInterface {
    first_name: string
    last_name: string
    city?: string | null
    phone_number?: string | null
    email?: string | null
    pitch?:  string | null
    site?: string | null
    sex: string
    age: string
    experience: string
    min_client_age: string
    max_client_age: string
    online: boolean
    consent: boolean
    available_to_call: boolean
    currency_amount: Record<string, number>
    contacts_for_client: string
    tag_ids: number[]
}

export interface TherapistByTgIdResponse {
    first_name: string
    last_name: string
    city?: string | null
    phone_number?: string | null
    email?: string | null
    photo?: string | null
    pitch?: string | null
    site?: string | null
    sex: string
    age: number
    experience: number
    min_client_age: number
    max_client_age: number
    online: boolean
    consent: boolean
    available_to_call: boolean
    currency_amount?: Record<string, number>
    contacts_for_client?: string | null
    tag_ids?: number[]
}
