import { Student } from "../models/student";
import { StudentDto } from "../dto/studentDto";

export function toStudentDto(student: Student) : StudentDto {
    return {
        id: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        enrollmentYear: student.enrollmentYear,
        status: student.status,
        createdAt: student.createdAt.toISOString()
    }
}