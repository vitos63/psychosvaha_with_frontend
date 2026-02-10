export interface TherapistInterface {
    first_name: string
    last_name: string
    city?: string | null
    phone_number?: string | null
    email?: string | null
    photo?: string | null
    pitch?:  string | null
    site?: string | null
    sex: string | null
    age: string
    experience: string
    min_client_age: string
    max_client_age: string
    online: boolean
    currency_amount: Record<string, number>
    contacts_for_client: string
    tag_ids: number[]
}
