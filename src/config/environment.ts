interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT_SERVER: number;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  PORT: number;
}

function validateEnv(): EnvironmentConfig {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME', 
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT_SERVER',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    DB_HOST: process.env.DB_HOST!,
    DB_PORT: parseInt(process.env.DB_PORT!, 10),
    DB_USERNAME: process.env.DB_USERNAME!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_NAME: process.env.DB_NAME!,
    DB_PORT_SERVER: parseInt(process.env.DB_PORT_SERVER!, 10),
    JWT_SECRET: process.env.JWT_SECRET_ACCESS!,
    JWT_REFRESH_SECRET: process.env.JWT_SECRET_REFRESH!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    PORT: parseInt(process.env.PORT!, 10) || 3000,
  };
}

export const env = validateEnv();