/**
 * Database Models Index
 * Initializes and exports all Sequelize models
 * References: Phase 4 - Authentication & Authorization
 */
import { Sequelize } from 'sequelize';
import { Role, initRoleModel } from './Role';
import { Upload, initUploadModel } from './Upload';
import { User, initUserModel } from './User';
import { RefreshToken, initRefreshTokenModel } from './RefreshToken';

export { Role, Upload, User, RefreshToken };

/**
 * Initialize all models
 */
export function initializeModels(sequelize: Sequelize): void {
  // Initialize models
  initRoleModel(sequelize);
  initUploadModel(sequelize);
  initUserModel(sequelize);
  initRefreshTokenModel(sequelize);

  // Define associations after all models are initialized
  const models = {
    Role,
    Upload,
    User,
    RefreshToken,
  };

  // Call associate methods on each model
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.values(models).forEach((model: any) => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });
}
