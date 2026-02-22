
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dist-electron/entry.js');

if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
}

console.log(`🧹 Cleaning up ${filePath}...`);
let content = fs.readFileSync(filePath, 'utf8');

const forbiddenDrivers = [
    '@google-cloud/spanner',
    '@sap/hana-client',
    'mongodb',
    'mssql',
    'mysql',
    'mysql2',
    'oracledb',
    'pg',
    'pg-native',
    'pg-query-stream',
    'redis',
    'ioredis',
    'better-sqlite3',
    'hdb-pool',
    'sql.js',
    'react-native-sqlite-storage',
    'typeorm-aurora-data-api-driver',
    'expo-sqlite'
];

let replacementCount = 0;

forbiddenDrivers.forEach(driver => {
    // Regex to match explicitly require("driver") or require('driver')
    // We replace it with null to make it: return null
    // TypeORM usually does: return require("driver")
    const regex = new RegExp(`require\\(["']${driver}["']\\)`, 'g');
    if (regex.test(content)) {
        content = content.replace(regex, 'null');
        console.log(`   - Removed reference to: ${driver}`);
        replacementCount++;
    }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Cleanup complete. Removed ${replacementCount} references.`);
