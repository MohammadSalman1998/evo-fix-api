// src\utils\dtos.ts

import { Role } from "@prisma/client";

export interface CreateServiceDto {
  icon?: JSX.Element;
  title: string;
  description: string;
}

export interface UpdateServiceDto {
  icon?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface RegisterUserDto {
  email: string;
  fullName: string;
  governorate: string;
  phoneNO: string;
  password: string;
  address: string;
  avatar?: string;
  role?: Role;
  customer?: { create: object };
  technician?: { create: object };
  specialization?: string;
  services?: string;
  subadmin?: { create: object };
  department?: string;
  governorateAdmin: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  governorate?: string;
  phoneNO?: string;
  password?: string;
  address?: string;
  avatar?: string;
  role?: Role;
  isActive?: boolean;
  customer?: { create: object };
  technician?: { create: object };
  specialization?: string;
  services?: string;
  subadmin?: { create: object };
  department?: string;
  governorateAdmin?: string;
}

export interface CreateMaintenance_RequestDto {
  deviceType: string;
  governorate: string;
  phoneNO: string;
  address: string;
  problemDescription: string;
}

export interface CreateNotificationDto {
  senderId: number;
  recipientId: number;
  title?: string;
  content: string;
}

export interface notificationOutDto {
  title: string;
  content: string;
  createdAt: Date;
}

export interface MailOptionsDto {
  to: string;
  subject: string;
  text?: string; // Plain text body (optional)
  html?: string; // HTML body (optional)
}


export interface CreateEmailDto{
  subject: string;
  content: string;
  senderId: number;
  recipientId: number;
}

export interface RecipientSentDto {
  fullName: string;
  // email: string;
  address:string;
}
export interface RecipientSentAdminDto {
  fullName: string;
  email: string;
}

export interface SentEmailOutDto {
  id: number;
  subject: string;
  content: string;
  recipient: RecipientSentDto;
  sentAt: Date;
}
export interface RecipientEmailOutDto {
  id: number;
  subject: string;
  content: string;
  sender: RecipientSentDto;
  sentAt: Date;
}
export interface EmailOutDto {
  id: number;
  subject: string;
  content: string;
  sender: RecipientSentAdminDto;
  recipient: RecipientSentAdminDto;
  sentAt: Date;
}
