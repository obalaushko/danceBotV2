import { BANKS } from './index';

import { IBank } from '../mongodb/schemas/payment';
import { IUser } from '../mongodb/schemas/user';
import { convertDate } from '../utils/utils';

interface ITGUser {
    first_name?: string;
    username?: string;
    fullName?: string;
}

export const MSG = {
    myDescriptions: 'Привіт, я допоможу вам потрапити до танцювальної групи.',
    welcome: {
        notRegistered: `Привіт! Щоб продовжити, будь ласка, зареєструйся, вказавши своє ім'я та прізвище.`,
        noRoleAssigned: (user: ITGUser) =>
            `Привіт, ${user.fullName}! Ваш запит на реєстрацію залишається на розгляді адміністратора. Зачекайте, будь ласка.`,
        user: (user: ITGUser) => `Привіт ${user.first_name || user.fullName}`,
        admin: (user: ITGUser) =>
            `Привіт, ${user.first_name}!\nВи можете додавати нових учнів, слідкувати за відвідувальністю, оновлювати їм абонементи та персональні дані, видаляти учнів.`,
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
        `Користувач "${user.fullName}" отримав доступ до групи.`,
    nowNewUsers: 'Наразі немає нових користувачів.',
    chooseUserToApprove: 'Виберіть користувачів яких хочете додати до групи.',
    chooseUserToMark: (users: IUser[] | null) => {
        let userList = 'Виберіть учнів яких потрібно відмітити.';

        users &&
            users.forEach((user) => {
                const remainedLessons = user?.subscription?.remainedLessons;
                const userFullName = user.fullName;
                userList += `\nАбонемент <b>${userFullName}</b> оновлено. Уроків залишилося <i>${
                    remainedLessons! - 1
                }</i>.`;
            });

        return userList;
    },
    chooseSubscriptionsActions:
        'Ви можете активувати чи деактивувати абонементи для учнів.',
    chooseUserToActivatedSubscription:
        'Виберіть учнів яким хочете активувати абонемент.',
    chooseUserToDeactivatedSubscription:
        'Виберіть учнів яким хочете деактивувати абонемент.',
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
    showUsers: {
        main: 'Ви можете вивести список користувачів які:\n🟢 Мають активний абонемент;\n🔴 Не мають активного абонементу;\n🟡 Чекають вашого схвалення на додання до групи;\n🔵 Знаходяться в базі даних не залежно від ролі та статусу;',
        active: (users: IUser[] | null) => {
            let userList = 'Користувачі з активним абонементом:\n';

            if (users?.length) {
                users.forEach((user) => {
                    const firstName = user.firstName;
                    const userFullName = user.fullName;
                    const remainedLessons = user.subscription?.remainedLessons;
                    const dataExpired = user.subscription?.dataExpired!;
                    const formattedDate = convertDate(dataExpired);
                    userList += `- <b>${userFullName}</b> (${firstName}), залишилося занять: <b>${remainedLessons}</b>, абонемент закінчується ${formattedDate};\n`;
                });
            } else {
                userList = 'Не знайдено користувачів з активним абонементом.';
            }
            return userList;
        },
        notActive: (users: IUser[] | null) => {
            let userList = 'Користувачі з не активним абонементом:\n';

            if (users?.length) {
                users.forEach((user) => {
                    const firstName = user.firstName;
                    const userFullName = user.fullName;
                    userList += `- <b>${userFullName}</b> (${firstName})\n`;
                });
            } else {
                userList =
                    'Не знайдено користувачів з не активним абонементом.';
            }
            return userList;
        },
        waitToApprove: (users: IUser[] | null) => {
            let userList = 'Користувачі які чекають схвалення:\n';

            if (users?.length) {
                users.forEach((user) => {
                    const firstName = user.firstName;
                    const userFullName = user.fullName;
                    userList += `- <b>${userFullName}</b> (${firstName})\n`;
                });
            } else {
                userList = 'Не знайдено користувачів які чекають схвалення.';
            }
            return userList;
        },
        all: (users: IUser[] | null) => {
            let userList = 'Усі користувачі:\n';

            if (users?.length) {
                users.forEach((user) => {
                    const firstName = user.firstName;
                    const userFullName = user.fullName;
                    const username = user.username;
                    const role = user.role;
                    const subscription = user.subscription?.active
                        ? 'Так'
                        : 'Ні';
                    const approved = user.approved ? 'Так' : 'Ні';
                    userList += `- <b>${userFullName}</b> (${firstName})${
                        username && `, @${username}`
                    }\nРоль: <code>${role}</code>\nПрийнятий до групи: <b>${approved}</b>\nМає активний абонемент: <b>${subscription}</b>\n\n`;
                });
            } else {
                userList = 'Такого не може бути, але не знайдено жодного.';
            }
            return userList;
        },
    },
    payments: {
        main: (paymentDetails: IBank | null) => {
            let text = 'Ви можете оновити реквізити\n';

            if (paymentDetails?.details) {
                paymentDetails?.details.forEach((banks) => {
                    text += `Ваші реквізити:\nБанк: <b>${banks.name}</b> - <code>${banks.card}</code>`;
                });
            } else {
                text =
                    'У вас немає банківських реквізитів, щоб створити використайте команду /updatePaymentDetails.';
            }
            return text;
        },
        createBank: `Щоб створити реквізити введіть назву банку у форматі: <b>${BANKS.PrivatBank}/${BANKS.MonoBank}</b>`,
        createCard: `Щоб створити реквізити введіть номер карти у форматі: <code>4444 4444 4444 4444</code>`,
        wrongEnterBank: `Ведіть назву банку у форматі: <b>${BANKS.PrivatBank}/${BANKS.MonoBank}</b>`,
        wrongEnterCard: `Ведіть номер карти у форматі: <code>4444 4444 4444 4444</code>`
    },
    buttons: {
        admin: {
            approveUser: '📝 Запити',
            showAllUser: '👥 Показати учнів',
            settings: '⚙️ Налаштування',
            markUser: '✅ Відмітити',
            updateSubscription: '🎫 Абонементи',
            updatePaymentDetails: '💳 Реквізити',
            removeUser: '❌ Видалити учнів',
        },
        updateSubscription: {
            activate: 'Активувати',
            deactivate: 'Деактивувати',
        },
        showUsers: {
            activeUsers: '🟢',
            notActiveUsers: '🔴',
            waitToApproveUsers: '🟡',
            allUsers: '🔵',
        },
        paymentDetails: {
            update: 'Оновити реквізити',
        },
        backToMain: 'До головного меню',
        back: '<< Назад',
        approve: '✅ Прийняти',
        add: '✅ Додати',
        update: '🔄 Оновити',
        cancel: '🚫 Скасувати',
    },
    errors: {
        failedToCreate: 'Виникла помилка створення. Спробуйте ще раз!',
        failedToUpdate: 'Виникла помилка оновлення. Спробуйте ще раз!',
        failedToRemove: 'Виникла помилка видалення. Спробуйте ще раз!',
    },
    leaveConversation: 'Розмову завершено.',
    overLeaveConversation:
        'У вас немає активних розмов з ботом. Щоб розпочати нову, скористайтеся командою /start.',
    accessIsDenied: 'У доступі відмовлено.',
    inappropriateRole: 'Ваша роль не надає вам відповідних прав.',
    commandDisabled: 'На жаль, ця команда вам недоступна.',
    registerFirst: 'Щоб скористатися цією командою, спочатку зареєструйтеся.',
    onMenuOutdated: 'Оновлено, спробуйте зараз.',
};
