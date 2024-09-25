// src\utils\validationSchemas.ts
import {z} from "zod"

export const CreateServiceSchema = z.object({
  title: z.string({
    required_error: "حدد العنوان من فضلك",
    invalid_type_error: "يجب أن يكون المدخل نص"
  }).min(2,"يجب أن يكون العنوان على الأقل حرفين").max(200),
  paragraph: z.string({
    required_error: "اكتب شرح بسيط عن الخدمة",
    invalid_type_error: "يجب أن يكون المدخل نص"
  }).min(10, "10 أحرف على الأقل")
 })

 export const RegisterUserSchema = z.object({
  email: z.string().min(3).max(200).email(),
  fullName: z.string().min(3).max(100),
  governorate: z.string(),
  phoneNO: z.string().min(9).max(14),
  password: z.string().min(6,"6 محارف على الأقل").max(20),
  address: z.string().min(10).max(200),
  avatar: z.string().optional(),
 })

 export const LoginUserSchema = z.object({
  email: z.string().min(3).max(200).email(),
  password: z.string().min(8).max(20),
 })


 export const UpdateUserSchema = z.object({
  email: z.string().min(3).max(200).email().optional(),
  governorate: z.string().optional(),
  fullName: z.string().min(3).max(100).optional(),
  phoneNO: z.string().min(9).max(14).optional(),
  password: z.string().min(6,"6 محارف على الأقل").max(20).optional(),
  address: z.string().min(10).max(200).optional(),
  avatar: z.string().optional(),
 })

 export const Maintenance_RequestSchema = z.object({
  deviceType: z.string(),
  governorate:z.string(),
  phoneNO: z.string().min(10).max(13),
  address: z.string(),
  descProblem: z.string(),
 })

 export const ComplaintSchema = z.object({
  message: z.string(),
 })

 export const ReviewSchema = z.object({
  ratting: z.number().min(1).max(5),
  comment: z.string(),
 })
