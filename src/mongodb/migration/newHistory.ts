import { connect, disconnect } from 'mongoose';
import { HistoryModel } from '../schemas/history.js';
import { DailyHistoryModel, IDailyHistory } from '../schemas/dailyHistory.js';
import { UserModel } from '../schemas/user.js';
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
/**
 *
 * @author chatGPT
 */
const migrateHistory = async () => {
    try {
        // Підключаємося до бази даних
        await connect(MONGO_URI);
        LOGGER.info('Підключено до бази даних');

        // Отримуємо всі записи зі старої моделі `HistoryModel`
        const oldHistories = await HistoryModel.find();
        if (oldHistories.length === 0) {
            LOGGER.info('Немає записів для міграції');
            return;
        }

        // Групуємо записи за датою і користувачем
        const dailyHistoryMap: Record<string, IDailyHistory> = {};

        for (const history of oldHistories) {
            // Отримуємо відповідну дату в форматі "DD.MM.YYYY"
            const formattedDate = moment(history.timestamp).format(
                'DD.MM.YYYY'
            );

            // Отримуємо інформацію про користувача з `UserModel`
            const user = await UserModel.findById(history.userId);
            if (!user) {
                LOGGER.warn(`Користувач з ID ${history.userId} не знайдений`);
                continue;
            }

            // Формуємо ключ для групування: дата + userId
            const key = `${formattedDate}_${user._id}`;

            if (!dailyHistoryMap[key]) {
                // Створюємо новий запис для кожного дня та користувача
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
                // Додаємо нову дію до існуючого запису користувача
                const userHistory = dailyHistoryMap[key].users.find(
                    (u) => u.userId.toString() === user._id.toString()
                );

                if (userHistory) {
                    userHistory.actions.push({
                        action: history.action,
                        oldValue: history.oldValue,
                        newValue: history.newValue,
                        timestamp: history.timestamp,
                    });
                } else {
                    // Додаємо новий запис для користувача в рамках одного дня
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

        // Опціонально: Видалення старих записів
        // await HistoryModel.deleteMany();

        // LOGGER.info('Старі записи видалено.');
    } catch (error: any) {
        LOGGER.error(`[migrateHistory][error]: ${error.message}`, {
            metadata: { error: error, stack: error.stack.toString() },
        });
    } finally {
        // Закриваємо підключення до бази даних
        await disconnect();
        LOGGER.info('Підключення до бази даних закрито');
    }
};

// Запуск скрипта
migrateHistory();
