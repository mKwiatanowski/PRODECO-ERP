import { test, expect, _electron as electron } from '@playwright/test';

test.describe('CRM Module E2E - Clients', () => {
    test('Should create an inactive client and open edit mode on double click', async () => {
        const electronApp = await electron.launch({
            args: ['.'],
            env: {
                ...process.env,
                VITE_DEV_SERVER_URL: 'http://localhost:5173'
            }
        });

        const window = await electronApp.firstWindow();

        window.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
        window.on('pageerror', error => console.error('BROWSER ERROR:', error));

        try {
            console.log('Waiting for sidebar...');
            await window.waitForSelector('a:has-text("Klienci")', { timeout: 10000 });
            await window.click('a:has-text("Klienci")');

            console.log('Waiting for Clients page...');
            await window.waitForSelector('h1:has-text("Klienci")', { timeout: 10000 });

            console.log('Opening Add Client Modal...');
            await window.click('button:has-text("Dodaj Klienta")');

            console.log('Waiting for Modal...');
            await window.waitForSelector('text=Nowy Klient', { timeout: 10000 });

            console.log('Filling form data...');
            const uniqueName = `Test E2E Inactive Client ${Date.now()}`;
            await window.locator('input[title="Nazwa"]').fill(uniqueName);
            await window.locator('input[title="NIP"]').fill('1234567890');
            await window.locator('input[title="Telefon"]').fill('555-123-456');

            // Toggle active status to inactive
            console.log('Toggling active status...');
            await window.click('button[role="switch"]');

            console.log('Submitting form...');
            await window.click('button:has-text("Zapisz Klienta")');

            // Wait for modal to close
            await window.waitForSelector('text=Nowy Klient', { state: 'hidden', timeout: 5000 });

            // Search for the newly created client
            console.log('Searching for the new client...');
            await window.locator('input[placeholder="Szukaj klienta po nazwie, NIP lub telefonie..."]').fill(uniqueName);

            // Wait for list to filter
            await window.waitForTimeout(500); // Give React time to filter

            console.log('Finding row and double clicking...');
            // Inactive clients have line-through text. Find row by name.
            const row = window.locator('tr:has-text("' + uniqueName + '")').first();
            await expect(row).toBeVisible();

            // Double click to open edit mode
            await row.dblclick();

            console.log('Waiting for Edit Modal...');
            await window.waitForSelector('text=Edycja Klienta', { timeout: 10000 });

            // Verify input data in Edit mode
            console.log('Verifying Edit form data...');
            const editName = await window.locator('input[title="Nazwa"]').inputValue();
            expect(editName).toBe(uniqueName);

            console.log('Success! Test passed.');

        } catch (e) {
            console.error('Test failed:', e);
            await window.screenshot({ path: 'e2e-screenshots/error-crm.png' });
            throw e;
        } finally {
            await electronApp.close();
        }
    });
});
