import App from './app';
import domSubscriber from './utils/domSubscriber';
import {AppParams, ThatsnuSdk} from './types';

declare var window: {
    onThatsnuLoaded: Function,
    scrollX: number,
    scrollY: number
};

let app: App;
let initialized: boolean;

const sdk: ThatsnuSdk = {
    async init(params?: AppParams): Promise<void> {

        if (initialized) return;
        initialized = true;

        app = new App(params);

        domSubscriber.subscribe(() => {
            app.generate();
        });
    },
    getState(): Array<string> {
        return app.getState();
    },
    dispose() {
        app.dispose();
        domSubscriber.dispose();
        app = null;
        initialized = false;
    }
};

if (typeof window?.onThatsnuLoaded === 'function') {
    window?.onThatsnuLoaded(sdk);
}

export default sdk;