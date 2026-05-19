import { Pool, Client } from 'pg';

let pool: Pool;

export const getDb = (): Pool => {
	if (!pool) {
		pool = new Pool({
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT ?? 5432),
			database: process.env.DB_NAME,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			max: 10,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});
	}
	return pool;
};

export const initializeDb = async (db: Pool) => {
	console.log({
		DB_HOST: process.env.DB_HOST,
		DB_PORT: process.env.DB_PORT,
		DB_NAME: process.env.DB_NAME
	});

	const client = new Client({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT ?? 5432),
		database: 'postgres',
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		ssl: false
	});

	await client.connect();

	const dbName = process.env.DB_NAME;

	const checkDb = await client.query(
		`SELECT 1 FROM pg_database WHERE datname = $1`,
		[dbName]
	);

	if (checkDb.rowCount === 0) {
		await client.query(`CREATE DATABASE ${dbName}`);
	}

	await client.end();

	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS courses (
			course_id UUID PRIMARY KEY,
			course_name VARCHAR(100),
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`;

	await db.query(createTableQuery);
};