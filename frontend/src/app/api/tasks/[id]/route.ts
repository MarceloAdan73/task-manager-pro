import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/server/supabase';

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/[id] - Obtener tarea específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to view this task' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatTask(task)
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Actualizar tarea
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { title, description, priority, completed, dueDate } = await request.json();

    // Verificar que la tarea existe y pertenece al usuario
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (existingTask.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to modify this task' },
        { status: 403 }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = {};
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Title cannot be empty' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description === '' ? null : description.trim();
    }
    if (priority !== undefined) {
      updateData.priority = normalizePriority(priority);
    }
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }
    if (dueDate !== undefined) {
      updateData.due_date = dueDate ? new Date(dueDate).toISOString() : null;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json(
        { success: false, error: 'Error updating task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatTask(task)
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Eliminar tarea
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que la tarea existe y pertenece al usuario
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (existingTask.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this task' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json(
        { success: false, error: 'Error deleting task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Toggle completion
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar que la tarea existe y pertenece al usuario
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingTask) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (existingTask.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to modify this task' },
        { status: 403 }
      );
    }

    const newCompleted = !existingTask.completed;

    const { data: task, error } = await supabase
      .from('tasks')
      .update({ 
        completed: newCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling task:', error);
      return NextResponse.json(
        { success: false, error: 'Error updating task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatTask(task)
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}