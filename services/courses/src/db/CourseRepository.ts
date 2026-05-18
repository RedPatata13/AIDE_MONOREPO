import { Repository } from './repository';
import { Course } from '../models/course';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';

export class CourseRepository implements Repository<Course> {
    constructor(private db: Pool) {}
        async findById(id: string): Promise<Course | null> {
            const result = await this.db.query<Course>(
                `SELECT * FROM courses WHERE course_id = $1`,
                [id]
            );
            return result.rows[0] ?? null;
        }

    async findAll(): Promise<Course[]> {
        const result = await this.db.query<Course>(`SELECT * FROM courses`);
        return result.rows;
    }

    async create(input: Partial<Course>): Promise<Course> {
        const courseId = randomUUID();
        const result = await this.db.query<Course>(
        `INSERT INTO courses (course_id, course_name, status)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [courseId, input.courseName, input.status]
        );
        const course = result.rows[0];
        if (!course) throw new Error('Course insert failed — no row returned');
        return course;
    }

    async update(id: string, input: Partial<Course>): Promise<Course> {
        const updates = [];
        const values = [];
        let idx = 1;

        if (input.courseName !== undefined){
            updates.push(`course_name = $${idx++}`);
            values.push(input.courseName);
        }

        if(input.status !== undefined) {
            updates.push(`status = $${idx++}`);
        }

        if (updates.length === 0){
            throw new Error('NO_FIELDS');
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
            UPDATE courses
            SET ${updates.join(', ')}
            WHERE course_id = $${idx}
            RETURNING
                course_id as "courseId",
                course_name AS "courseName",
                status,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            `;
        
        const result = await this.db.query<Course>(query, values);
        const course = result.rows[0];

        if(!course) throw new Error('NOT_FOUND');

        return course;
    }       
    async delete(id: string): Promise<Course> {
        
        const result = await this.db.query<Course>(
			`
			UPDATE courses
			SET
				status = 'inactive',
				updated_at = NOW()
			WHERE course_id = $1
			RETURNING
				course_id AS "courseId",
                course_name AS "courseName",
				status,
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			`,
			[id]
		);

        const course = result.rows[0];

        if(!course) throw new Error('NOT_FOUND');

        return course;
    }
}