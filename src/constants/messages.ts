import { BANKS, ROLES } from './index.js';

import { IBank } from '../mongodb/schemas/payment.js';
import { IUser } from '../mongodb/schemas/user.js';
import {
    capitalizeFirstLetter,
    convertDate,
    pluralizeWord,
} from '../utils/utils.js';
import { ISubscription } from '../mongodb/schemas/subscription.js';
import { GroupedChanges } from '../mongodb/schemas/changeLog.js';

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
            `${user.fullName}, ваш запит на реєстрацію залишається на розгляді адміністратора. Зачекайте, будь ласка.`,
        user: (user: ITGUser) =>
            `Привіт ${
                user.first_name || user.fullName
            }!\nВи маєте можливість переглядати стан свого абонементу та отримувати сповіщення коли він закінчується.`,
        admin: (user: ITGUser) =>
            `Привіт, ${user.first_name}!\nВи можете додавати нових учнів, слідкувати за відвідуваністю, оновлювати їм абонементи та персональні дані, видаляти учнів.`,
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
        `Зареєстровано нового користувача "${user.fullName}".\nЩоб прийняти або відхілити запит скористайтеся відповідною командою /start.`,
    backToWait: (user: ITGUser) =>
        `Користувача "${user.fullName}" переміщено до черги.`,
    approved: (user: ITGUser) =>
        `Користувач "${user.fullName}" отримав доступ до групи.`,
    nowNewUsers: 'Наразі немає нових користувачів.',
    chooseUserToApprove: 'Виберіть користувачів яких хочете додати до групи.',
    alreadyExistsInGroup:
        'Ваш запит схвалено і ви вже знаходитеся у відповідній телеграм групі.\nСкористайтеся командою /start.',
    inviteToGroup: (inviteLink: string) =>
        `Ваш запит схвалено!\nЧекаємо вас у нашій групі.\n${
            inviteLink ? inviteLink : ''
        }`,
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
                    const notifications = user.notifications ? '🔔' : '🔕';
                    userList += `- <b>${userFullName}</b> (${firstName})${
                        username && `, @${username}`
                    }\nРоль: <code>${role}</code>\nСповіщення: ${notifications}\nПрийнятий до групи: <b>${approved}</b>\nМає активний абонемент: <b>${subscription}</b>\n\n`;
                });
            } else {
                userList = 'Такого не може бути, але не знайдено жодного.';
            }
            return userList;
        },
    },
    payments: {
        static: 'Реквізити для оплати:\n🏦 ПриватБанк <i>(Антонюк Дарія Сергіївна)</i>\n💳 <code>4731 2196 5113 0555</code>\nСума до оплати: <i>600 грн.</i>',
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
        wrongEnterCard: `Ведіть номер карти у форматі: <code>4444 4444 4444 4444</code>`,
    },
    settings: {
        main: 'Ви можете оновити дані учнів та переглянути історію користуванням абонементом.\n\n❕ Деякі налаштування будуть виконані поза звичайним робочим процесом.',
        users: 'Виберіть учня для оновлення.',
        history: (history: GroupedChanges | null) => {
            let text =
                'Історія відображає коли був активований чи деактивований абонемент, та відображає в які дні учень використовував його.\n\n⚠️ Дати відвідування можуть бути не точними, все залежить у який день вчитель відмітив учня.\n<i>Історія відображається приблизно за останні 3 місяці.</i>\n';

            for (let date in history) {
                text += `\n<b>Дата: ${date}</b>\n`;
                history[date].map((item) => {
                    text += `Ім'я: ${item.fullName}\n`;
                    text += `Зміни: ${item.changes.join(', ')}\n`;
                });
            }

            return text;
        },
        setupUser: (user: IUser) => {
            const {
                userId,
                fullName,
                username,
                subscription,
                role,
                approved,
                notifications,
                firstName,
                inviteLink,
            } = user;
            return `Вам доступні тільки декілька значень для зміни!\nКористувач: <b>${fullName}</b>\n<code>userId: ${userId}\nusername: ${
                username ? username : 'null'
            }\nfirstName: ${firstName}\n[role: ${role}]\napproved: ${approved}\n[notifications: ${notifications}]\ninviteLink: ${inviteLink}\nsubscription: {\n\tactive: ${subscription?.active}\n\t[totalLessons: ${subscription?.totalLessons}]\n\t[usedLessons: ${subscription?.usedLessons}]\n\tremainedLessons: ${subscription?.remainedLessons}\n\tfirstActivation: ${subscription?.firstActivation}\n\tdataExpired: ${subscription?.dataExpired}\n}</code>`;
        },
        setup: {
            role: '⚠️ Не використовуйте цю функцію без необхідності.\n\nВиберіть нову роль для учня відмінну від існуючої.\n\nРоль <b>Admin</b> позбавить учня можливостей оновлювати абонемент, та зробить його адміністратором.\n\nРоль <b>Guest</b> позбавить учня можливості оновлювати абонемент, він залишиться у групі, але не матиме доступу до свого абонементу.\n\nРоль <b>Inactive</b> обмежує використання бота для користувача.\n\nРоль <b>User</b> дозволяє отримувати дані про абонемент, та бути учасником групи <i>(якщо запрошення отримано)</i>',
            notifications: 'Активуйте або ж деактивуйте сповіщення для учня.',
            totalLessons:
                'Виберіть загальну кількість занять в абонементі для цього учня.\nЗа замовчуванням в абонементі 8 занять',
            usedLessons:
                'Змініть кількість використаних занять в абонементі для цього учня.\nЯкщо ви не хочете щоб юзер дізнався про ці зміни, тимчасово вимкніть сповіщення цьому учню.\n⚠️ Використаних занять повинно бути менше ніж загальна кількість.',
            cancel: 'Операцію скасовано, щоб повернутися до головного меню скористайтеся командою /start.',
        },
        updateRole: {
            success: (user: IUser) =>
                `Користувач <b>${user.fullName}</b>, отримав роль <code>${user.role}</code>.`,
        },
        updateNotifications: {
            success: (user: IUser) =>
                `Користувач <b>${
                    user.fullName
                }</b>, отримав нове значення сповіщень <b>${
                    user.notifications ? 'увімкнено' : 'вимкнуто'
                }</b>`,
        },
        totalLessons: {
            success: (subscription: ISubscription) =>
                `Користувач, отримав нове значення загальної кількості занять в абонементі: <b>${subscription.totalLessons}</b>`,
        },
        usedLessons: {
            success: (subscription: ISubscription) =>
                `Користувач, отримав нове значення використаних занять в абонементі: <b>${subscription.usedLessons}</b>`,
        },
    },
    remove: {
        main: 'Ви можете видалити користувачів або призупити їхню взаємодію з ботом.',
        inactive: (users: IUser[] | null) => {
            let userList =
                'Виберіть користувачів яким хочете призупити взаємодію з ботом.\n';

            users &&
                users.forEach((user) => {
                    const userFullName = user.fullName;
                    userList += `Користувача: <b>${userFullName}</b>, деактивовано.\n`;
                });

            return userList;
        },
        permanentlyRemove: (users: IUser[] | null) => {
            let userList =
                'Виберіть користувачів яких хочете видалити назавжди.\n';

            users &&
                users.forEach((user) => {
                    const userFullName = user.fullName;
                    userList += `Користувача: <b>${userFullName}</b>, видалено назавжди.\n`;
                });

            return userList;
        },
        confirmRemoved: (users: IUser[] | null) => {
            let userList = `Ви впевнені що хочете видалити ${
                users?.length === 1 ? 'цього користувача' : 'цих користувачів'
            } назавжди?\n⚠️ Ця дія невідворотна!\n`;

            users &&
                users.forEach((user) => {
                    const userFullName = user.fullName;
                    userList += `Користувач: <b>${userFullName}</b>\n`;
                });

            return userList;
        },
    },
    user: {
        subscription: (user: IUser) => {
            let result = '';
            const isActive = user.subscription?.active;

            if (isActive) {
                const totalLessons = user.subscription?.totalLessons!;
                const remainedLessons = user.subscription?.remainedLessons!;
                const date = user.subscription?.dataExpired!;
                const lessons =
                    user.subscription?.usedLessons === 0
                        ? 'ви ще не використали жодного заняття.'
                        : `залишилося ${remainedLessons} ${pluralizeWord(
                              remainedLessons
                          )}.`;
                result = `${
                    user.fullName
                }, ваш 🎫 абонемент налічує <b>${totalLessons}</b> ${pluralizeWord(
                    totalLessons
                )}, ${lessons}\nТермін дії абонементу закінчується <i>${convertDate(
                    date
                )}</i>`;
            } else {
                const firstActivation = user.subscription?.firstActivation;
                result = `${
                    firstActivation
                        ? 'Ваш абонемент більше не діє або заняття в ньому вже закінчилися!'
                        : 'Щоб активувати абонемент оплатіть та повідомте викладача.'
                }`;
            }
            return result;
        },
        notification: {
            main: (user: IUser | null) => {
                const defaultText =
                    'Ви можете керувати сповіщеннями щоб дізнаватися про закінчення абонементу.\n';
                if (!user) return MSG.errors.unknownError;

                return user.notifications
                    ? `${defaultText}\nУ вас увімкнені сповіщення про закінчення абонементу, вимкніть якщо більше не хочете отримувати сповіщень.`
                    : `${defaultText}\nУ вас вимкнуті сповіщення про закінчення абонементу, увімкніть якщо хочете отримати сповіщення коли абонемент підходить до кінця.`;
            },
            activate: 'Сповіщення увімкнено 🔔',
            disabled: 'Сповіщення вимкнено 🔕',
            remained2Lessons:
                '🔔 У вас залишилося всього 2 заняття. Після закінчення не забудь оновити абонемент.',
            remained0Lessons:
                '🔔 Ви використали усі заняття, поспішайте оновити абонемент.',
            expired:
                '🔔 Термін дії вашого абонементу закінчився, поспішайте його оновити.',
        },
    },
    developer: {},
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
        settings: {
            users: '💃 Учні',
            history: '📅 Історія',
            lessons: {
                1: '1',
                2: '2',
                3: '3',
                4: '4',
                5: '5',
                6: '6',
                7: '7',
                8: '8',
            },
        },
        removed: {
            inactive: '⚠️ Призупинити',
            remove: '❌ Видалити',
            return: '↩️ Повернути',
        },
        user: {
            showSubscription: '🎫 Мій абонемент',
            paymentDetails: '💳 Реквізити',
            notifications: '🔔 Сповіщення',
            notificationActivate: '🔔 Увімкнути',
            notificationDisabled: '🔕 Вимкнути',
        },
        developer: {
            admin: capitalizeFirstLetter(ROLES.Admin),
            user: capitalizeFirstLetter(ROLES.User),
            guest: capitalizeFirstLetter(ROLES.Guest),
            inactive: capitalizeFirstLetter(ROLES.Inactive),
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
        unknownError: 'Виникла невідома помилка. Спробуйте ще раз!',
    },
    cancelUpdate: 'Оновлення скасовано!',
    cancelEdit: 'Редагування скасовано!',
    cancelAdd: 'Додавання скасовано!',
    cancelRemove: 'Видалення скасовано!',
    leaveConversation: 'Розмову завершено.',
    overLeaveConversation:
        'У вас немає активних розмов з ботом. Щоб розпочати нову, скористайтеся командою /start.',
    accessIsDenied: 'У доступі відмовлено.',
    inappropriateRole: 'Ваша роль не надає вам відповідних прав.',
    commandDisabled: 'На жаль, ця команда вам недоступна.',
    registerFirst: 'Щоб скористатися цією командою, спочатку зареєструйтеся.',
    deactivatedAccount: 'Ваш акаунт деактивовано.',
    onMenuOutdated: 'Оновлено, спробуйте зараз.',
    tooManyRequest: 'Будь ласка, не надсилайте занадто багато запитів!',
};
