import "reflect-metadata";
import { AppDataSource } from "../core/db/data-source";
import { Product } from "../database/entities/product.entity";
import { InventoryDocument } from "../modules/inventory/domain/inventory-document.entity";

async function verify() {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized.");

        const product = await AppDataSource.manager.findOne(Product, {
            where: { name: "Kosiarka Spalinowa TEST" }
        });

        if (product) {
            console.log("SUCCESS: Product found in database:");
            console.log(JSON.stringify(product, null, 2));

            const docs = await AppDataSource.manager.find(InventoryDocument, {
                relations: ["items"],
                order: { createdAt: "DESC" }
            });

            const pzDocs = docs.filter(d => d.items.some(i => i.productId === product.id));
            if (pzDocs.length > 0) {
                console.log(`SUCCESS: Found ${pzDocs.length} PZ documents for this product.`);
                pzDocs.forEach(d => {
                    console.log(`- Doc Number: ${d.documentNumber}, Date: ${d.date}`);
                });
            } else {
                console.log("FAILURE: No PZ documents found for this product.");
            }
        } else {
            console.log("FAILURE: Product 'Kosiarka Spalinowa TEST' not found in database.");
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error during verification:", error);
    }
}

verify();
