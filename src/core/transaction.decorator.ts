import { AppDataSource } from "./db/data-source"

export function Transactional() {
    return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            const queryRunner = AppDataSource.createQueryRunner()
            await queryRunner.connect()
            await queryRunner.startTransaction()

            try {
                // In a full implementation, we would bind the queryRunner.manager to the service
                // or use a library to handle context propagation.

                const result = await originalMethod.apply(this, args)

                await queryRunner.commitTransaction()
                return result
            } catch (err) {
                await queryRunner.rollbackTransaction()
                throw err
            } finally {
                await queryRunner.release()
            }
        }
    }
}
