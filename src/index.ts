import App from './app';
import domSubscriber from './utils/domSubscriber';
import {AppParams} from './types';
import helper from './utils/helper';

declare var window: {
    onWhatsNewLoaded: Function,
    scrollX: number,
    scrollY: number
};

let app: App;

const SDK = {
    async init(params: AppParams): Promise<void> {
        app = new App(params);

        domSubscriber.subscribe(() => {
            app.generate();
        });
    },
    generateId(group: string, identifier?: { [key: string]: any } | string) {
        if (!group) {
            throw new Error('Invalid group');
        }

        if (!identifier) return group;
        const hash = helper.getSha1(typeof identifier === 'object' ? JSON.stringify(identifier) : identifier);
        return `${group}.${hash}`;
    },
    getUserState(): Array<string> {
        return app.getUserState();
    },
    dispose() {
        app.dispose();
        domSubscriber.dispose();
        app = null;
    }
};

if (typeof window?.onWhatsNewLoaded === 'function') {
    window?.onWhatsNewLoaded(SDK);
}

export default SDK;