import { Teacher } from "@prisma/client";
import { EnrollmentRepository } from "../db/enrollmentRepository.js";

export async function createTeacher(body: string) : Promise<Teacher>{
    //assumes id and body is not null
    const input = JSON.parse(body);

    const repo = new EnrollmentRepository();
    const teacher = await repo.registerStudent({
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName
    });

    console.log('Teacher created: ', teacher);
    return teacher;
}