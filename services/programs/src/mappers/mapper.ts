import { Course } from "../models/Program";
import { CourseDto } from "../dto/ProgramDto";

export function toCourseDto(course: Course) : CourseDto {
    return {
        id: course.courseId,
        courseName: course.courseName,
        status: 'active',
        createdAt: course.createdAt.toISOString()
    }
}