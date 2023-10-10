export const validateEnvs = (ENVS: NodeJS.ProcessEnv) => {
    const ENV = ENVS.ENV;

    if (!ENV) {
        throw new Error('ENV is required');
    }

    if (!ENVS.BOT_TOKEN) {
        throw new Error('BOT_TOKEN is required');
    }

    if (!ENVS.APPLICATION_NAME) {
        throw new Error('APPLICATION_NAME is required');
    }

    if (!ENVS.MONGO_DB) {
        throw new Error('MONGO_DB is required');
    }

    if (!ENVS.MONGO_DB_USER) {
        throw new Error('MONGO_DB_USER is required');
    }

    if (!ENVS.MONGO_DB_USER) {
        throw new Error('MONGO_DB_USER is required');
    }

    if (!ENVS.MONGO_DB_PASSWORD) {
        throw new Error('MONGO_DB_PASSWORD is required');
    }

    if (!ENVS.MONGO_DB_NAME) {
        throw new Error('MONGO_DB_NAME is required');
    }

    if (!ENVS.MONGO_DB_HOST) {
        throw new Error('MONGO_DB_HOST is required');
    }
};
