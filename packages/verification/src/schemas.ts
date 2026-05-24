// Zod schemas for verification forms — shared between web portals and mobile apps.
// Installed in consuming apps: bun add zod

export interface EmploymentFormData {
  employerName: string;
  employerContact: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  reasonForLeaving?: string;
  remarks?: string;
}

export interface EducationFormData {
  instituteName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  result?: string;
  remarks?: string;
}

export interface AddressFormData {
  address: string;
  city: string;
}

export interface InsuranceFormData {
  policyNumber: string;
  insurer: string;
  remarks?: string;
}
