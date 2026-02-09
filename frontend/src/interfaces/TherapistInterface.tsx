export interface TherapistInterface {
    first_name: string
    last_name: string
    city?: string
    phone_number?: string
    email?: string
    photo?: string
    pitch?:  string
    site?: string
    sex?: string
    age: number
    experience: number
    min_client_age: number
    max_client_age: number
    online: boolean
    currency_amount: string
    contacts_for_client: string
    tag_ids: string[]
}
