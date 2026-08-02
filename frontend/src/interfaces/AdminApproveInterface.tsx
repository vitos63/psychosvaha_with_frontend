import { ClientRequestForAdmin, TherapistForAdmin } from "./AdminMainInfoInterface";

export interface ApproveClientRequestInterface extends ClientRequestForAdmin {}

export interface ApproveTherapistInterface extends TherapistForAdmin {}

export interface DisApproveTherapistInterface {
    tg_id: number
}
