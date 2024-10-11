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
  metadata = {}, 
}: CreateNotificationDto & { metadata?: { [key: string]: string | number | boolean } }): Promise<Notification> {
  try {
    const fullContent = JSON.stringify({
      message: content,
      metadata, // Include the metadata object
    });

    const notification = await prisma.notification.create({
      data: {
        senderId,
        recipientId,
        title,
        content: fullContent,
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
        isRead:true,
      },
      orderBy: { createdAt: 'desc' },
      // take: limit,
      // skip: offset
    });

    return notifications.map((notification) => {
      let parsedContent;
    
      // Safely parse the content with error handling
      try {
        parsedContent = JSON.parse(notification.content);
      } catch (error) {
        console.error('Error parsing notification content:', error);
        parsedContent = {
          message: notification.content,  // Fall back to the raw content if JSON parsing fails
          metadata: {},                   // Use an empty object for metadata if not present
        };
      }
    
      return {
        ...notification,
        content: parsedContent.message || notification.content,  // Use parsed message or original content
        metadata: parsedContent.metadata || {},  // Use parsed metadata or empty object
      };
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw new Error('Failed to fetch user notifications');
  }
}
