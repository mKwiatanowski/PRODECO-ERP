import { test, expect, _electron as electron } from '@playwright/test';

test.describe('Modal UI Freeze Regression', () => {
    test('Should allow typing in the Finance Modal without freezing', async () => {
        // Launch Electron app using Playwright
        const electronApp = await electron.launch({
            args: ['.'],
            env: {
                ...process.env,
                VITE_DEV_SERVER_URL: 'http://localhost:5173'
            }
        });

        // Get the main window
        const window = await electronApp.firstWindow();

        window.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
        window.on('pageerror', error => console.error('BROWSER ERROR:', error));

        try {
            console.log('Waiting for sidebar...');
            await window.waitForSelector('a:has-text("Finanse")', { timeout: 10000 });
            await window.screenshot({ path: 'e2e-screenshots/1-sidebar.png' });

            console.log('Navigating to Finance tab...');
            await window.click('a:has-text("Finanse")');

            console.log('Waiting for Finance page...');
            await window.waitForSelector('h1:has-text("Finanse")', { timeout: 10000 });
            await window.screenshot({ path: 'e2e-screenshots/2-finance.png' });

            console.log('Opening Modal...');
            await window.click('button:has-text("Dodaj Fakturę")');

            console.log('Waiting for Modal...');
            await window.waitForSelector('text=Nowa Faktura Zakupu', { timeout: 10000 });
            await window.screenshot({ path: 'e2e-screenshots/3-modal.png' });

            console.log('Attempting to fill the input field...');
            const inputLocator = window.locator('input[title="Podaj numer faktury z dokumentu"]');

            // This action demands that the element is actionable (visible, stable, capable of receiving events)
            await inputLocator.fill('FV-TEST-1234', { timeout: 5000 });

            // Verify value
            const val = await inputLocator.inputValue();
            expect(val).toBe('FV-TEST-1234');
            console.log('Success! Input is actionable.');
        } catch (e) {
            console.error('Test failed:', e);
            await window.screenshot({ path: 'e2e-screenshots/error.png' });
            throw e;
        } finally {
            await electronApp.close();
        }
    });
});
