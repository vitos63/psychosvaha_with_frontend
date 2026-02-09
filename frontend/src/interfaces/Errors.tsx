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
    firstName?: string;
    secondName?: string;
    city?: string;
    phone?: string;
    about?: string;
    website?: string;
    sex?: string;
    age?: string;
    experience?: string;
    minClientAge?: string;
    maxClientAge?: string;
    contactsForClient?: string;
    acceptsOnline?: string;
    isPsychiatrist?: string;
    isGerontologist?: string;
    isFamilyTherapist?: string;
    doesGroupTherapy?: string;
    isSupervisor?: string;
    consent?: string;
    currencies?: string;
    availableToCall?: string;
}