import { Strategy as FacebookStrategy } from 'passport-facebook';
import { FacebookOAuthStrategy } from '../../../strategies/facebook';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('passport-facebook');

describe('Facebook Strategy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a Facebook strategy with correct options', () => {
        const mockVerify = jest.fn();
        const facebookStrategy=new FacebookOAuthStrategy();

        expect(facebookStrategy).toHaveBeenCalledTimes(1);
        const args = (facebookStrategy as any).mock.calls[0][0];
        expect(args.clientID).toBe(process.env.FACEBOOK_CLIENT_ID);
        expect(args.clientSecret).toBe(process.env.FACEBOOK_CLIENT_SECRET);
        expect(args.callbackURL).toBe(process.env.FACEBOOK_CALLBACK_URL);
        expect(args.profileFields).toEqual(['id', 'displayName', 'email']);
    });

    it('should call the verify callback', () => {
        const mockVerify = jest.fn();
        const strategy = new FacebookStrategy(mockVerify as unknown as any, jest.fn());
        const mockAccessToken = 'access-token';
        const mockRefreshToken = 'refresh-token';
        const mockProfile = { id: '123', displayName: 'Test User' };
        const mockDone = jest.fn();

        (strategy as any)._verify(mockAccessToken, mockRefreshToken, mockProfile, mockDone);
        expect(mockVerify).toHaveBeenCalledWith(mockAccessToken, mockRefreshToken, mockProfile, mockDone);
    });
});