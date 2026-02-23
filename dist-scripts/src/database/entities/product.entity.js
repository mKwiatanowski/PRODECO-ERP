import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../core/base.entity";
export var ProductType;
(function (ProductType) {
    ProductType["TOWAR"] = "TOWAR";
    ProductType["USLUGA"] = "USLUGA";
})(ProductType || (ProductType = {}));
@Entity("products")
export class Product extends BaseEntity {
    @Column({ type: "varchar" })
    name;
    @Column({
        type: "simple-enum",
        enum: ProductType,
        default: ProductType.TOWAR
    })
    type;
    @Column({ type: "varchar", nullable: true })
    gtuCode; // np. GTU_06
    @Column({ type: "varchar" })
    vatRate; // np. 23%, 8%, zw
    @Column({ type: "varchar" })
    unit; // np. szt, kpl, rbocz-godz
    @Column({ type: "boolean", default: true })
    isActive;
}
