import { z } from "zod";

export const studentSchema = z.object({
  cognitoSub: z.string().min(1),
  cognitoUsername: z.string().optional(),
  email: z.email(),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  contactNo: z.string().optional(),
  guardianName: z.string().optional(),
  guardianContactNo: z.string().optional(),
});

export const teacherSchema = z.object({
  cognitoSub: z.string().min(1),
  cognitoUsername: z.string().optional(),
  email: z.email(),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  contactNo: z.string().optional(),
});

export const adminSchema = z.object({
  cognitoSub: z.string().min(1),
  cognitoUsername: z.string().optional(),
  email: z.email(),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
});

export function validateStudentInput(input: string): boolean {
  return studentSchema.safeParse(JSON.parse(input)).success;
}

export function validateTeacherInput(input: string): boolean {
  return teacherSchema.safeParse(JSON.parse(input)).success;
}

export function validateAdminInput(input: string): boolean {
  return adminSchema.safeParse(JSON.parse(input)).success;
}