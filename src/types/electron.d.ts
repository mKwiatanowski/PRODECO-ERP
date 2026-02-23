import { IElectronAPI } from '../api/api';

export { };

declare global {
    interface Window {
        electron: IElectronAPI;
    }
}
