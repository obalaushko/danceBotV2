export type SuccessResponse = {
    status: 'success';
    ok: boolean;
    message?: string;
    data?: any;
};

export type ErrorResponse = {
    status: 'error';
    ok: boolean;
    message: string;
    error: any;
};

export type ResponseBody = SuccessResponse | ErrorResponse;

export type SuccessParams = {
    message?: string;
    data?: any;
};

export type ErrorParams = {
    message: string;
    error: any;
};

export type RequestBodyScannerApi = {
    quaryId?: string;
    userIds?: number[];
    userId: number;
};

export type RequestBodyUserInfo = {
    userId: number;
};

export type RequestBodyUpdateUser = {
    userId: number;
    role?: string;
    firstName?: string;
    fullName?: string;
    notifications?: boolean;
    dateExpired?: Date | string;
    totalLessons?: number;
    usedLessons?: number;
    active?: boolean;
};

export type RequestBodyGetAllHistory = {
    page?: number;
    pageSize?: number;
}
