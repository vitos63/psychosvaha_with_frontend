export interface ClientRequestForAdmin {
  id: number
  problem_description: string
  tags: string[]
}


export interface TherapistForAdmin {
  tg_id: number
  first_name: string
  last_name: string
}


export interface AdminMainInfoResponse {
  not_approved_client_requests: ClientRequestForAdmin[];
  not_approved_therapists: TherapistForAdmin[];
}
