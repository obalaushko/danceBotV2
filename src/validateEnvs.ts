export const validateEnvs = (ENVS: NodeJS.ProcessEnv) => {
    const ENV = ENVS.NODE_ENV;

    if (!ENV) {
        throw new Error('NODE_ENV is required');
    }

    if (!ENVS.PRODUCTION_BOT_TOKEN) {
        throw new Error('PRODUCTION_BOT_TOKEN is required');
    }

    if (ENV === 'development' && !ENVS.DEVELOPMENT_BOT_TOKEN) {
        throw new Error('DEVELOPMENT_BOT_TOKEN is required');
    }

    if (!ENVS.LOGTAIL_TOKEN) {
        throw new Error('LOGTAIL_TOKEN is required');
    }

    if (!ENVS.ADMIN_ID) {
        throw new Error('ADMIN_ID is required');
    }

    if (!ENVS.GROUP_ID) {
        throw new Error('GROUP_ID is required');
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
