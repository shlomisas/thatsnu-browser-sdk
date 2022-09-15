import {ELEMENT_ATTRIBUTES} from '../consts';
import {IDisposable} from '../types';

let observer: MutationObserver;

class DomSubscriber implements IDisposable {

    subscribe(cb: Function) {
        observer = new MutationObserver(() => {
            cb();
        });

        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: [ELEMENT_ATTRIBUTES.ID]
        });

        cb();
    }

    dispose() {
        if (observer) {
            observer.disconnect();
        }
    }
}

export default new DomSubscriber();