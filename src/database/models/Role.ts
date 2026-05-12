/**
 * Role Model
 * Represents user roles: SUPER_ADMIN, RESTO_ADMIN, RESTO_STAFF, DRIVER, CUSTOMER
 */
import { DataTypes, Model, Sequelize } from 'sequelize';

export class Role extends Model {
  declare id: string;
  declare name: string;
  declare description?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;
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
}
