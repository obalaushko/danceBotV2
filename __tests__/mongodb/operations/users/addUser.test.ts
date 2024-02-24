import { ISubscription } from './../../../../src/mongodb/schemas/subscription';
import { addUser } from "../../../../src/mongodb/operations/users.js";
import { IUser, UserModel } from "../../../../src/mongodb/schemas/user.js";

jest.mock('../schemas/user');

describe('addUser', () => {
    it('should add a user if user does not exist', async () => {
        const mockUser: Partial<IUser> = {
            userId: 1,
            username: 'test',
            role: 'user',
            firstName: 'Test',
            subscription: 'premium' as unknown as ISubscription,
            fullName: 'Test User',
            approved: true,
            notifications: true,
        };

        (UserModel.findOne as jest.Mock).mockResolvedValue(null);
        (UserModel.prototype.save as jest.Mock).mockResolvedValue(mockUser);

        const result = await addUser({
            ...mockUser,
            userId: mockUser.userId || 0,  // provide a default value
        });

        expect(result).toEqual(mockUser);
    });

    it('should return null if user exists', async () => {
        const mockUser: Partial<IUser> = {
            userId: 1,
            username: 'test',
            role: 'user',
            firstName: 'Test',
            subscription: 'premium' as unknown as ISubscription,
            fullName: 'Test User',
            approved: true,
            notifications: true,
        };

        (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

        const result = await addUser({
            ...mockUser,
            userId: mockUser.userId || 0,  // provide a default value
        });

        expect(result).toBeNull();
    });
});