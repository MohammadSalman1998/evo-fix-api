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

// enum Role {
//   ADMIN,
//   USER,
//   TECHNICAL
// }

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
  descProblem: string;
  technicalID: number;
}

export interface CreateNotificationDto {
  message: string;
}

export interface UpdateStatusNotificationDto {
  isRead: boolean;
}

export interface CreateComplaintDto {
  message: string;
}

export interface CreateReviewDto {
  maintenanceRequestID: number;
  ratting: number;
  comment: string;
}
