export const isCancel = (messsage: string) => {
    if (messsage === '/cancel') {
        return true;
    }
    return false;
}

export const isObjectEmpty = (obj: object) => {
    return Object.entries(obj).length === 0;
}