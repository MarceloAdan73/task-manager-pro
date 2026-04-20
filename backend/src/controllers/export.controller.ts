import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

export const exportToCSV = async (req: Request, res: Response): Promise<void> => {
  console.log('GET /api/export/csv - EXPORTING TO CSV');

  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const csvTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.completed ? 'Completed' : 'Pending',
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US') : '',
      createdAt: new Date(task.createdAt).toLocaleDateString('en-US'),
      updatedAt: new Date(task.updatedAt).toLocaleDateString('en-US')
    }));

    const fields = ['id', 'title', 'description', 'priority', 'status', 'dueDate', 'createdAt', 'updatedAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(csvTasks);

    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=tasks_${timestamp}.csv`);
    res.send(csv);
  } catch (error: any) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting to CSV'
    });
  }
};

export const exportToPDF = async (req: Request, res: Response): Promise<void> => {
  console.log('GET /api/export/pdf - EXPORTING TO PDF');

  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);
    const highPriority = tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT');
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed);

    const stats = {
      total: tasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      highPriority: highPriority.length,
      overdue: overdueTasks.length,
      completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    };

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tasks_report_${timestamp}.pdf`);

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const centerX = pageWidth / 2;

    // Header
    doc.fontSize(24).fillColor('#1a1a1a').text('Task Manager Pro', centerX, 50, { align: 'center' });
    doc.fontSize(10).fillColor('#666').text('Tasks Report - Executive Summary', centerX, 78, { align: 'center' });
    doc.fontSize(10).fillColor('#999').text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, centerX, 90, { align: 'center' });

    doc.moveDown(2);

    // User Info
    doc.fontSize(12).fillColor('#333').text('User Information', 50);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555');
    doc.text(`Name: ${user?.name || 'N/A'}`);
    doc.text(`Email: ${user?.email || 'N/A'}`);
    doc.text(`Total Tasks: ${stats.total}`);

    doc.moveDown(2);

    // Executive Summary
    doc.fontSize(14).fillColor('#1a1a1a').text('Executive Summary', 50);
    doc.moveDown(0.5);

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

    doc.moveDown(5);

    // Statistics
    doc.fontSize(12).fillColor('#1a1a1a').text('Key Metrics', 50);
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor('#333');
    doc.text(`Completion Rate: ${stats.completionRate}%`);
    doc.text(`High Priority Tasks: ${stats.highPriority}`);
    doc.text(`Overdue Tasks: ${stats.overdue}`);
    doc.text(`Completion Progress: [${'█'.repeat(Math.floor(stats.completionRate / 10))}${'░'.repeat(10 - Math.floor(stats.completionRate / 10))}] ${stats.completionRate}%`);

    doc.moveDown(2);

    // Tasks List
    if (tasks.length === 0) {
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

      tasks.forEach((task, index) => {
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

        const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US') : '-';
        doc.fillColor('#666').fontSize(9).text(dueDateText, 440, rowY + 5);

        doc.moveDown(0.8);
      });
    }

    // Footer
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
  } catch (error: any) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting to PDF'
    });
  }
};