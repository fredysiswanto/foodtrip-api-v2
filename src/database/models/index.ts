/**
 * Database Models Index
 * Initializes and exports all Sequelize models
 */
import { Sequelize } from 'sequelize';
import { Role, initRoleModel } from './Role';
import { Upload, initUploadModel } from './Upload';

export { Role, Upload };

/**
 * Initialize all models
 */
export function initializeModels(sequelize: Sequelize): void {
  initRoleModel(sequelize);
  initUploadModel(sequelize);

  // Define associations after all models are initialized
  // Role.hasMany(User, { foreignKey: 'role_id' });
  // Upload.hasMany(User, { foreignKey: 'avatar_id' });
}
