import { NextRequest, NextResponse } from 'next/server';

// Mock badge counts - in a real app, this would come from a database or service
export async function GET(_request: NextRequest) {
  try {
    // In a real app, we would get the user ID from the request (via Clerk) and then compute the counts
    // For now, we return mock data
    const counts = {
      '/admin/quotes': 3,
      '/admin/invoices': 5,
      '/admin/projects': 2,
      '/admin/contracts': 0, // We'll set this to 0 for now, but it could be the number of draft contracts or something else
      '/admin/clients': 0,
      '/admin/settings': 0,
    };

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching badge counts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
