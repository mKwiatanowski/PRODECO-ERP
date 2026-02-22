import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        electron([
            {
                // Main-Process entry file of the Electron App.
                entry: 'electron/entry.ts',
                vite: {
                    build: {
                        rollupOptions: {
                            external: [
                                'sqlite3',
                                'typeorm',
                                'mock-aws-s3',
                                'aws-sdk',
                                'nock',
                                'testcontainers',
                                'better-sqlite3',
                                'hdb-pool',
                                'ioredis',
                                'mongodb',
                                'mssql',
                                'mysql',
                                'mysql2',
                                'oracledb',
                                'pg',
                                'pg-native',
                                'pg-query-stream',
                                'redis',
                                'sql.js',
                                'typeorm-aurora-data-api-driver',
                                '@google-cloud/spanner',
                                '@sap/hana-client',
                                'react-native-sqlite-storage',
                                'expo-sqlite',
                            ],
                        },
                    },
                    resolve: {
                        alias: [
                            { find: /^@google-cloud\/spanner.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^@sap\/hana-client.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^mongodb.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^mssql.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^mysql.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^mysql2.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^oracledb.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^pg.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^redis.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^ioredis.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^hdb-pool.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^sql\.js.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^react-native-sqlite-storage.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^typeorm-aurora-data-api-driver.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                            { find: /^expo-sqlite.*$/, replacement: path.resolve(__dirname, 'src/core/utils/mock-db-driver.js') },
                        ]
                    }
                },
            },
            {
                entry: 'electron/preload.ts',
                onstart(options) {
                    options.reload()
                },
            },
        ]),
        renderer(),
    ],
    resolve: {
        alias: {
            '@core': path.resolve(__dirname, './src/core'),
            '@modules': path.resolve(__dirname, './src/modules'),
            '@ui': path.resolve(__dirname, './src/ui'),
        },
    },
    base: './', // For Electron to find assets
})
