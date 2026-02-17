import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { Priority, normalizePriority, formatTaskForFrontend } from '../utils/priorityUtils';

console.log('Controller task.controller.ts CARGADO (VERSIÓN OPTIMIZADA)');

// GET /api/tasks - Solo tareas del usuario autenticado
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  console.log('GET /api/tasks - USANDO PRISMA (PostgreSQL)');

  try {
    const userId = req.userId; // ✅ Obtenido del middleware auth

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { userId }, // ✅ Filtrar por usuario
      orderBy: { createdAt: 'desc' }
    });

    const formattedTasks = tasks.map(formatTaskForFrontend);

    console.log(`${formattedTasks.length} tareas obtenidas de PostgreSQL para user ${userId}`);

    res.json({ success: true, data: formattedTasks });
  } catch (error: any) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching tasks' // ✅ CORREGIDO (antes: 'Error al obtener las tareas')
    });
  }
};

// GET /api/tasks/:id - Solo si pertenece al usuario
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const userId = req.userId; // ✅ Usuario autenticado

  console.log(`GET /api/tasks/${id} - USANDO PRISMA`);

  try {
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const task = await prisma.task.findUnique({ 
      where: { id }
    });

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    // ✅ Verificar que la tarea pertenezca al usuario
    if (task.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to view this task'
      });
      return;
    }

    res.json({
      success: true,
      data: formatTaskForFrontend(task)
    });
  } catch (error: any) {
    console.error('Error obteniendo tarea:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching task'
    });
  }
};

// POST /api/tasks - Crear tarea para el usuario autenticado
export const createTask = async (req: Request, res: Response): Promise<void> => {
  console.log('POST /api/tasks - CREANDO EN POSTGRESQL');
  console.log('Datos recibidos:', JSON.stringify(req.body));

  try {
    const userId = req.userId; // ✅ Usuario autenticado

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { title, description, priority: rawPriority, dueDate } = req.body;

    // Validar campos requeridos
    if (!title || typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Title is required' // ✅ CORREGIDO (antes: 'El título es requerido')
      });
      return;
    }

    // Normalizar prioridad
    const priority = normalizePriority(rawPriority || 'MEDIUM') as Priority;

    const taskData: any = {
      title: title.trim(),
      priority,
      userId // ✅ Asociar tarea al usuario
    };

    // Agregar campos opcionales
    if (description && typeof description === 'string') {
      taskData.description = description.trim();
    }

    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }

    const task = await prisma.task.create({
      data: taskData
    });

    console.log(`Tarea creada en PostgreSQL: ${task.id} - "${task.title}" para user ${userId}`);

    res.status(201).json({
      success: true,
      data: formatTaskForFrontend(task)
    });
  } catch (error: any) {
    console.error('Error creando tarea:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating task' // ✅ CORREGIDO (antes: 'Error al crear la tarea')
    });
  }
};

// PUT /api/tasks/:id - Solo si pertenece al usuario
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const userId = req.userId; // ✅ Usuario autenticado

  console.log(`PUT /api/tasks/${id} - ACTUALIZANDO EN POSTGRESQL`);

  try {
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { title, description, priority: rawPriority, completed, dueDate } = req.body;

    // Verificar si la tarea existe
    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    // ✅ Verificar que la tarea pertenezca al usuario
    if (existingTask.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to modify this task'
      });
      return;
    }

    // Preparar datos para actualizar
    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Title cannot be empty'
        });
        return;
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description === '' ? null : description.trim();
    }

    if (rawPriority !== undefined) {
      updateData.priority = normalizePriority(rawPriority) as Priority;
    }

    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    });

    console.log(`Tarea actualizada en PostgreSQL: ${task.id} - "${task.title}"`);

    res.json({
      success: true,
      data: formatTaskForFrontend(task)
    });
  } catch (error: any) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating task'
    });
  }
};

// DELETE /api/tasks/:id - Solo si pertenece al usuario
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const userId = req.userId; // ✅ Usuario autenticado

  console.log(`DELETE /api/tasks/${id} - ELIMINANDO DE POSTGRESQL`);

  try {
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Verificar si la tarea existe
    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    // ✅ Verificar que la tarea pertenezca al usuario
    if (existingTask.userId !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this task'
      });
      return;
    }

    await prisma.task.delete({ where: { id } });

    console.log(`Tarea eliminada de PostgreSQL: ${id}`);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting task'
    });
  }
};

// GET /api/health
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  console.log('GET /api/health - VERIFICANDO POSTGRESQL');

  try {
    const taskCount = await prisma.task.count();

    console.log(`PostgreSQL conectado - ${taskCount} tareas`);

    res.json({
      success: true,
      message: 'Backend funcionando correctamente',
      database: 'PostgreSQL conectado',
      taskCount
    });
  } catch (error: any) {
    console.error('PostgreSQL no conectado:', error.message);

    res.status(500).json({
      success: false,
      error: 'Database connection error',
      message: error.message
    });
  }
};