import { Element, api } from 'engine';
import pubsub from 'c-pubsub';

export default class ProductTile extends Element {
    @api product;

    productSelectedHandler() {
        pubsub.fire('productSelected', this.product);
    }

    dragStart(event) {
        event.dataTransfer.setData('product', JSON.stringify(this.product));
    }
}
