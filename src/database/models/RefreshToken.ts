/**
 * RefreshToken Model
 * Manages JWT refresh tokens with expiration and revocation
 * References: Phase 4 - Authentication & Authorization
 */
import { DataTypes, Model, Sequelize } from 'sequelize';

export class RefreshToken extends Model {
  declare id: string;
  declare userId: string;
  declare token: string;
  declare expiresAt: Date;
  declare revokedAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Association declarations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare user?: any;

  // Static associate method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate?: (models: any) => void;

  /**
   * Check if token is valid (not expired and not revoked)
   */
  isValid(): boolean {
    return Date.now() < this.expiresAt.getTime() && !this.revokedAt;
  }
}

export function initRefreshTokenModel(sequelize: Sequelize): void {
  RefreshToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'user_id',
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['token'], unique: true },
        { fields: ['expires_at'] },
      ],
    }
  );

  /**
   * Define associations after model initialization
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RefreshToken.associate = function (models: any) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      targetKey: 'id',
    });
  };
}
