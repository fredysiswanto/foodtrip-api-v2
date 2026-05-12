/**
 * Role Model
 * Represents user roles: SUPER_ADMIN, RESTO_ADMIN, RESTO_STAFF, DRIVER, CUSTOMER
 * References: Phase 4 - Authentication & Authorization
 */
import { DataTypes, Model, Sequelize } from 'sequelize';

export class Role extends Model {
  declare id: string;
  declare name: string;
  declare description?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;

  // Association declarations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare users?: any[];

  // Static associate method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate?: (models: any) => void;
}

export function initRoleModel(sequelize: Sequelize): void {
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  /**
   * Define associations after model initialization
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Role.associate = function (models: any) {
    Role.hasMany(models.User, {
      foreignKey: 'roleId',
      as: 'users',
      sourceKey: 'id',
    });
  };
}
