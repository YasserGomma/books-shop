import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { authMiddleware } from '../../src/shared/middleware/auth';
import { AuthService } from '../../src/features/auth/auth.service';
import { verifyToken } from '../../src/shared/utils/jwt';

// Mock dependencies
vi.mock('../../src/shared/utils/jwt');
vi.mock('../../src/features/auth/auth.service');

describe('Auth Middleware', () => {
  let mockContext: Partial<Context>;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockContext = {
      req: {
        header: vi.fn(),
      } as any,
      set: vi.fn(),
    };
    
    mockNext = vi.fn();
  });

  it('should authenticate valid token', async () => {
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const mockPayload = {
      userId: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
    };

    vi.mocked(mockContext.req!.header).mockReturnValue('Bearer validtoken');
    vi.mocked(verifyToken).mockReturnValue(mockPayload);
    vi.mocked(AuthService.validateToken).mockResolvedValue(true);
    vi.mocked(AuthService.getUserById).mockResolvedValue(mockUser);

    await authMiddleware(mockContext as Context, mockNext);

    expect(mockContext.set).toHaveBeenCalledWith('user', mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw 401 for missing authorization header', async () => {
    vi.mocked(mockContext.req!.header).mockReturnValue(undefined);

    await expect(authMiddleware(mockContext as Context, mockNext))
      .rejects.toThrow(HTTPException);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw 401 for invalid token format', async () => {
    vi.mocked(mockContext.req!.header).mockReturnValue('InvalidFormat');

    await expect(authMiddleware(mockContext as Context, mockNext))
      .rejects.toThrow(HTTPException);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw 401 for invalid token', async () => {
    vi.mocked(mockContext.req!.header).mockReturnValue('Bearer invalidtoken');
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(authMiddleware(mockContext as Context, mockNext))
      .rejects.toThrow(HTTPException);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw 401 for expired token in Redis', async () => {
    const mockPayload = {
      userId: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
    };

    vi.mocked(mockContext.req!.header).mockReturnValue('Bearer validtoken');
    vi.mocked(verifyToken).mockReturnValue(mockPayload);
    vi.mocked(AuthService.validateToken).mockResolvedValue(false);

    await expect(authMiddleware(mockContext as Context, mockNext))
      .rejects.toThrow(HTTPException);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw 401 for non-existent user', async () => {
    const mockPayload = {
      userId: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
    };

    vi.mocked(mockContext.req!.header).mockReturnValue('Bearer validtoken');
    vi.mocked(verifyToken).mockReturnValue(mockPayload);
    vi.mocked(AuthService.validateToken).mockResolvedValue(true);
    vi.mocked(AuthService.getUserById).mockResolvedValue(null);

    await expect(authMiddleware(mockContext as Context, mockNext))
      .rejects.toThrow(HTTPException);

    expect(mockNext).not.toHaveBeenCalled();
  });
});