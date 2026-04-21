import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase';

export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Health check error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        message: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: 'healthy',
      message: 'Task Manager API - Next.js + Supabase',
      timestamp: new Date().toISOString(),
      database: 'Supabase PostgreSQL',
      taskCount: count || 0
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Database connection error',
      message: error.message
    }, { status: 500 });
  }
}