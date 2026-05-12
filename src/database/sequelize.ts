import { Sequelize, Options, Dialect } from 'sequelize';
import { databaseConfig } from '@config/index';
import logger from '@shared/utils/logger';

let sequelize: Sequelize | null = null;

/**
 * Initialize Sequelize connection based on environment
 */
export function initializeSequelize(): Sequelize {
  if (sequelize) {
    return sequelize;
  }

  const env = process.env.NODE_ENV || 'development';

  logger.info(`Initializing Sequelize for ${env} environment`, {
    dialect: databaseConfig.dialect,
    database: databaseConfig.database || databaseConfig.storage,
  });

  const baseOptions: Options = {
    logging: false,
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true,
      freezeTableName: true,
    },
  };

  if (databaseConfig.dialect === 'sqlite') {
    sequelize = new Sequelize({
      ...baseOptions,
      dialect: 'sqlite',
      storage: databaseConfig.storage,
    });
  } else {
    sequelize = new Sequelize(
      databaseConfig.database || '',
      databaseConfig.username || '',
      databaseConfig.password || '',
      {
        ...baseOptions,
        host: databaseConfig.host,
        port: databaseConfig.port || 3306,
        dialect: databaseConfig.dialect as Dialect,
        pool: databaseConfig.pool,
      }
    );
  }

  return sequelize;
}

/**
 * Get singleton Sequelize instance
 */
export function getSequelize(): Sequelize {
  if (!sequelize) {
    throw new Error('Sequelize not initialized. Call initializeSequelize() first.');
  }
  return sequelize;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const instance = initializeSequelize();
    await instance.authenticate();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
    logger.info('Database connection closed');
  }
}
