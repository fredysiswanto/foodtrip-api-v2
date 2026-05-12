/**
 * Auth Repository
 * Data access layer for authentication operations
 * References: Phase 4 - Authentication & Authorization, Section 4.2
 */
import { User, RefreshToken } from '@db/models';
import { Transaction } from 'sequelize';

export class AuthRepository {
  /**
   * Find user by email (optionally including soft-deleted)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findUserByEmail(email: string, includeDeleted = false): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { where: { email } };
    if (includeDeleted) {
      query.paranoid = false;
    }
    return User.findOne(query);
  }

  /**
   * Find active user by ID with role association
   */
  async findActiveUserById(userId: string): Promise<User | null> {
    return User.findByPk(userId, {
      include: [{ association: 'role' }],
    });
  }

  /**
   * Create new user
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createUser(data: any, transaction?: Transaction): Promise<User> {
    return User.create(data, { transaction });
  }

  /**
   * Update user last login timestamp
   */
  async updateLastLogin(userId: string, transaction?: Transaction): Promise<void> {
    await User.update({ lastLoginAt: new Date() }, { where: { id: userId }, transaction });
  }

  /**
   * Create refresh token
   */
  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    transaction?: Transaction
  ): Promise<RefreshToken> {
    return RefreshToken.create(
      {
        userId,
        token,
        expiresAt,
      },
      { transaction }
    );
  }

  /**
   * Find valid refresh token with user association
   */
  async findValidRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await RefreshToken.findOne({
      where: { token },
      include: [
        {
          association: 'user',
          include: [{ association: 'role' }],
        },
      ],
    });

    if (!refreshToken || !refreshToken.isValid()) {
      return null;
    }

    return refreshToken;
  }

  /**
   * Revoke single refresh token
   */
  async revokeRefreshToken(tokenId: string, transaction?: Transaction): Promise<void> {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { id: tokenId }, transaction });
  }

  /**
   * Revoke all user refresh tokens (for logout)
   */
  async revokeAllUserTokens(userId: string, transaction?: Transaction): Promise<void> {
    await RefreshToken.update(
      { revokedAt: new Date() },
      {
        where: { userId, revokedAt: null },
        transaction,
      }
    );
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await User.count({ where: { email } });
    return count > 0;
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string): Promise<boolean> {
    const count = await User.count({ where: { phone } });
    return count > 0;
  }
}
