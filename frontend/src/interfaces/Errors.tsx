export interface ClientFormErrors {
  problem_description?: string;
  need_psychiatrist?: string;
  sex?: string;
  age?: string;
  city?: string;
  is_online?: string;
  psychotherapist_sex?: string;
  consent?: string;
  currencies?: string;
  [key: string]: string | undefined;
}

export interface TherapistFirstFormErrors {
  firstName?: string;
  secondName?: string;
  consent?: string
}

export interface TherapistSecondFormErrors {
    first_name?: string;
    last_name?: string;
    city?: string;
    phone?: string;
    about?: string;
    website?: string;
    sex?: string;
    age?: string;
    experience?: string;
    email?: string;
    min_client_age?: string;
    max_client_age?: string;
    contacts_for_client?: string;
    acceptsOnline?: string;
    isPsychiatrist?: string;
    isGerontologist?: string;
    isFamilyTherapist?: string;
    doesGroupTherapy?: string;
    isSupervisor?: string;
    consent?: string;
    currency_amount?: string;
    availableToCall?: string;
}