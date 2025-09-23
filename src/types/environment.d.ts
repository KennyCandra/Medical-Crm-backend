declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            DB_HOST: string;
            DB_PORT: string;
            DB_USERNAME: string;
            DB_PASSWORD: string;
            DB_NAME: string;
            DB_PORT_SERVER: string;
            JWT_SECRET_ACCESS: string;
            JWT_SECRET_REFRESH: string;
            JWT_EXPIRES_IN: string;
            JWT_REFRESH_EXPIRES_IN: string;
            PORT: string;
            FRONTED_URL: string
            GROQ_API_KEY: string
            GROQ_MODEL: string
        }
    }
}

export { };