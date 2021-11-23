import {
    App,
    BeforeSendResponse,
    BrowserWindow,
    HeadersReceivedResponse,
    Menu,
    OnBeforeSendHeadersListenerDetails,
    OnHeadersReceivedListenerDetails,
    protocol,
    ProtocolRequest,
    ProtocolResponse,
    shell
} from 'electron';
import EventEmitter from 'events';

export class BrowserComponent extends EventEmitter {
    private window?: BrowserWindow;

    constructor(private readonly app: App) {
        super();
        this.initialize();
        this.initializeEvents();
        this.loadURL();
        this.createMenu();
    }

    private initialize(): void {
        this.window = new BrowserWindow({
            show: true,
            webPreferences: {
                plugins: true,
                spellcheck: true,
                sandbox: false
            }
        });

        this.loadURL();
    }

    private loadURL(): void {
        this.window?.webContents.session.webRequest.onBeforeSendHeaders(
            {
                urls: ['https://web.whatsapp.com/*']
            },
            (
                details: OnBeforeSendHeadersListenerDetails,
                callback: (beforeSendResponse: BeforeSendResponse) => void
            ) => {
                details.requestHeaders['User-Agent'] = this.getNewUserAgent() ?? '';
                callback({ requestHeaders: details.requestHeaders });
            }
        );

        this.window?.webContents.setUserAgent(this.getNewUserAgent() ?? '');
        this.window?.loadURL('https://web.whatsapp.com/', {
            userAgent: this.getNewUserAgent() ?? ''
        });

        this.window?.webContents.session.webRequest.onHeadersReceived(
            { urls: ['https://web.whatsapp.com/*'] },
            (
                details: OnHeadersReceivedListenerDetails,
                callback: (headersReceivedResponse: HeadersReceivedResponse) => void
            ) => {
                if (details.responseHeaders !== undefined) {
                    delete details.responseHeaders['content-security-policy-report-only'];
                    delete details.responseHeaders['content-security-policy'];
                }

                callback({
                    cancel: false,
                    responseHeaders: details.responseHeaders ?? {} as Record<string, string[]>,
                });
            }
        );

        protocol.registerBufferProtocol(
            'events',
            async (request: ProtocolRequest, result: (response: Buffer | ProtocolResponse) => void) => {
                const url = request.url.replace('events://', '');
                const parameters = url.split('/');

                if (parameters[0] == 'notifications') {
                    // TODO: show notification
                }
                const content = Buffer.from('');
                result(content);
            }
        );
    }

    initializeEvents(): void {
        this.window?.on('page-title-updated', (event: Event, title: string) => {
            event.preventDefault();

            title = title.replace(/(\([0-9]+\) )?.*/, '$1WhatsApp-Desktop');
            this.window?.setTitle(title);
            this.emit('title-updated', title);

            if (!/\([0-9]+\)/.test(title)) {
                this.emit('clear-title');
                this.window?.flashFrame(true);
                this.emit('notification:clear');
            }
        });

        this.window?.on('close', () => {
            this.app.quit();
            process.exit(0);
        });

        this.window?.webContents.on('will-navigate', this.handleRedirect);
    }

    private createMenu(): void {
        const menu = Menu.buildFromTemplate([
            {
                label: '&Tools',
                submenu: [
                    {
                        label: 'Reload',
                        accelerator: 'CommandOrController+r',
                        click: () => {
                            this.loadURL();
                        }
                    }
                ]
            },
            {
                label: '&View',
                submenu: [
                    {
                        label: 'Zoom +',
                        accelerator: 'CommandOrControl+numadd',
                        click: () => {
                            if (this.window?.webContents.zoomLevel !== undefined) {
                                this.window.webContents.zoomLevel *= 2;
                            }
                        }
                    },
                    {
                        label: 'Zoom -',
                        accelerator: 'CommandOrControl+numadd',
                        click: () => {
                            if (this.window?.webContents.zoomLevel !== undefined) {
                                this.window.webContents.zoomLevel *= 0.5;
                            }
                        }
                    }
                ]
            }
        ]);

        this.window?.setMenu(menu);
    }

    private getNewUserAgent(): string | undefined {
        return this.window?.webContents
            .getUserAgent()
            .replace(/(Electron|whatsapp-desktop)\/([0-9.]+) /gi, '')
            .replace(/-(beta|alfa)/gi, '');
    }

    private handleRedirect(event: Event, url: string): void {
        if (!url.startsWith('https://web.whatsapp.com/')) {
            event.preventDefault();
            shell.openExternal(url);
        }
    }
}
