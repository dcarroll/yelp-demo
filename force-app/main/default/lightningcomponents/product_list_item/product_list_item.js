import { Element, api } from 'engine';

export default class ProductListItem extends Element {

    @api product;

    dragStart(event) {
        event.dataTransfer.setData("product", JSON.stringify(this.product));
    }

}
