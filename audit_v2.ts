import "reflect-metadata";
import { app } from "electron";
import { AppDataSource } from "./src/core/db/data-source";

app.whenReady().then(async () => {
    console.log("--- TYPEORM CONFIG AUDIT ---");
    console.log("Database Path from config:", AppDataSource.options.database);
    console.log("App Name:", app.getName());
    console.log("UserData Path:", app.getPath('userData'));

    try {
        await AppDataSource.initialize();
        console.log("Database initialized successfully.");
        const invoiceCount = await AppDataSource.getRepository("Invoice").count();
        console.log("Total Invoices in DB:", invoiceCount);

        if (invoiceCount > 0) {
            const lastInvoice = await AppDataSource.getRepository("Invoice").findOne({
                order: { createdAt: "DESC" }
            });
            console.log("Last Invoice Number:", lastInvoice.invoiceNumber);
        }
    } catch (e) {
        console.log("Init Error:", e.message);
    }
    app.quit();
});
