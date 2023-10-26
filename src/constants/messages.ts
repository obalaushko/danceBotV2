import { IUser } from '../mongodb/schemas/user';

interface ITGUser {
    first_name?: string;
    username?: string;
    fullName?: string;
}

export const MSG = {
    welcome: {
        notRegistered: `Привіт! Щоб продовжити, будь ласка, зареєструйся, вказавши своє ім'я та прізвище.`,
        noRoleAssigned: (user: ITGUser) =>
            `Привіт, ${user.fullName}! Ваш запит на реєстрацію залишається на розгляді адміністратора. Зачекайте, будь ласка.`,
        user: (user: ITGUser) => `Привіт ${user.first_name || user.fullName}`,
        admin: (user: ITGUser) =>
            `Привіт, ${user.first_name}! Ви можете переглядати запити нових учнів та оновлювати дані існуючих.`,
        developer: (user: ITGUser) =>
            `Привіт, ${user.first_name}! Виберіть свою роль.`,
    },
    about: 'Привіт, я тут, щоб допомогти вам як асистент. Мої завдання включають в себе ведення обліку відвідуваності учнів та контроль абонементів. А ще я дозволяю учням контролювати свої абонементи та отримувати сповіщення про їх закінчення.',
    help: 'Якщо ви маєте проблеми з ботом, спробуйте закінчити поточну розмову командою /cancel, а потім розпочати нову розмову командою /start.\n<i>Найчастіше проблеми з ботом виникають через те, що при отриманні оновлень коду бот втрачає поточну сесію, тому всі взаємодії потрібно починати з початку.</i>',
    updateFullName:
        "Будь ласка, введіть ваше нове Ім'я та Прізвище.\nЯкщо ви хочете скасувати введення, скористайтесь командою /cancel.",
    updatedFullName: (user: ITGUser) =>
        `Ваші дані було оновлено на *${user.fullName}*`,
    waitAssigned:
        "Зачекайте, будь ласка, поки адміністратор схвалить ваш запит на реєстрацію.\nЯкщо ви хочете змінити своє Ім'я та Прізвище, скористайтеся командою /changename.",
    wrongRegister:
        'Будь ласка, введіть ім\'я та прізвище у форматі "Ім\'я Прізвище"',
    approveUser: (user: ITGUser) =>
        `Зареєстровано нового користувача "${user.fullName}".\nЩоб прийняти або відхілити запит скористайтеся відповідною командою.`,
    backToWait: (user: ITGUser) =>
        `Користувача "${user.fullName}" переміщено до черги.`,
    approved: (user: ITGUser) =>
        `Користувач "${user.fullName}" отримав нову роль, та доступ до групи.`,
    nowNewUsers: 'Наразі немає нових користувачів.',
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
    leaveConversation: 'Розмову завершено.',
    overLeaveConversation:
        'У вас немає активних розмов з ботом. Щоб розпочати нову, скористайтеся командою /start.',
    accessIsDenied: 'У доступі відмовлено.',
    inappropriateRole: 'Ваша роль не надає вам відповідних прав.',
    commandDisabled: 'На жаль, ця команда вам недоступна.',
    registerFirst: 'Щоб скористатися цією командою, спочатку зареєструйтеся.',
};
