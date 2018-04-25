import { Element, api } from 'engine';

export default class OrderItem extends Element {
    @api orderItem;

    qtyChangeHandler(event) {
        const field = event.target.id;
        const qty = event.detail.value === '' ? 0 : parseInt(event.detail.value, 10);

        const eventDetail = {
            orderItem: this.orderItem,
            change: {
                field: field,
                oldValue: this.orderItem[field],
                newValue: qty,
            },
        };

        this.orderItem[field] = qty;

        const qtyChangeEvent = new CustomEvent('qtychange', { detail: eventDetail, bubbles: true });
        this.dispatchEvent(qtyChangeEvent);
    }

    deleteHandler() {
        const deleteEvent = new CustomEvent('delete', { detail: this.orderItem, bubbles: true });
        this.dispatchEvent(deleteEvent);
    }
}
