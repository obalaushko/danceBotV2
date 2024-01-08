import moment from 'moment-timezone';

export const isCancel = (messsage: string) => {
    if (messsage === '/cancel') {
        return true;
    }
    return false;
};

export const isObjectEmpty = (obj: object) => {
    return Object.entries(obj).length === 0;
};

export const convertDate = (date: Date) => {
    return moment(date).format('DD.MM.YYYY');
};

export const freezeIsAllowed = (date: Date | undefined): string => {
    if (!date) throw new Error('[freezeIsAllowed] Date is empty!');

    const dateAllowed = moment(date).add(90, 'days').toDate();

    return convertDate(dateAllowed);
};

export const pluralizeWord = (number: number) => {
    if (number === 1) {
        return 'заняття'; // Відмінюємо для числа 1
    } else if (number >= 2 && number <= 4) {
        return 'заняття'; // Відмінюємо для чисел 2-4
    } else {
        return 'занять'; // Відмінюємо для інших чисел
    }
};

export const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const checkLastFreeze = (dateFreeze: Date | undefined): boolean => {
    if (!dateFreeze) return true;
    const today = moment.utc();

    const diff = moment.utc(dateFreeze).diff(today, 'days');
    if (diff >= 90) {
        return true;
    } else {
        return false;
    }
};
