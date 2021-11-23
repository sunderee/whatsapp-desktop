import { app, ipcMain, IpcMainEvent, protocol } from 'electron';
import { BrowserComponent } from './components/browser.component';

process.title = 'WhatsApp Desktop';
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'events',
        privileges: {
            bypassCSP: true,
            supportFetchAPI: true
        },
    }
]);

app.on('ready', () => {
    new BrowserComponent(app);
    ipcMain.on('notifications', (event: IpcMainEvent) => {
        // TODO: on notification
        //window.notification();
        event.sender.send('notification:new', true);
    });
});