import { logger } from '../../../utils/logger';
import { jest,describe,it,expect,beforeEach } from '@jest/globals';

// Mock the logger module
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
  }
}));

describe('Logger Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should call info logger', () => {
    const message = 'Test info message';
    logger.info(message);
    expect(logger.info).toHaveBeenCalledWith(message);
  });

  it('should call error logger', () => {
    const message = 'Test error message';
    logger.error(message);
    expect(logger.error).toHaveBeenCalledWith(message);
  });

  it('should call warn logger', () => {
    const message = 'Test warning message';
    logger.warn(message);
    expect(logger.warn).toHaveBeenCalledWith(message);
  });

  it('should call debug logger', () => {
    const message = 'Test debug message';
    logger.debug(message);
    expect(logger.debug).toHaveBeenCalledWith(message);
  });
});