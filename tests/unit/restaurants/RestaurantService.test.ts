/**
 * Restaurant Service Unit Tests
 * Tests business logic for restaurant management
 * References: Phase 5 - Restaurant Management
 */
import { RestaurantService } from '../../../src/modules/restaurants/services/RestaurantService';
import { RestaurantRepository } from '../../../src/modules/restaurants/repositories/RestaurantRepository';
import { Sequelize } from 'sequelize';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from '../../../src/shared/errors';

describe('RestaurantService - Unit Tests', () => {
  let restaurantService: RestaurantService;
  let mockRepository: jest.Mocked<RestaurantRepository>;
  let mockSequelize: jest.Mocked<Sequelize>;

  beforeEach(() => {
    // Mock dependencies
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByOwner: jest.fn(),
      findByStatus: jest.fn(),
      findPending: jest.fn(),
      findPublic: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdWithDetails: jest.fn(),
      addGalleryImage: jest.fn(),
      removeGalleryImage: jest.fn(),
      findGalleryImageById: jest.fn(),
    } as any;

    mockSequelize = {
      transaction: jest.fn(),
      query: jest.fn(),
    } as any;

    restaurantService = new RestaurantService(mockRepository, mockSequelize);
  });

  describe('createRestaurant', () => {
    const validInput = {
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      phone: '+6281234567890',
      address: '123 Main Street',
      city: 'Jakarta',
      province: 'DKI Jakarta',
    };

    it('should create restaurant with valid data', async () => {
      const ownerId = 'owner-123';
      const mockRestaurant = {
        id: 'rest-123',
        ...validInput,
        ownerId,
        status: 'PENDING',
        isOpen: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockRestaurant as any);

      const result = await restaurantService.createRestaurant(ownerId, validInput);

      expect(result).toEqual(mockRestaurant);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith(validInput.slug, true);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should reject duplicate slug', async () => {
      const existingRestaurant = { id: 'rest-456', slug: validInput.slug };
      mockRepository.findBySlug.mockResolvedValue(existingRestaurant as any);

      await expect(restaurantService.createRestaurant('owner-123', validInput)).rejects.toThrow(
        ConflictError
      );
    });

    it('should reject invalid slug format', async () => {
      const invalidInput = { ...validInput, slug: 'Test Restaurant!' };

      await expect(restaurantService.createRestaurant('owner-123', invalidInput)).rejects.toThrow(
        ValidationError
      );
    });

    it('should reject missing required fields', async () => {
      const incompleteInput = { ...validInput, name: '' };

      await expect(
        restaurantService.createRestaurant('owner-123', incompleteInput)
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid email format', async () => {
      const invalidInput = { ...validInput, email: 'not-an-email' };
      mockRepository.findBySlug.mockResolvedValue(null);

      await expect(restaurantService.createRestaurant('owner-123', invalidInput)).rejects.toThrow(
        ValidationError
      );
    });

    it('should reject invalid phone format', async () => {
      const invalidInput = { ...validInput, phone: '123' };

      await expect(restaurantService.createRestaurant('owner-123', invalidInput)).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('updateRestaurant', () => {
    const restaurantId = 'rest-123';
    const ownerId = 'owner-123';

    it('should update restaurant when owner', async () => {
      const mockRestaurant = { id: restaurantId, ownerId, name: 'Old Name' };
      const updateData = { name: 'New Name' };
      const updatedRestaurant = { ...mockRestaurant, ...updateData };

      mockRepository.findById.mockResolvedValue(mockRestaurant as any);
      mockRepository.update.mockResolvedValue(updatedRestaurant as any);

      const result = await restaurantService.updateRestaurant(restaurantId, ownerId, updateData);

      expect(result).toEqual(updatedRestaurant);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('should reject non-owner update', async () => {
      const mockRestaurant = { id: restaurantId, ownerId };
      mockRepository.findById.mockResolvedValue(mockRestaurant as any);

      await expect(
        restaurantService.updateRestaurant(restaurantId, 'different-owner', { name: 'New Name' })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should reject non-existent restaurant', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        restaurantService.updateRestaurant(restaurantId, ownerId, { name: 'New Name' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should reject duplicate slug on update', async () => {
      const mockRestaurant = { id: restaurantId, ownerId, slug: 'old-slug' };
      const existingRestaurant = { id: 'other-rest', slug: 'new-slug' };

      mockRepository.findById.mockResolvedValue(mockRestaurant as any);
      mockRepository.findBySlug.mockResolvedValue(existingRestaurant as any);

      await expect(
        restaurantService.updateRestaurant(restaurantId, ownerId, { slug: 'new-slug' })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('deleteRestaurant', () => {
    const restaurantId = 'rest-123';
    const ownerId = 'owner-123';

    it('should soft delete restaurant when owner', async () => {
      const mockRestaurant = { id: restaurantId, ownerId };
      mockRepository.findById.mockResolvedValue(mockRestaurant as any);
      mockRepository.delete.mockResolvedValue(undefined);

      await restaurantService.deleteRestaurant(restaurantId, ownerId);

      expect(mockRepository.delete).toHaveBeenCalledWith(restaurantId, undefined);
    });

    it('should reject non-owner delete', async () => {
      const mockRestaurant = { id: restaurantId, ownerId };
      mockRepository.findById.mockResolvedValue(mockRestaurant as any);

      await expect(
        restaurantService.deleteRestaurant(restaurantId, 'different-owner')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should reject non-existent restaurant', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(restaurantService.deleteRestaurant(restaurantId, ownerId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('Status Workflow', () => {
    const restaurantId = 'rest-123';

    describe('approveRestaurant', () => {
      it('should approve PENDING restaurant', async () => {
        const mockRestaurant = { id: restaurantId, status: 'PENDING' };
        const approved = { ...mockRestaurant, status: 'APPROVED' };

        mockRepository.findById.mockResolvedValue(mockRestaurant as any);
        mockRepository.update.mockResolvedValue(approved as any);

        const result = await restaurantService.approveRestaurant(restaurantId);

        expect(result.status).toBe('APPROVED');
        expect(mockRepository.update).toHaveBeenCalledWith(
          restaurantId,
          { status: 'APPROVED' },
          undefined
        );
      });

      it('should reject non-PENDING restaurant', async () => {
        const mockRestaurant = { id: restaurantId, status: 'APPROVED' };
        mockRepository.findById.mockResolvedValue(mockRestaurant as any);

        await expect(restaurantService.approveRestaurant(restaurantId)).rejects.toThrow(
          ValidationError
        );
      });
    });

    describe('rejectRestaurant', () => {
      it('should reject PENDING restaurant with reason', async () => {
        const mockRestaurant = { id: restaurantId, status: 'PENDING' };
        const rejected = {
          ...mockRestaurant,
          status: 'REJECTED',
          rejectedReason: 'Invalid documents',
        };

        mockRepository.findById.mockResolvedValue(mockRestaurant as any);
        mockRepository.update.mockResolvedValue(rejected as any);

        const result = await restaurantService.rejectRestaurant(restaurantId, 'Invalid documents');

        expect(result.status).toBe('REJECTED');
        expect(mockRepository.update).toHaveBeenCalledWith(
          restaurantId,
          { status: 'REJECTED', rejectedReason: 'Invalid documents' },
          undefined
        );
      });

      it('should require rejection reason', async () => {
        const mockRestaurant = { id: restaurantId, status: 'PENDING' };
        mockRepository.findById.mockResolvedValue(mockRestaurant as any);

        await expect(restaurantService.rejectRestaurant(restaurantId, '')).rejects.toThrow(
          ValidationError
        );
      });
    });

    describe('suspendRestaurant', () => {
      it('should suspend ACTIVE restaurant', async () => {
        const mockRestaurant = { id: restaurantId, status: 'ACTIVE' };
        const suspended = { ...mockRestaurant, status: 'SUSPENDED', isOpen: false };

        mockRepository.findById.mockResolvedValue(mockRestaurant as any);
        mockRepository.update.mockResolvedValue(suspended as any);

        const result = await restaurantService.suspendRestaurant(restaurantId);

        expect(result.status).toBe('SUSPENDED');
      });

      it('should reject non-ACTIVE restaurant', async () => {
        const mockRestaurant = { id: restaurantId, status: 'PENDING' };
        mockRepository.findById.mockResolvedValue(mockRestaurant as any);

        await expect(restaurantService.suspendRestaurant(restaurantId)).rejects.toThrow(
          ValidationError
        );
      });
    });

    describe('reactivateRestaurant', () => {
      it('should reactivate SUSPENDED restaurant', async () => {
        const mockRestaurant = { id: restaurantId, status: 'SUSPENDED' };
        const reactivated = { ...mockRestaurant, status: 'ACTIVE' };

        mockRepository.findById.mockResolvedValue(mockRestaurant as any);
        mockRepository.update.mockResolvedValue(reactivated as any);

        const result = await restaurantService.reactivateRestaurant(restaurantId);

        expect(result.status).toBe('ACTIVE');
      });

      it('should reactivate APPROVED restaurant', async () => {
        const mockRestaurant = { id: restaurantId, status: 'APPROVED' };
        const reactivated = { ...mockRestaurant, status: 'ACTIVE' };

        mockRepository.findById.mockResolvedValue(mockRestaurant as any);
        mockRepository.update.mockResolvedValue(reactivated as any);

        const result = await restaurantService.reactivateRestaurant(restaurantId);

        expect(result.status).toBe('ACTIVE');
      });

      it('should reject reactivating non-SUSPENDED/APPROVED restaurant', async () => {
        const mockRestaurant = { id: restaurantId, status: 'PENDING' };
        mockRepository.findById.mockResolvedValue(mockRestaurant as any);

        await expect(restaurantService.reactivateRestaurant(restaurantId)).rejects.toThrow(
          ValidationError
        );
      });
    });
  });

  describe('getRestaurantById', () => {
    const restaurantId = 'rest-123';

    it('should return ACTIVE restaurant', async () => {
      const mockRestaurant = { id: restaurantId, status: 'ACTIVE' };
      mockRepository.findByIdWithDetails.mockResolvedValue(mockRestaurant as any);

      const result = await restaurantService.getRestaurantById(restaurantId);

      expect(result).toEqual(mockRestaurant);
    });

    it('should reject inactive restaurant by default', async () => {
      const mockRestaurant = { id: restaurantId, status: 'PENDING' };
      mockRepository.findByIdWithDetails.mockResolvedValue(mockRestaurant as any);

      await expect(restaurantService.getRestaurantById(restaurantId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should include inactive restaurant when requested', async () => {
      const mockRestaurant = { id: restaurantId, status: 'PENDING' };
      mockRepository.findByIdWithDetails.mockResolvedValue(mockRestaurant as any);

      const result = await restaurantService.getRestaurantById(restaurantId, true);

      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('searchPublicRestaurants', () => {
    it('should search public restaurants with pagination', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockRestaurants: any[] = [
        { id: 'rest-1', status: 'ACTIVE', city: 'Jakarta' },
        { id: 'rest-2', status: 'ACTIVE', city: 'Jakarta' },
      ];

      mockRepository.findPublic.mockResolvedValue({
        restaurants: mockRestaurants,
        total: 2,
      });

      const result = await restaurantService.searchPublicRestaurants({
        city: 'Jakarta',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toEqual(mockRestaurants);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should include pagination metadata', async () => {
      mockRepository.findPublic.mockResolvedValue({
        restaurants: [],
        total: 100,
      });

      const result = await restaurantService.searchPublicRestaurants({
        limit: 20,
        offset: 40,
      });

      expect(result.pagination.page).toBe(3);
      expect(result.pagination.hasMore).toBe(true);
    });
  });

  describe('Gallery Images', () => {
    const restaurantId = 'rest-123';
    const ownerId = 'owner-123';

    describe('addGalleryImage', () => {
      it('should add image when owner', async () => {
        const uploadId = 'upload-123';
        const mockRestaurant = { id: restaurantId, ownerId };
        const mockImage = { id: 'img-123', restaurantId, uploadId };

        mockRepository.findById.mockResolvedValue(mockRestaurant as any);
        mockRepository.addGalleryImage.mockResolvedValue(mockImage as any);

        const result = await restaurantService.addGalleryImage(restaurantId, uploadId, ownerId);

        expect(result).toEqual(mockImage);
      });

      it('should reject non-owner add image', async () => {
        const mockRestaurant = { id: restaurantId, ownerId };
        mockRepository.findById.mockResolvedValue(mockRestaurant as any);

        await expect(
          restaurantService.addGalleryImage(restaurantId, 'upload-123', 'different-owner')
        ).rejects.toThrow(UnauthorizedError);
      });
    });

    describe('removeGalleryImage', () => {
      it('should remove image when owner', async () => {
        const imageId = 'img-123';
        const mockImage = { id: imageId, restaurantId };
        const mockRestaurant = { id: restaurantId, ownerId };

        mockRepository.findGalleryImageById.mockResolvedValue(mockImage as any);
        mockRepository.findById.mockResolvedValue(mockRestaurant as any);
        mockRepository.removeGalleryImage.mockResolvedValue(undefined);

        await restaurantService.removeGalleryImage(imageId, restaurantId, ownerId);

        expect(mockRepository.removeGalleryImage).toHaveBeenCalledWith(imageId, undefined);
      });

      it('should reject non-owner remove image', async () => {
        const imageId = 'img-123';
        const mockImage = { id: imageId, restaurantId };
        const mockRestaurant = { id: restaurantId, ownerId };

        mockRepository.findGalleryImageById.mockResolvedValue(mockImage as any);
        mockRepository.findById.mockResolvedValue(mockRestaurant as any);

        await expect(
          restaurantService.removeGalleryImage(imageId, restaurantId, 'different-owner')
        ).rejects.toThrow(UnauthorizedError);
      });
    });
  });
});
