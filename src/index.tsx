import { app, ipcMain, IpcMainEvent } from 'electron';
import { BrowserComponent } from './components/browser.component';

import './index.css';

app.on('ready', () => {
    new BrowserComponent(app);
    ipcMain.on('notifications', (event: IpcMainEvent) => {
        // TODO: on notification
        //window.notification();
        event.sender.send('notification:new', true);
    });
});