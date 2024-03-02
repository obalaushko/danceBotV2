import * as dotenv from 'dotenv';
dotenv.config();

export const ROLES = {
    Developer: 'developer',
    Admin: 'admin',
    User: 'user',
    Guest: 'guest',
    Inactive: 'inactive',
};

export const BANKS = {
    PrivatBank: 'privatbank',
    MonoBank: 'monobank',
};

export const BOT_RIGHTS = {
    is_anonymous: true,
    can_manage_chat: true,
    can_delete_messages: true,
    can_manage_video_chats: false,
    can_restrict_members: true,
    can_promote_members: true,
    can_change_info: true,
    can_pin_messages: true,
    can_post_messages: true,
    can_invite_users: true,
};

export const FORMAT_DATE = 'DD-MM-YYYY HH:mm:ss';

export const formatter = new Intl.DateTimeFormat([], {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

const ENVS = process.env;
export const ENV_VARIABLES = {
    MODE: ENVS.NODE_ENV || 'development',
    TOKEN:
        ENVS.NODE_ENV === 'production'
            ? ENVS.PRODUCTION_BOT_TOKEN || ''
            : ENVS.DEVELOPMENT_BOT_TOKEN || '',
    ADMIN_ID: ENVS.ADMIN_ID || '',
    URL: ENVS.WEB_APP_URL || '',
    GROUP_ID: ENVS.GROUP_ID || '',
    LOGTAIL_TOKEN: ENVS.LOGTAIL_TOKEN || '',
    DB: ENVS.MONGO_DB || 'mongodb://',
    DB_USER: ENVS.MONGO_DB_USER || '',
    DB_PASSWORD: encodeURIComponent(ENVS.MONGO_DB_PASSWORD || ''),
    DB_NAME: ENVS.MONGO_DB_NAME || '',
    DB_HOST: ENVS.MONGO_DB_HOST || 'localhost',
    PORT: ENVS.PORT || 2604,
};
