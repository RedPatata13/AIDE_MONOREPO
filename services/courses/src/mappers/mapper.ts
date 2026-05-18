import { Course } from "../models/course";
import { CourseDto } from "../dto/courseDto";

export function toCourseDto(course: Course) : CourseDto {
    return {
        id: course.courseId,
        courseName: course.courseName,
        status: 'active',
        createdAt: course.createdAt.toISOString()
    }
}