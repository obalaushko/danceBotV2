import { connect, disconnect } from 'mongoose';
import { DailyHistoryModel } from '../schemas/dailyHistory.js';
import moment from 'moment-timezone';
import { LOGGER } from '../../logger/index.js';
import { ENV_VARIABLES } from '../../constants/global.js';

// Підключення до бази даних (локально чи продакшен)
const DB = ENV_VARIABLES.DB;
const USER = ENV_VARIABLES.DB_USER;
const PASSWORD = ENV_VARIABLES.DB_PASSWORD;
const DB_NAME = ENV_VARIABLES.DB_NAME;
const HOST = ENV_VARIABLES.DB_HOST;

const MONGO_URI = `${DB}${USER}:${PASSWORD}@${HOST}/${DB_NAME}`;

const migrateDateFields = async () => {
    try {
        // Підключаємося до бази даних
        await connect(MONGO_URI);
        LOGGER.info('Підключено до бази даних для міграції дат.');

        // Отримуємо всі документи з колекції `dailyhistories`
        const histories = await DailyHistoryModel.find({});

        if (histories.length === 0) {
            LOGGER.info('Немає записів для міграції.');
            return;
        }

        for (const history of histories) {
            let newDate: Date;

            // Якщо поле `date` існує, конвертуємо його, інакше беремо з `timestamp`
            if (history.date) {
                LOGGER.info(`Поточне значення date: ${history.date}`);
                // Примусова конвертація `date` у формат `Date`
                newDate = moment
                    .utc(history.date, [
                        'DD.MM.YYYY',
                        moment.ISO_8601,
                        'YYYY-MM-DDTHH:mm:ss.sssZ',
                    ])
                    .startOf('day')
                    .toDate();
                LOGGER.info(`Переписали дату: ${newDate}`);
            } else if (history.users && history.users.length > 0) {
                // Якщо `date` немає, беремо з першої дії у `actions`
                const firstAction = history.users[0].actions[0];
                if (firstAction && firstAction.timestamp) {
                    newDate = moment
                        .utc(firstAction.timestamp)
                        .startOf('day')
                        .toDate();
                    LOGGER.info(
                        `Створили дату з першого timestamp: ${newDate}`
                    );
                } else {
                    LOGGER.warn(
                        `Поле "date" та "timestamp" відсутні у документі з ID: ${history._id}. Пропускаємо...`
                    );
                    continue; // Пропускаємо документ, якщо немає жодного джерела дати
                }
            } else {
                LOGGER.warn(
                    `Поле "date" відсутнє у документі з ID: ${history._id}, і немає дій для визначення дати. Пропускаємо...`
                );
                continue; // Пропускаємо документ, якщо немає дати та дій
            }

            // Примусово оновлюємо значення `date`
            history.date = newDate;

            // Логування для контролю
            LOGGER.info(
                `Оновлено дату у документі з ID: ${history._id} на "${newDate}"`
            );

            // Зберігаємо зміни у базі даних
            await history.save();
        }

        LOGGER.info(
            `Міграція завершена. Оновлено ${histories.length} документів.`
        );
    } catch (error: any) {
        LOGGER.error(`[migrateDateFields][error]: ${error.message}`, {
            metadata: { error: error, stack: error.stack.toString() },
        });
    } finally {
        // Закриваємо підключення до бази даних
        await disconnect();
        LOGGER.info('Підключення до бази даних закрито після міграції.');
    }
};
// Запуск міграційного скрипта
migrateDateFields();
