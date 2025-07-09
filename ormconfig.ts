import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  ssl: true,
  logging: true,
  entities: process.env.ENV_MODE === 'development' ?  ["src/entities/*.ts"] : ["src/entities/*.js"],
  migrations: process.env.ENV_MODE === 'development' ? ["src/migrations/*.ts"] : ["src/migrations/*.js"],
  subscribers: [],
  schema: "public",
});