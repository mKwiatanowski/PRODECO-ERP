import { AppDataSource } from './src/core/db/data-source';

async function test() {
    try {
        await AppDataSource.initialize();
        console.log("DB INITIALIZATION SUCCESSFUL");
    } catch (e: any) {
        console.error("DB INITIALIZATION FAILED:", e.message);
    }
}
test();
