import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { NoticePriority } from '@prisma/client';

export async function getNotices(_req: Request, res: Response): Promise<void> {
  try {
    const notices = await prisma.notice.findMany({
      include: {
        publishedBy: {
          select: { fullName: true, role: true }
        }
      },
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ success: true, notices });
  } catch (error) {
    console.error('GetNotices error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notices' });
  }
}

export async function createNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, content, category, priority, pinned, expiresAt } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({ success: false, message: 'Title, content, and category are required' });
      return;
    }

    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        priority: (priority as NoticePriority) || NoticePriority.NORMAL,
        pinned: Boolean(pinned),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        publishedById: req.user!.userId
      },
      include: {
        publishedBy: {
          select: { fullName: true }
        }
      }
    });

    res.json({ success: true, notice, message: 'Society notice published successfully' });
  } catch (error) {
    console.error('CreateNotice error:', error);
    res.status(500).json({ success: false, message: 'Failed to publish notice' });
  }
}

export async function deleteNotice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.notice.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('DeleteNotice error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notice' });
  }
}
