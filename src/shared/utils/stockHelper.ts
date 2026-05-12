import { Sequelize, QueryTypes, Transaction } from 'sequelize';

/**
 * Stock management utilities
 * Implements atomic stock deduction to prevent race conditions
 * References: STOCK-MANAGEMENT-STRATEGY.MD
 */

export const stockHelper = {
  /**
   * Deduct stock atomically using single SQL UPDATE
   * This is the key to preventing race conditions in concurrent orders
   *
   * Returns true if stock was deducted, false if insufficient
   */
  async deductStockAtomic(
    sequelize: Sequelize,
    dishId: string,
    quantity: number,
    transaction: Transaction
  ): Promise<boolean> {
    const result = await sequelize.query(
      `UPDATE dishes 
       SET stock = stock - :quantity, version = version + 1 
       WHERE id = :dishId AND stock >= :quantity`,
      {
        replacements: { dishId, quantity },
        transaction,
        type: QueryTypes.UPDATE,
      }
    );

    const affectedRows =
      result && typeof result === 'object' && 'affectedRows' in result
        ? ((result as Record<string, unknown>).affectedRows as number)
        : Array.isArray(result)
          ? ((result as unknown[])[0] as unknown as number)
          : 0;
    return affectedRows > 0;
  },

  /**
   * Restore stock on order cancellation
   */
  async restoreStock(
    sequelize: Sequelize,
    dishId: string,
    quantity: number,
    transaction: Transaction
  ): Promise<void> {
    await sequelize.query(
      `UPDATE dishes 
       SET stock = stock + :quantity, version = version + 1 
       WHERE id = :dishId`,
      {
        replacements: { dishId, quantity },
        transaction,
        type: QueryTypes.UPDATE,
      }
    );
  },

  /**
   * Check stock without deducting
   */
  async checkStock(
    sequelize: Sequelize,
    dishId: string,
    requiredQuantity: number
  ): Promise<{ available: number; isSufficient: boolean }> {
    const result = await sequelize.query('SELECT stock FROM dishes WHERE id = :dishId', {
      replacements: { dishId },
      type: QueryTypes.SELECT,
    });

    const row = (result[0] as { stock: number } | undefined) ?? { stock: 0 };
    return {
      available: row.stock,
      isSufficient: row.stock >= requiredQuantity,
    };
  },
};
