import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return NextResponse.json({
      success: true,
      status: 'healthy',
      message: 'Task Manager API - Frontend Proxy',
      timestamp: new Date().toISOString(),
      backend: API_BASE_URL
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Backend connection error',
      message: error.message
    }, { status: 500 });
  }
}