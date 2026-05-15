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
	// Postgres requires connecting to a maintenance DB first (usually "postgres")

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

	// Create database if not exists (Postgres does NOT support IF NOT EXISTS for this in older versions reliably)
	const dbName = process.env.DB_NAME;

	const checkDb = await client.query(
		`SELECT 1 FROM pg_database WHERE datname = $1`,
		[dbName]
	);

	if (checkDb.rowCount === 0) {
		await client.query(`CREATE DATABASE ${dbName}`);
	}

	await client.end();

	// Now connect to the actual database and create tables
	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS students (
			student_id UUID PRIMARY KEY,
			cognito_sub VARCHAR(255) NOT NULL,
			first_name VARCHAR(100),
			last_name VARCHAR(100),
			email VARCHAR(255) UNIQUE,
			enrollment_year INT,
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`;

	await db.query(createTableQuery);
};