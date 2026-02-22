import { DataSource } from "typeorm"
import { Client } from "./domain/client.entity"

export class ClientService {
    constructor(private dataSource: DataSource) { }

    async createClient(dto: { name: string, nip?: string, phone?: string, address?: string, type: string, isActive?: boolean }): Promise<Client> {
        const client = new Client()
        client.name = dto.name
        client.nip = dto.nip || ''
        client.phone = dto.phone || ''
        client.address = dto.address || ''
        client.type = dto.type
        if (dto.isActive !== undefined) {
            client.isActive = dto.isActive
        }

        return await this.dataSource.getRepository(Client).save(client)
    }

    async updateClient(id: string, dto: { name: string, nip?: string, phone?: string, address?: string, type: string, isActive: boolean }): Promise<Client> {
        const repo = this.dataSource.getRepository(Client);
        const client = await repo.findOneByOrFail({ id });

        client.name = dto.name;
        client.nip = dto.nip || '';
        client.phone = dto.phone || '';
        client.address = dto.address || '';
        client.type = dto.type;
        client.isActive = dto.isActive;

        return await repo.save(client);
    }

    async getClients(): Promise<Client[]> {
        return await this.dataSource.getRepository(Client).find({
            order: {
                createdAt: 'DESC'
            }
        })
    }
}
