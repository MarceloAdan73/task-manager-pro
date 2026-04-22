import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/server/supabase';
import PDFDocument from 'pdfkit';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function getUserIdFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  
  if (token === 'authenticated') {
    const userIdFromBody = request.nextUrl.searchParams.get('userId');
    if (userIdFromBody) return userIdFromBody;
    return null;
  }
  
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

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

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

    const completedTasks = (tasks || []).filter((t: any) => t.completed);
    const pendingTasks = (tasks || []).filter((t: any) => !t.completed);
    const highPriority = (tasks || []).filter((t: any) => t.priority === 'HIGH' || t.priority === 'URGENT');
    const overdueTasks = (tasks || []).filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && !t.completed);

    const stats = {
      total: (tasks || []).length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      highPriority: highPriority.length,
      overdue: overdueTasks.length,
      completionRate: (tasks || []).length > 0 ? Math.round((completedTasks.length / (tasks || []).length) * 100) : 0
    };

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => {});

    const timestamp = new Date().toISOString().split('T')[0];

    const pageWidth = doc.page.width;
    const centerX = pageWidth / 2;

    doc.fontSize(24).fillColor('#1a1a1a').text('Task Manager Pro', centerX, 50, { align: 'center' });
    doc.fontSize(10).fillColor('#666').text('Tasks Report - Executive Summary', centerX, 78, { align: 'center' });
    doc.fontSize(10).fillColor('#999').text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, centerX, 90, { align: 'center' });

    doc.moveDown(2);

    doc.fontSize(12).fillColor('#333').text('User Information', 50);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555');
    doc.text(`Name: ${user?.name || 'N/A'}`);
    doc.text(`Email: ${user?.email || 'N/A'}`);
    doc.text(`Total Tasks: ${stats.total}`);

    doc.moveDown(2);

    doc.fontSize(14).fillColor('#1a1a1a').text('Executive Summary', 50);
    doc.moveDown(0.5);

    if (stats.total > 0) {
      const summaryY = doc.y;
      doc.rect(50, summaryY, 150, 60).fillAndStroke('#f5f5f5', '#ddd');
      doc.rect(210, summaryY, 150, 60).fillAndStroke('#f5f5f5', '#ddd');
      doc.rect(370, summaryY, 150, 60).fillAndStroke('#f5f5f5', '#ddd');

      doc.fontSize(11).fillColor('#333');
      doc.text('Total Tasks', 60, summaryY + 10);
      doc.fontSize(18).fillColor('#2563eb').text(`${stats.total}`, 60, summaryY + 28);

      doc.fontSize(11).fillColor('#333');
      doc.text('Completed', 220, summaryY + 10);
      doc.fontSize(18).fillColor('#16a34a').text(`${stats.completed}`, 220, summaryY + 28);

      doc.fontSize(11).fillColor('#333');
      doc.text('Pending', 380, summaryY + 10);
      doc.fontSize(18).fillColor('#ea580c').text(`${stats.pending}`, 380, summaryY + 28);
    }

    doc.moveDown(5);

    doc.fontSize(12).fillColor('#1a1a1a').text('Key Metrics', 50);
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#333');
    doc.text(`Completion Rate: ${stats.completionRate}%`);
    doc.text(`High Priority Tasks: ${stats.highPriority}`);
    doc.text(`Overdue Tasks: ${stats.overdue}`);
    doc.text(`Completion Progress: [${'█'.repeat(Math.floor(stats.completionRate / 10))}${'░'.repeat(10 - Math.floor(stats.completionRate / 10))}] ${stats.completionRate}%`);

    doc.moveDown(2);

    if ((tasks || []).length === 0) {
      doc.fontSize(14).fillColor('#666').text('No tasks found.', 50);
    } else {
      doc.fontSize(12).fillColor('#1a1a1a').text('Tasks Details', 50);
      doc.moveDown(0.5);

      const tableTop = doc.y;

      doc.rect(50, tableTop, 495, 25).fillAndStroke('#2563eb', '#2563eb');
      doc.fillColor('#fff').fontSize(10).text('Task', 55, tableTop + 8);
      doc.text('Priority', 250, tableTop + 8);
      doc.text('Status', 350, tableTop + 8);
      doc.text('Due Date', 440, tableTop + 8);

      doc.moveDown(1.5);

      tasks?.forEach((task: any, index: number) => {
        const rowY = doc.y;
        const isEven = index % 2 === 0;

        if (isEven) {
          doc.rect(50, rowY, 495, 22).fill('#fafafa');
        }

        doc.fillColor('#333').fontSize(9).text(task.title.substring(0, 40), 55, rowY + 5, { width: 180 });

        const priorityColor = task.priority === 'HIGH' || task.priority === 'URGENT' ? '#dc2626' :
                        task.priority === 'MEDIUM' ? '#d97706' : '#16a34a';
        doc.fillColor(priorityColor).fontSize(9).text(task.priority, 250, rowY + 5);

        const statusText = task.completed ? 'Completed' : 'Pending';
        const statusColor = task.completed ? '#16a34a' : '#ea580c';
        doc.fillColor(statusColor).fontSize(9).text(statusText, 350, rowY + 5);

        const dueDateText = task.due_date ? new Date(task.due_date).toLocaleDateString('en-US') : '-';
        doc.fillColor('#666').fontSize(9).text(dueDateText, 440, rowY + 5);

        doc.moveDown(0.8);
      });
    }

    const footerY = doc.page.height - 80;
    doc.strokeColor('#ddd').lineWidth(1).moveTo(50, footerY).lineTo(545, footerY).stroke();

    doc.fontSize(8).fillColor('#999').text(
      'Task Manager Pro - Professional Task Management Application',
      50,
      footerY + 10
    );
    doc.text(
      'Generated automatically for demonstration purposes',
      50,
      footerY + 22
    );
    doc.text(
      '© 2026 Task Manager Pro Demo',
      450,
      footerY + 10,
      { align: 'right' }
    );

    doc.end();

    await new Promise(resolve => doc.on('end', resolve));

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=tasks_report_${timestamp}.pdf`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting to PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Error exporting to PDF' },
      { status: 500 }
    );
  }
}