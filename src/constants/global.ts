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
    can_delete_messages: false,
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
