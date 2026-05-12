/**
 * Restaurant Model
 * Represents restaurants with approval workflow and soft deletes
 * References: Phase 5 - Restaurant Management
 */
import { DataTypes, Model, Sequelize } from 'sequelize';

export class Restaurant extends Model {
  declare id: string;
  declare ownerId: string;
  declare name: string;
  declare slug: string;
  declare description?: string;
  declare phone: string;
  declare email?: string;
  declare address: string;
  declare city: string;
  declare province: string;
  declare postalCode?: string;
  declare latitude?: number;
  declare longitude?: number;
  declare logoId?: string;
  declare bannerId?: string;
  declare status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  declare isOpen: boolean;
  declare openTime?: string;
  declare closeTime?: string;
  declare rejectedReason?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;

  // Association declarations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare owner?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare logo?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare banner?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare images?: any[];

  /**
   * Check if restaurant is accepting orders
   */
  canAcceptOrders(): boolean {
    return this.status === 'ACTIVE' && this.isOpen;
  }

  /**
   * Check if restaurant is approved by admin
   */
  isApproved(): boolean {
    return ['APPROVED', 'ACTIVE', 'SUSPENDED'].includes(this.status);
  }

  // Static associate method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static associate?: (models: any) => void;
}

export function initRestaurantModel(sequelize: Sequelize): void {
  Restaurant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'owner_id',
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      province: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'postal_code',
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      logoId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'uploads', key: 'id' },
        field: 'logo_id',
      },
      bannerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'uploads', key: 'id' },
        field: 'banner_id',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      isOpen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_open',
      },
      openTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'open_time',
      },
      closeTime: {
        type: DataTypes.TIME,
        allowNull: true,
        field: 'close_time',
      },
      rejectedReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejected_reason',
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
      modelName: 'Restaurant',
      tableName: 'restaurants',
      timestamps: true,
      paranoid: true, // Enable soft deletes
      underscored: true,
      indexes: [
        { fields: ['slug'], unique: true },
        { fields: ['status'] },
        { fields: ['city'] },
        { fields: ['owner_id'] },
        { fields: ['deleted_at'] },
      ],
    }
  );

  /**
   * Define associations after model initialization
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Restaurant.associate = function (models: any) {
    Restaurant.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner',
      targetKey: 'id',
    });
    Restaurant.belongsTo(models.Upload, {
      foreignKey: 'logoId',
      as: 'logo',
      targetKey: 'id',
    });
    Restaurant.belongsTo(models.Upload, {
      foreignKey: 'bannerId',
      as: 'banner',
      targetKey: 'id',
    });
    if (models.RestaurantImage) {
      Restaurant.hasMany(models.RestaurantImage, {
        foreignKey: 'restaurantId',
        as: 'images',
      });
    }
  };
}
