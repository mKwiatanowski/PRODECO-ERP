export { };

declare global {
    interface Window {
        electron: {
            // IPC Methods
            getInventory: () => Promise<any[]>;
            addStock: (data: any) => Promise<any>;
            getInventoryValue: () => Promise<number>;
            createProject: (data: any) => Promise<any>;
            createInvoice: (data: any) => Promise<any>;

            // Window Controls
            minimize: () => void;
            maximize: () => void;
            close: () => void;
        };
    }
}
