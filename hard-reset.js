const fs = require('fs');
const path = require('path');
const os = require('os');

const paths = [
    path.join(os.homedir(), 'AppData', 'Roaming', 'green-manager-erp', 'green_manager.sqlite'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'Electron', 'green_manager.sqlite'),
    path.join(__dirname, 'green_manager_dev.sqlite'),
    path.join(__dirname, '..', 'green_manager_dev.sqlite')
];

for (const p of paths) {
    console.log('Checking:', p);
    if (fs.existsSync(p)) {
        try {
            fs.unlinkSync(p);
            console.log('SUCCESS: Deleted', p);
        } catch (err) {
            console.error('FAILED to delete', p, err.message);
        }
    } else {
        console.log('Not found:', p);
    }
}
