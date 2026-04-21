import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/server/supabase';

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

const normalizePriority = (p: string) => {
  const priority = (p || 'MEDIUM').toUpperCase();
  if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) return priority;
  return 'MEDIUM';
};

function formatTask(task: any) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority,
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    userId: task.user_id
  };
}

// GET /api/tasks - Obtener todas las tareas del usuario
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

    return NextResponse.json({
      success: true,
      data: tasks?.map(formatTask) || []
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Crear nueva tarea
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { title, description, priority, dueDate } = await request.json();

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const taskData = {
      title: title.trim(),
      description: description?.trim() || null,
      priority: normalizePriority(priority || 'MEDIUM'),
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      user_id: userId
    };

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { success: false, error: 'Error creating task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatTask(task)
    }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}