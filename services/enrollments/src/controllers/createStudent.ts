import { Student } from "@prisma/client";
import { EnrollmentRepository } from "../db/enrollmentRepository.js";

export async function createStudent(body: string) : Promise<Student>{
    const input = JSON.parse(body);

    const repo = new EnrollmentRepository();
    const student = await repo.registerStudent({
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName
    });

    console.log('Student created: ', student);
    return student;
}