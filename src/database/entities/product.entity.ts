import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../core/base.entity"

export enum ProductType {
    TOWAR = "TOWAR",
    USLUGA = "USLUGA"
}

@Entity("products")
export class Product extends BaseEntity {
    @Column({ type: "varchar" })
    name: string

    @Column({
        type: "simple-enum",
        enum: ProductType,
        default: ProductType.TOWAR
    })
    type: ProductType

    @Column({ type: "varchar", nullable: true })
    gtuCode: string // np. GTU_06

    @Column({ type: "varchar" })
    vatRate: string // np. 23%, 8%, zw

    @Column({ type: "varchar" })
    unit: string // np. szt, kpl, rbocz-godz

    @Column({ type: "boolean", default: true })
    isActive: boolean
}
