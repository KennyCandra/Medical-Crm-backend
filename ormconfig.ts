import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
import * as path from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env['DB_HOST'] || 'localhost',
  port: Number(process.env['DB_PORT']) || 5432,
  username: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASS'] || '',
  database: process.env['DB_NAME'] || 'database',
  synchronize: process.env['ENV_MODE'] === "development" ? true : false,
  ssl: true,
  logging: true,
  entities: process.env['ENV_MODE'] === "development" ?
    [path.join(__dirname, "src/entities/*.ts")] :
    [path.join(__dirname, "src/entities/*.js")],
  migrations: process.env['ENV_MODE'] === "development" ?
    [path.join(__dirname, "src/migrations/*.ts")] :
    [path.join(__dirname, "src/migrations/*.js")],
  subscribers: [],
  schema: "public",
});
