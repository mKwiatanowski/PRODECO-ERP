import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InventoryService } from './inventory.service'
import { InventoryBatch } from './domain/inventory-batch.entity'

describe('InventoryService', () => {
    let service: InventoryService
    let mockRepo: any

    beforeEach(() => {
        mockRepo = {
            find: vi.fn(),
            save: vi.fn(),
        }

        // Mock DataSource/EntityManager behavior
        const mockDataSource = {
            getRepository: vi.fn().mockReturnValue(mockRepo)
        } as any

        service = new InventoryService(mockDataSource)
    })

    describe('getTotalInventoryValue', () => {
        it('should return 0 when inventory is empty', async () => {
            mockRepo.find.mockResolvedValue([])
            const value = await service.getTotalInventoryValue()
            expect(value).toBe(0)
        })

        it('should calculate total value correctly', async () => {
            const batches = [
                { remainingQuantity: 10, purchasePrice: 50 }, // 500
                { remainingQuantity: 5, purchasePrice: 20 },  // 100
                { remainingQuantity: 0, purchasePrice: 100 }  // 0 (empty batch)
            ] as InventoryBatch[]

            mockRepo.find.mockResolvedValue(batches)

            const value = await service.getTotalInventoryValue()
            expect(value).toBe(600)
        })

        it('should handle decimal precision correctly', async () => {
            const batches = [
                { remainingQuantity: 3, purchasePrice: 10.33 }, // 30.99
                { remainingQuantity: 1, purchasePrice: 0.01 },  // 0.01
            ] as InventoryBatch[]

            mockRepo.find.mockResolvedValue(batches)

            const value = await service.getTotalInventoryValue()
            expect(value).toBe(31.00)
        })
    })
})
