import { app, ipcMain, IpcMainEvent, protocol } from 'electron';
import { BrowserComponent } from './browser.component';

process.title = 'WhatsApp Desktop';
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'events',
        privileges: {
            bypassCSP: true,
            supportFetchAPI: true
        }
    }
]);

app.on('ready', () => {
    const window = new BrowserComponent(app);
    ipcMain.on('notifications', (event: IpcMainEvent) => {
        window.showNotification();
        event.sender.send('notification:new', true);
    });
});
