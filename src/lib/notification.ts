// src\lib\notification.ts
import prisma from "@/utils/db";
import { CreateNotificationDto, notificationOutDto } from "@/utils/dtos";
import { Notification } from '@prisma/client';



export async function createNotification({
  userId,
  title,
  content,
}: CreateNotificationDto): Promise<Notification> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        content,
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

export async function markNotificationAsRead(notificationId: number,userId: number): Promise<notificationOutDto> {
  try {
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
      select:{
        id:true,
        content:true,
        title: true,
        createdAt:true,
      },
    });

    return updatedNotification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}


// export async function getUserNotifications(userId: number, limit: number = 10, offset: number = 0): Promise<notificationOutDto[]> {
export async function getUserNotifications(userId: number): Promise<notificationOutDto[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      select:{
        id:true,
        userId:true,
        title:true,
        content:true,
        createdAt:true,
      },
      orderBy: { createdAt: 'desc' },
      // take: limit,
      // skip: offset
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw new Error('Failed to fetch user notifications');
  }
}
