// src\utils\validationSchemas.ts
import {z} from "zod"
import {ERROR_MSG} from '@/utils/constants'



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
  email: z.string({required_error: ERROR_MSG.email_err}).min(3).max(200).email({message: ERROR_MSG.email_invalid_err}),
  fullName: z.string({required_error: ERROR_MSG.fullName_err}).min(3).max(100),
  governorate: z.string({required_error: ERROR_MSG.governorate_err}),
  phoneNO: z.string({required_error: ERROR_MSG.phone_err}).min(10,ERROR_MSG.phone_len_err).max(14),
  password: z.string({required_error: ERROR_MSG.password_err}).min(6,ERROR_MSG.password_len_err).max(20),
  address: z.string({required_error: ERROR_MSG.address_err}).min(10).max(200),
  avatar: z.string().optional(),
 })

 export const LoginUserSchema = z.object({
  email: z.string({required_error: ERROR_MSG.email_err}).min(3).max(200).email({message: ERROR_MSG.email_invalid_err}),
  password: z.string({required_error: ERROR_MSG.password_err}).min(6,ERROR_MSG.password_len_err).max(20),
 })


 export const UpdateUserSchema = z.object({
  email: z.string({required_error: ERROR_MSG.email_err}).min(3).max(200).email({message: ERROR_MSG.email_invalid_err}).optional(),
  fullName: z.string({required_error: ERROR_MSG.fullName_err}).min(3).max(100).optional(),
  governorate: z.string({required_error: ERROR_MSG.governorate_err}).optional(),
  phoneNO: z.string({required_error: ERROR_MSG.phone_err}).min(10,ERROR_MSG.phone_len_err).max(14).optional(),
  password: z.string({required_error: ERROR_MSG.password_err}).min(6,ERROR_MSG.password_len_err).max(20).optional(),
  address: z.string({required_error: ERROR_MSG.address_err}).min(10).max(200).optional(),
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