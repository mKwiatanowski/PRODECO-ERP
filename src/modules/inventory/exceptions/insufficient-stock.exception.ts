export class InsufficientStockException extends Error {
    constructor(productId: string, required: number, available: number) {
        const missing = required - available;
        super(
            `Insufficient stock for product ${productId}. ` +
            `Required: ${required}, Available: ${available}, Missing: ${missing}`
        );
        this.name = "InsufficientStockException";
    }
}
