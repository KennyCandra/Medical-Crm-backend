import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();
const isProd = process.env.NODE_ENV === 'production';
const entitiesDir = isProd ? "dist/entities/*.js" : "src/entities/*.ts";
const migrationsDir = isProd ? "dist/migrations/*.js" : "src/migrations/*.ts";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [entitiesDir],
    migrations: [migrationsDir],
    subscribers: [],
    schema: 'public'
});
