import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/server/supabase';
import { Parser } from 'json2csv';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { success: false, error: 'Error fetching tasks' },
        { status: 500 }
      );
    }

    const csvTasks = (tasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.completed ? 'Completed' : 'Pending',
      dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US') : '',
      createdAt: new Date(task.created_at).toLocaleDateString('en-US'),
      updatedAt: new Date(task.updated_at).toLocaleDateString('en-US')
    }));

    const fields = ['id', 'title', 'description', 'priority', 'status', 'dueDate', 'createdAt', 'updatedAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(csvTasks);

    const timestamp = new Date().toISOString().split('T')[0];
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=tasks_${timestamp}.csv`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting to CSV:', error);
    return NextResponse.json(
      { success: false, error: 'Error exporting to CSV' },
      { status: 500 }
    );
  }
}