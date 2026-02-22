import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ClientService } from './client.service'

describe('ClientService', () => {
    let service: ClientService
    let mockRepository: any
    let mockDataSource: any

    beforeEach(() => {
        mockRepository = {
            save: vi.fn(),
            find: vi.fn()
        }

        mockDataSource = {
            getRepository: vi.fn().mockReturnValue(mockRepository)
        }

        service = new ClientService(mockDataSource)
    })

    it('should create client and save it to repository', async () => {
        const dto = {
            name: 'Jan Kowalski',
            nip: '1234567890',
            phone: '123123123',
            address: 'Warszawa',
            type: 'CUSTOMER'
        }

        mockRepository.save.mockResolvedValueOnce({ id: '1', ...dto, createdAt: new Date(), updatedAt: new Date() })

        const result = await service.createClient(dto)

        expect(mockDataSource.getRepository).toHaveBeenCalledWith(expect.anything())
        expect(mockRepository.save).toHaveBeenCalledTimes(1)
        expect(result.id).toBeDefined()
        expect(result.name).toBe('Jan Kowalski')
    })

    it('should retrieve all clients sorted by createdAt', async () => {
        mockRepository.find.mockResolvedValueOnce([{ id: '1' }, { id: '2' }])

        const result = await service.getClients()

        expect(mockRepository.find).toHaveBeenCalledWith({
            order: {
                createdAt: 'DESC'
            }
        })
        expect(result).toHaveLength(2)
    })
})
