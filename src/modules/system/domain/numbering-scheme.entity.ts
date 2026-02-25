import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"

@Entity("numbering_schemes")
export class NumberingScheme extends BaseEntity {
    @Column({ type: "varchar" })
    target: string // e.g. 'CLIENT', 'INVOICE'

    @Column({ type: "varchar", nullable: true })
    prefix: string

    @Column({ type: "varchar" })
    mask: string // e.g. "[PREFIX]/[YYYY]/[NR]"

    @Column({ type: "boolean", default: false })
    isDefault: boolean
}
