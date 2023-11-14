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
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}.${month}.${year}`;
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
