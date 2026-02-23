const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// We can't easily import the AppDataSource TS file in a clean JS script without build
// But we can simulate the logic from data-source.ts
app.whenReady().then(() => {
    const userData = app.getPath('userData');
    const dbName = 'green_manager.sqlite';
    const dbPath = path.join(userData, dbName);

    console.log('--- DIAGNOSTYKA ŚCIEŻEK ---');
    console.log('Nazwa aplikacji:', app.getName());
    console.log('UserData:', userData);
    console.log('Przewidywana ścieżka DB:', dbPath);
    console.log('Czy plik istnieje:', fs.existsSync(dbPath));

    // Sprawdźmy też folder 'PRODECO' jeśli nazwa aplikacji jest inna
    const customPath = path.join(path.dirname(userData), 'PRODECO', dbName);
    console.log('Alternatywna ścieżka (PRODECO):', customPath);
    console.log('Czy plik istnieje:', fs.existsSync(customPath));

    // Sprawdźmy folder projektu
    const projectDb = path.join(__dirname, 'green_manager_dev.sqlite');
    console.log('Ścieżka deweloperska:', projectDb);
    console.log('Czy plik istnieje:', fs.existsSync(projectDb));

    app.quit();
});
