/**
 * User Model
 * Represents system users with roles and soft deletes
 * References: Phase 4 - Authentication & Authorization
 */
import { DataTypes, Model, Sequelize } from 'sequelize';
import { bcryptHelper } from '@shared/utils/bcrypt';

export class User extends Model {
  declare id: string;
  declare roleId: string;
  declare restaurantId?: string;
  declare fullName: string;
  declare email: string;
  declare phone?: string;
  declare password: string;
  declare avatarId?: string;
  declare isActive: boolean;
  declare lastLoginAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;

  // Association declarations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare role?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare restaurant?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare avatar?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare refreshTokens?: any[];

  // Static associate method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate?: (models: any) => void;
}

export function initUserModel(sequelize: Sequelize): void {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'roles', key: 'id' },
        field: 'role_id',
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'restaurants', key: 'id' },
        field: 'restaurant_id',
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'full_name',
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      avatarId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'uploads', key: 'id' },
        field: 'avatar_id',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at',
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        { fields: ['email'], unique: true },
        { fields: ['role_id'] },
        { fields: ['restaurant_id'] },
      ],
      hooks: {
        beforeCreate: async (user: User) => {
          // Hash password before creating user
          if (user.password) {
            user.password = await bcryptHelper.hash(user.password);
          }
        },
        beforeUpdate: async (user: User) => {
          // Hash password if it was changed
          if (user.changed('password')) {
            user.password = await bcryptHelper.hash(user.password);
          }
        },
      },
    }
  );

  /**
   * Define associations after model initialization
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  User.associate = function (models: any) {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role',
      targetKey: 'id',
    });
    User.belongsTo(models.Upload, {
      foreignKey: 'avatarId',
      as: 'avatar',
      targetKey: 'id',
    });
    User.hasMany(models.RefreshToken, {
      foreignKey: 'userId',
      as: 'refreshTokens',
      sourceKey: 'id',
    });
  };
}
