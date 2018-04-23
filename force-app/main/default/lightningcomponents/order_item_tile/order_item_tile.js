import { Element, api } from 'engine';

export default class OrderItem extends Element {

    @api orderitem;

    @api qtyS;

    @api qtyM;

    @api qtyL;

    @api qtyXL;

    qtyChangeHandler(event) {

    }

}
