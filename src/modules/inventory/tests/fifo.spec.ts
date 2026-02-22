import { DataSource, QueryRunner } from "typeorm"
import { InventoryService } from "../inventory.service"
import { InventoryBatch } from "../domain/inventory-batch.entity"
import { BaseEntity } from "../../../core/base.entity"
import { InsufficientStockException } from "../exceptions/insufficient-stock.exception"

describe("InventoryService - FIFO Logic & Scenarios", () => {
    let dataSource: DataSource
    let queryRunner: QueryRunner
    let inventoryService: InventoryService

    beforeAll(async () => {
        dataSource = new DataSource({
            type: 'better-sqlite3',
            database: ":memory:",
            entities: [InventoryBatch, BaseEntity],
            synchronize: true,
            logging: false
        })
        await dataSource.initialize()
    })

    afterAll(async () => {
        if (dataSource.isInitialized) {
            await dataSource.destroy()
        }
    })

    beforeEach(async () => {
        // Start a new transaction for each test
        queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        // Inject the transactional entity manager
        inventoryService = new InventoryService(queryRunner.manager)
    })

    afterEach(async () => {
        // Rollback changes after each test to ensure isolation
        if (queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction()
        }
        await queryRunner.release()
    })

    test("Scenario 1: Insufficient Stock Exception", async () => {
        const productId = "ITEM-001"
        // Setup: Add 10 items
        await inventoryService.addStock(productId, "BATCH-1", 10, 100)

        // Attempt to consume 20
        try {
            await inventoryService.consumeStock(productId, 20)
            fail("Should have thrown InsufficientStockException")
        } catch (error) {
            expect(error).toBeInstanceOf(InsufficientStockException)
            const e = error as InsufficientStockException
            expect(e.message).toContain("Required: 20")
            expect(e.message).toContain("Available: 10")
            expect(e.message).toContain("Missing: 10")
        }
    })

    test("Scenario 2: Financial Precision (Rounding)", async () => {
        const productId = "ITEM-PRECISION"
        // Add stock with fractional price: 10.33
        await inventoryService.addStock(productId, "BATCH-P1", 100, 10.33)

        // Calculate cost for 0.5 units
        // Raw cost: 0.5 * 10.33 = 5.165
        // Expected rounded: 5.17
        const cost = await inventoryService.calculateFIFOCost(productId, 0.5)

        expect(cost).toBe(5.17)
    })

    test("Scenario 2b: Financial Precision (Multiple Batches)", async () => {
        const productId = "ITEM-PRECISION-MIX"
        // Batch A: 10 units @ 10.00
        await inventoryService.addStock(productId, "BATCH-A", 10, 10.00)
        // Batch B: 10 units @ 10.3333... (simulate high precision)
        await inventoryService.addStock(productId, "BATCH-B", 10, 10.3333)

        // Calculate cost for 11 units:
        // 10 from A (10 * 10 = 100)
        // 1 from B (1 * 10.3333 = 10.3333)
        // Total raw: 110.3333
        // Expected: 110.33
        const cost = await inventoryService.calculateFIFOCost(productId, 11)
        expect(cost).toBe(110.33)
    })

    test("Scenario 3: Validation - Negative Price", async () => {
        const productId = "ITEM-BAD"
        await expect(inventoryService.addStock(productId, "BATCH-X", 10, -50))
            .rejects
            .toThrow("Price must be positive")

        await expect(inventoryService.addStock(productId, "BATCH-Y", 10, 0))
            .rejects
            .toThrow("Price must be positive")
    })

    test("Scenario 4: FIFO Consumption Logic (Standard)", async () => {
        const productId = "SOIL-BAG-20L"
        // 1. Purchase 50 units (Batch A) at 10 PLN
        await inventoryService.addStock(productId, "BATCH-A", 50, 10.00)
        // Artificial delay not strictly needed due to sequential await but kept for logic clarity
        await new Promise(r => setTimeout(r, 10))
        // 2. Purchase 50 units (Batch B) at 20 PLN
        await inventoryService.addStock(productId, "BATCH-B", 50, 20.00)

        // 3. Calculate Cost for 60 units
        // Expected: 50 * 10 (Batch A) + 10 * 20 (Batch B) = 500 + 200 = 700
        const calculatedCost = await inventoryService.calculateFIFOCost(productId, 60)
        expect(calculatedCost).toBe(700)

        // 4. Consume
        await inventoryService.consumeStock(productId, 60)

        // 5. Check remaining in DB (using queryRunner manager to see transaction state)
        const batchA = await queryRunner.manager.findOne(InventoryBatch, { where: { batchNumber: "BATCH-A" } })
        const batchB = await queryRunner.manager.findOne(InventoryBatch, { where: { batchNumber: "BATCH-B" } })

        expect(batchA?.remainingQuantity).toBe(0)
        expect(batchB?.remainingQuantity).toBe(40)
    })
})
