import App from './app';
import domSubscriber from './utils/domObserver';
import {AppParams, ThatsnuSdk} from './types';

declare var window: {
    onThatsnuLoaded: Function,
    scrollX: number,
    scrollY: number,
    thasnuInitialized: boolean
};

let app: App;

const sdk: ThatsnuSdk = {
    async init(params?: AppParams): Promise<void> {

        if (window.thasnuInitialized) return;
        window.thasnuInitialized = true;

        app = new App(params);

        domSubscriber.observe(() => {
            app.generate();
        });
    },
    getState(): Array<string> {
        return app.getState();
    },
    resetState() {
          app.resetState();
    },
    dispose() {
        app.dispose();
        domSubscriber.dispose();
        app = null;
        delete window.thasnuInitialized;
    }
};

if (typeof window?.onThatsnuLoaded === 'function') {
    window?.onThatsnuLoaded(sdk);
}

export default sdk;