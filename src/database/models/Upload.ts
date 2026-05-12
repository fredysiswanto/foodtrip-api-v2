/**
 * Upload Model
 * Represents file uploads (avatars, logos, dish images, etc.)
 */
import { DataTypes, Model, Sequelize } from 'sequelize';

export class Upload extends Model {
  declare id: string;
  declare filename: string;
  declare mimetype: string;
  declare size: number;
  declare url: string;
  declare type?: 'AVATAR' | 'LOGO' | 'BANNER' | 'DISH_IMAGE' | 'OTHER';
  declare folder?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;
}

export function initUploadModel(sequelize: Sequelize): void {
  Upload.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mimetype: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('AVATAR', 'LOGO', 'BANNER', 'DISH_IMAGE', 'OTHER'),
      },
      folder: {
        type: DataTypes.STRING(100),
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
      modelName: 'Upload',
      tableName: 'uploads',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
}
