import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env['DB_HOST'] || 'localhost',
  port: Number(process.env['DB_PORT']) || 5432,
  username: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASS'] || '',
  database: process.env['DB_NAME'] || 'database',
  synchronize: true,
  ssl: true,
  logging: true,
  entities:
    process.env['ENV_MODE'] === "development"
      ? ["src/entities/*.ts"]
      : ["dist/src/entities/*.js"],
  migrations:
    process.env['ENV_MODE'] === "development"
      ? ["src/migrations/*.ts"]
      : ["dist/src/migrations/*.js"],
  subscribers: [],
  schema: "public",
});
