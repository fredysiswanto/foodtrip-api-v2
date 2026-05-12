/**
 * RestaurantImage Model
 * Represents gallery images linked to restaurants via uploads
 * References: Phase 5 - Restaurant Management
 */
import { DataTypes, Model, Sequelize } from 'sequelize';

export class RestaurantImage extends Model {
  declare id: string;
  declare restaurantId: string;
  declare uploadId: string;
  declare createdAt: Date;

  // Association declarations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare restaurant?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare upload?: any;

  // Static associate method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate?: (models: any) => void;
}

export function initRestaurantImageModel(sequelize: Sequelize): void {
  RestaurantImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      restaurantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'restaurants', key: 'id' },
        field: 'restaurant_id',
        onDelete: 'CASCADE',
      },
      uploadId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'uploads', key: 'id' },
        field: 'upload_id',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
    },
    {
      sequelize,
      modelName: 'RestaurantImage',
      tableName: 'restaurant_images',
      timestamps: false,
      underscored: true,
      indexes: [
        { fields: ['restaurant_id'] },
        { fields: ['restaurant_id', 'upload_id'], unique: true },
      ],
    }
  );

  /**
   * Define associations after model initialization
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RestaurantImage.associate = function (models: any) {
    RestaurantImage.belongsTo(models.Restaurant, {
      foreignKey: 'restaurantId',
      as: 'restaurant',
      targetKey: 'id',
    });
    RestaurantImage.belongsTo(models.Upload, {
      foreignKey: 'uploadId',
      as: 'upload',
      targetKey: 'id',
    });
  };
}
