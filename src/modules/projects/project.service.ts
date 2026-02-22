import { DataSource } from "typeorm"
import { Project } from "./domain/project.entity"
import { InventoryService } from "../inventory/inventory.service"
import { DocumentType } from "../inventory/domain/inventory-document.entity"

export class ProjectService {
    constructor(private dataSource: DataSource) { }

    async createProject(dto: {
        name: string,
        clientName: string,
        assignedEmployeeId: string,
        materialsToConsume: { productId: string, quantity: number }[]
    }): Promise<Project> {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            // Create Project Instance
            const project = new Project()
            project.name = dto.name
            project.clientName = dto.clientName
            project.assignedEmployeeId = dto.assignedEmployeeId
            project.status = 'IN_PROGRESS'
            project.materialsUsed = []

            let totalProjectCost = 0

            // Scope Inventory Service to Transaction using the same manager
            // We need to cast or ensure compatibility. 
            // My InventoryService constructor accepts `DataSource | EntityManager`.
            const transactionalInventoryService = new InventoryService(transactionalEntityManager)

            const rwItems: { productId: string, quantity: number, price: number }[] = []

            // Consuming materials
            for (const item of dto.materialsToConsume) {
                // 1. Calculate Cost (FIFO) - This does NOT consume yet, just calculates
                // Note: calculateFIFOCost in my service is read-only.
                // But consumeStock doesn't return cost. 
                // We should logically:
                // a) Calculate cost (to save in project history)
                // b) Consume stock (to reduce inventory)
                // WARNING: Concurrency issue if between calc and consume stock changes, but we are in transaction (if DB supports locking or we use serialized isolation).
                // SQLite is usually file-locked so it's safer.

                const cost = await transactionalInventoryService.calculateFIFOCost(item.productId, item.quantity)

                // 2. Consume Stock
                await transactionalInventoryService.consumeStock(item.productId, item.quantity)

                // 3. Record usage
                project.materialsUsed.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    cost: cost
                })

                rwItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: cost / item.quantity // Average price per unit consumed
                })

                totalProjectCost += cost
            }

            project.totalMaterialCost = totalProjectCost

            // Generate RW Document
            const generatedProject = await transactionalEntityManager.save(Project, project)
            await transactionalInventoryService.createDocument(DocumentType.RW, generatedProject.id, rwItems)

            return generatedProject
        })
    }

    async getProjects(): Promise<Project[]> {
        return await this.dataSource.getRepository(Project).find({
            order: {
                createdAt: 'DESC'
            }
        });
    }
}
