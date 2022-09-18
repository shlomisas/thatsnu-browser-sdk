import {INPUT_DOM_ATTRIBUTES} from '../consts';
import {IDisposable} from '../types';

let observer: MutationObserver;

class DomObserver implements IDisposable {

    observe(cb: Function) {
        observer = new MutationObserver(() => {
            cb();
        });

        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: [INPUT_DOM_ATTRIBUTES.INDICATOR_ID]
        });

        cb();
    }

    dispose() {
        if (observer) {
            observer.disconnect();
        }
    }
}

export default new DomObserver();