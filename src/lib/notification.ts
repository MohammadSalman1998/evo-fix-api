// src\lib\notification.ts
import prisma from "@/utils/db";
import { CreateNotificationDto, notificationOutDto } from "@/utils/dtos";
import { Notification } from '@prisma/client';
import { sendToUser } from "../websocket-server";


export async function createNotification({
  senderId,
  recipientId,
  title = "title",
  content,
}: CreateNotificationDto): Promise<Notification> {
  try {
    const notification = await prisma.notification.create({
      data: {
        senderId,
        recipientId,
        title,
        content,
      }
    });

    sendToUser(recipientId, {
      type: "NEW_NOTIFICATION",
      data: {
        recipientId,
        title,
        content,
        createdAt: new Date(),
      },
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
      where: { id: notificationId, recipientId:userId },
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
      where: { recipientId: userId },
      select:{
        id:true,
        recipientId:true,
        senderId:true,
        title:true,
        content:true,
        createdAt:true,
        isRead:true
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
