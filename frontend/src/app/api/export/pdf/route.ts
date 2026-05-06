import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const timestamp = new Date().toISOString().split('T')[0];
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=tasks_report_${timestamp}.pdf`,
      },
    });
  } catch (error) {
    console.error('PDF export proxy error:', error);
    return NextResponse.json({ success: false, error: 'Error exporting to PDF' }, { status: 500 });
  }
}