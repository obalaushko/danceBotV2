interface ITGUser {
    first_name?: string;
    username?: string;
    fullName?: string;
}

export const MSG = {
    welcome: {
        notRegistered: `Привіт, для подальшої взаємодії зареєструйся вказавши своє ім'я та прізвище`,
        noRoleAssigned: (user: ITGUser) =>
            `Вітаю ${user.fullName}, будь ласка, зачекайте поки адміністратор схвалить вашу заявку на реєстрацію`,
        registered: (user: ITGUser) =>
            `Привіт ${user.first_name || user.fullName}`,
    },
    waitAssigned:
        'Будь ласка, зачекайте поки адміністратор схвалить вашу заявку на реєстрацію',
    wrongRegister:
        'Будь ласка, введіть ім\'я та прізвище у форматі "Ім\'я Прізвище"',
    approveUser: (user: ITGUser) =>
        `Зареєстровано нового користувача "${user.fullName}".\nЩоб прийняти або відхілити за'явку скористайтеся відповідною командою`,
    backToWait: (user: ITGUser) => `Користувача "${user.fullName}" переміщено до черги.`,
    approved:(user: ITGUser) => `Користувач "${user.fullName}" отримав нову роль, та доступ до групи.`,
    buttons: {
        approve: 'Прийняти',
        cancel: 'Скасувати',
    },
};
