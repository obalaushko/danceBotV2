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
