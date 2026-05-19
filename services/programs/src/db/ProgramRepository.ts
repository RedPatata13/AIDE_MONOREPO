import { Repository } from './repository';
// import { Program } from '../models/Program';
import { Program } from '../models/Program';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';

export class ProgramRepository implements Repository<Program> {
    constructor(private db: Pool) {}
        async findById(id: string): Promise<Program | null> {
            const result = await this.db.query<Program>(
                `SELECT * FROM programs WHERE program_id = $1`,
                [id]
            );
            return result.rows[0] ?? null;
        }

    async findAll(): Promise<Program[]> {
        const result = await this.db.query<Program>(`SELECT * FROM programs`);
        return result.rows;
    }

    async create(input: Partial<Program>): Promise<Program> {
        const programId = randomUUID();
        const result = await this.db.query<Program>(
        `INSERT INTO programs (program_id, program_name, status)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [programId, input.programName, input.status]
        );
        const program = result.rows[0];
        if (!program) throw new Error('Program insert failed — no row returned');
        return program;
    }

    async update(id: string, input: Partial<Program>): Promise<Program> {
        const updates = [];
        const values = [];
        let idx = 1;

        if (input.programName !== undefined){
            updates.push(`program_name = $${idx++}`);
            values.push(input.programName);
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
            UPDATE programs
            SET ${updates.join(', ')}
            WHERE program_id = $${idx}
            RETURNING
                program_id as "programId",
                program_name AS "programName",
                status,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            `;
        
        const result = await this.db.query<Program>(query, values);
        const program = result.rows[0];

        if(!program) throw new Error('NOT_FOUND');

        return program;
    }       
    async delete(id: string): Promise<Program> {
        
        const result = await this.db.query<Program>(
			`
			UPDATE programs
			SET
				status = 'inactive',
				updated_at = NOW()
			WHERE program_id = $1
			RETURNING
				program_id AS "programId",
                program_name AS "programName",
				status,
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			`,
			[id]
		);

        const program = result.rows[0];

        if(!program) throw new Error('NOT_FOUND');

        return program;
    }
}