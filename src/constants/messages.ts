import { IUser } from '../mongodb/schemas/user';

interface ITGUser {
    first_name?: string;
    username?: string;
    fullName?: string;
}

export const MSG = {
    welcome: {
        notRegistered: `Для подальшої взаємодії зареєструйся вказавши своє ім'я та прізвище`,
        noRoleAssigned: (user: ITGUser) =>
            `Вітаю ${user.fullName}, будь ласка, зачекайте поки адміністратор схвалить ваш запит на реєстрацію`,
        user: (user: ITGUser) => `Привіт ${user.first_name || user.fullName}`,
        admin: (user: ITGUser) =>
            `Привіт ${user.first_name}, ви маєте можливість переглянути запити нових учнів та оновлювати дані вже існуючих`,
        developer: (user: ITGUser) => `Привіт ${user.first_name}, вибери роль`,
    },
    updateFullName: "Вкажіть нове Ім'я та Прізвище",
    updatedFullName: (user: ITGUser) =>
        `Ви оновили свої дані на *${user.fullName}*`,
    waitAssigned:
        "Будь ласка, зачекайте поки адміністратор схвалить ваш запит на реєстрацію\nЯкщо ви хочете змінити Ім'я та Прізвище скористайтеся командою /changename",
    wrongRegister:
        'Будь ласка, введіть ім\'я та прізвище у форматі "Ім\'я Прізвище"',
    approveUser: (user: ITGUser) =>
        `Зареєстровано нового користувача "${user.fullName}".\nЩоб прийняти або відхілити запит скористайтеся відповідною командою`,
    backToWait: (user: ITGUser) =>
        `Користувача "${user.fullName}" переміщено до черги.`,
    approved: (user: ITGUser) =>
        `Користувач "${user.fullName}" отримав нову роль, та доступ до групи.`,
    nowNewUsers: 'Наразі немає нових користувачів',
    showGuestUsers: (users: IUser[]) => {
        if (!users.length) {
            return MSG.nowNewUsers;
        }
        let userList = 'Це список усіх користувачів які очікують схвалення:\n';

        users.forEach((user, index) => {
            const username = user.username;
            const userFullName = user.fullName;
            userList += `${
                index + 1
            }. Повне ім'я: <b>${userFullName}</b>, <b>@${username}</b>\n`;
        });

        return userList;
    },
    buttons: {
        admin: {
            approveUser: 'Переглянути запити',
            showAllUser: 'Показати усіх учнів',
            updateUser: 'Оновини дані учнів',
            markUser: 'Відмітити учнів',
            removeUser: 'Видалити учнів',
        },
        backToMain: 'Назад до меню',
        approve: 'Прийняти',
        cancel: 'Скасувати',
    },
};
