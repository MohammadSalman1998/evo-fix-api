// src\utils\dtos.ts

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
