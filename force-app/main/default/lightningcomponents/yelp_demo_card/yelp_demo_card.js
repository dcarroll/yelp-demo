import { Element, api } from 'engine';

export default class YelpDemoCard extends Element {
    @api foundItem = {};

    itemSelected() {
        const evt = new CustomEvent('itemselected', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: this.foundItem,
        });
        this.dispatchEvent(evt);
    }

    handleFireMyToast() {
        const eventName = 'notification';
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: { message: 'See you on the other side.' },
        });
        this.dispatchEvent(event);
    }
}
