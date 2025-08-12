import { NextResponse } from 'next/server';
import { Application } from '@/types/application';

// Mock data for development
const mockApplication: Application = {
  id: 'app_123',
  userId: 'user_456',
  status: 'submitted',
  reference: 'MEC-2025-001',
  submittedAt: new Date().toISOString(),
  reviewETADays: 3,
  accommodationId: null,
  amountDue: 1200,
  paymentDueDate: '2025-08-20T12:00:00.000Z',
  unreadMessages: 2,
};

export async function GET() {
  // In real app, fetch user from session and query DB
  // For now, always return mock data
  return NextResponse.json({ application: mockApplication });
}
