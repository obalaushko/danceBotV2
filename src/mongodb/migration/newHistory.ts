import { connect, disconnect } from 'mongoose';
import { HistoryModel } from '../schemas/history.js';
import { DailyHistoryModel, IDailyHistory } from '../schemas/dailyHistory.js';
import { UserModel } from '../schemas/user.js';
import moment from 'moment-timezone';
import { LOGGER } from '../../logger/index.js';
import { ENV_VARIABLES } from '../../constants/global.js';

// Підключення до бази даних (замінити на свої параметри)
const DB = ENV_VARIABLES.DB;
const USER = ENV_VARIABLES.DB_USER;
const PASSWORD = ENV_VARIABLES.DB_PASSWORD;
const DB_NAME = ENV_VARIABLES.DB_NAME;
const HOST = ENV_VARIABLES.DB_HOST;

const MONGO_URI = `${DB}${USER}:${PASSWORD}@${HOST}/${DB_NAME}`;

/**
 * Міграційний скрипт для конвертації `HistoryModel` у нову структуру `DailyHistory`.
 */
const migrateHistory = async () => {
    try {
        // Підключаємося до бази даних
        await connect(MONGO_URI);
        LOGGER.info('Підключено до бази даних для міграції.');

        // Отримуємо всі записи зі старої моделі `HistoryModel`
        const oldHistories = await HistoryModel.find();
        if (oldHistories.length === 0) {
            LOGGER.info('Немає записів для міграції.');
            return;
        }

        // Групуємо записи тільки за датою
        const dailyHistoryMap: Record<string, IDailyHistory> = {};

        for (const history of oldHistories) {
            // Отримуємо відповідну дату у форматі `startOf('day')`
            const formattedDate = moment
                .utc(history.timestamp)
                .startOf('day')
                .toDate(); // ISO формат дати

            // Отримуємо інформацію про користувача з `UserModel`
            const user = await UserModel.findById(history.userId);
            if (!user) {
                LOGGER.warn(`Користувач з ID ${history.userId} не знайдений`);
                continue;
            }

            // Формуємо ключ для групування: тільки дата
            const key = `${formattedDate}`;

            // Якщо ще не існує запису для цієї дати, створюємо новий
            if (!dailyHistoryMap[key]) {
                // Створюємо новий запис для дня
                dailyHistoryMap[key] = new DailyHistoryModel({
                    date: formattedDate,
                    users: [
                        {
                            userId: user._id,
                            fullName: user.fullName,
                            actions: [
                                {
                                    action: history.action,
                                    oldValue: history.oldValue,
                                    newValue: history.newValue,
                                    timestamp: history.timestamp,
                                },
                            ],
                        },
                    ],
                });
            } else {
                // Якщо запис для цієї дати вже існує, шукаємо користувача у цьому записі
                const userHistory = dailyHistoryMap[key].users.find(
                    (u) => u.userId.toString() === user._id.toString()
                );

                if (userHistory) {
                    // Якщо користувач вже є в записі, додаємо нову дію до його масиву `actions`
                    userHistory.actions.push({
                        action: history.action,
                        oldValue: history.oldValue,
                        newValue: history.newValue,
                        timestamp: history.timestamp,
                    });
                } else {
                    // Якщо користувача ще немає у записі, додаємо нового користувача з його діями
                    dailyHistoryMap[key].users.push({
                        userId: user._id,
                        fullName: user.fullName,
                        actions: [
                            {
                                action: history.action,
                                oldValue: history.oldValue,
                                newValue: history.newValue,
                                timestamp: history.timestamp,
                            },
                        ],
                    });
                }
            }
        }

        // Збереження нових записів у колекцію `DailyHistory`
        const dailyHistories = Object.values(dailyHistoryMap);
        for (const dailyHistory of dailyHistories) {
            await dailyHistory.save();
        }

        LOGGER.info(
            `Міграція завершена. Перенесено ${dailyHistories.length} днів історії.`
        );
    } catch (error: any) {
        LOGGER.error(`[migrateHistory][error]: ${error.message}`, {
            metadata: { error: error, stack: error.stack.toString() },
        });
    } finally {
        // Закриваємо підключення до бази даних
        await disconnect();
        LOGGER.info('Підключення до бази даних закрито.');
    }
};

// Запуск скрипта
migrateHistory();
