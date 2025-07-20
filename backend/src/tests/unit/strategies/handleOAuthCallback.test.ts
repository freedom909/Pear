import { Profile } from 'passport';
import { IUserProfile } from '../../../models/interface';
import { UserDocument } from '../../../models/user/user.types';
import { handleOAuthCallback } from '../../../strategies/handleOAuthCallback';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('Handle OAuth Callback', () => {
    let mockUserService;

    beforeEach(() => {
        mockUserService = {
            findUserByOAuthProfile: jest.fn(),
            findUserByEmail: jest.fn(),
            linkOAuthProviderToUser: jest.fn(),
            createUserFromOAuthProfile: jest.fn()
        };
    });

    it('should find existing user by OAuth profile ID', async () => {
        const mockProfile = { 
            id: '123', 
            provider: 'facebook',
            emails: [{ value: 'test@example.com' }],
            name: { givenName: 'Test', familyName: 'User' },
            photos: [{ value: 'https://example.com/photo.jpg' }]
        };
        const mockUser = { 
            _id: 'user1', 
            facebook: { id: '123' }
        };
        
        mockUserService.findUserByOAuthProfile.mockResolvedValue(mockUser);

        const result = await handleOAuthCallback(
            mockProfile as unknown as Profile,
            'facebook',
            mockUserService,
            'access-token',
            'refresh-token'
        );

        expect(mockUserService.findUserByOAuthProfile).toHaveBeenCalledWith(
            { id: '123' },
            'facebook'
        );
        expect(result).toBe(mockUser);
        expect(mockUserService.linkOAuthProviderToUser).not.toHaveBeenCalled();
    });

    it('should find user by email if not found by profile ID', async () => {
        const mockProfile = { 
            id: '123', 
            provider: 'facebook',
            emails: [{ value: 'test@example.com' }],
            name: { givenName: 'Test', familyName: 'User' }
        };
        const mockUser = { 
            _id: 'user1', 
            facebook: null
        };
        
        mockUserService.findUserByOAuthProfile.mockResolvedValue(null);
        mockUserService.findUserByEmail.mockResolvedValue(mockUser);

        const result = await handleOAuthCallback(
            mockProfile as unknown as Profile,
            'facebook',
            mockUserService,
            'access-token',
            'refresh-token'
        );

        expect(mockUserService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(mockUserService.linkOAuthProviderToUser).toHaveBeenCalledWith(
            mockUser,
            'facebook',
            '123',
            mockProfile,
            true
        );
        expect(result).toBe(mockUser);
    });

    it('should create new user if not found by profile ID or email', async () => {
        const mockProfile = { 
            id: '123',
            emails: [{ value: 'test@example.com' }],
            name: { givenName: 'Test', familyName: 'User' },
            photos: [{ value: 'https://example.com/photo.jpg' }]
        };
        const mockCreatedUser = { 
            _id: 'newuser1', 
            name: { firstname: 'Test', lastname: 'User' }
        };
        
        mockUserService.findUserByOAuthProfile.mockResolvedValue(null);
        mockUserService.findUserByEmail.mockResolvedValue(null);
        mockUserService.createUserFromOAuthProfile.mockResolvedValue(mockCreatedUser);

        const result = await handleOAuthCallback(
            mockProfile as unknown as Profile,
            'facebook',
            mockUserService,
            'access-token',
            'refresh-token'
        );

        expect(mockUserService.createUserFromOAuthProfile).toHaveBeenCalledWith({
            id: '123',
            name: {
                firstname: 'Test',
                lastname: 'User'
            },
            username: 'Test User',
            emails: [{ value: 'test@example.com' }],
            avatar: 'https://example.com/photo.jpg',
            isVerified: true,
            provider: 'facebook',
            oauth: {
                accessToken: 'access-token',
                refreshToken: 'refresh-token'
            }
        });
        expect(result).toBe(mockCreatedUser);
    });

    it('should handle profiles without emails', async () => {
        const mockProfile = { 
            id: '123',
            name: { givenName: 'Test', familyName: 'User' }
        };
        
        mockUserService.findUserByOAuthProfile.mockResolvedValue(null);
        mockUserService.findUserByEmail.mockResolvedValue(null);
        mockUserService.createUserFromOAuthProfile.mockResolvedValue({ _id: 'newuser1' });

        await handleOAuthCallback(
            mockProfile as unknown as Profile,
            'facebook',
            mockUserService,
            'access-token',
            'refresh-token'
        );

        expect(mockUserService.findUserByEmail).toHaveBeenCalledWith('123@facebook.oauth.local');
    });
});