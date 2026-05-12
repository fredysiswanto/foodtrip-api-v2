'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM(
          'UNASSIGNED',
          'ASSIGNED',
          'PICKED_UP',
          'IN_TRANSIT',
          'DELIVERED',
          'FAILED'
        ),
        defaultValue: 'UNASSIGNED',
        allowNull: false,
      },
      estimated_delivery_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_delivery_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('deliveries', ['order_id']);
    await queryInterface.addIndex('deliveries', ['driver_id']);
    await queryInterface.addIndex('deliveries', ['status']);
    await queryInterface.addIndex('deliveries', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('deliveries');
  },
};
