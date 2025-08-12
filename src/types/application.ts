export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'accommodation_assigned'
  | 'rejected'
  | 'completed';

export interface Application {
  id: string;
  userId: string;
  status: ApplicationStatus;
  reference?: string;
  submittedAt?: string; // ISO
  reviewETADays?: number;
  accommodationId?: string | null;
  amountDue?: number; // in GHS
  paymentDueDate?: string | null;
  unreadMessages?: number;
}
