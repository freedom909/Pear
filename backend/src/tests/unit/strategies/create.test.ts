import { createStrategy } from '../../../strategies/create';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

describe('Create Strategy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a strategy with the provided options and verify function', () => {
        const mockOptions = { option1: 'value1' };
        const mockVerify = jest.fn();
        const mockStrategy = jest.fn();

        const strategy = createStrategy(mockStrategy as unknown as string);
        expect(mockStrategy).toHaveBeenCalledWith(mockOptions, mockVerify);
        expect(strategy).toBeInstanceOf(mockStrategy);
    });
});