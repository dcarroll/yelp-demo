import { Element, api, track, wire } from 'engine';

const fields = [
    'Order_Item__c.Id',
    'Order_Item__c.Qty_S__c',
    'Order_Item__c.Qty_M__c',
    'Order_Item__c.Qty_L__c',
    'Order_Item__c.Qty_XL__c',
    'Order_Item__c.Product__r.Name',
    'Order_Item__c.Product__r.Price__c',
    'Order_Item__c.Product__r.Picture_URL__c',
];

export default class OrderItem extends Element {
    @api orderItemId;

    @track orderItem;

    @track product;

    @wire('record', { recordId: '$orderItemId', fields })
    loadProduct(error, data) {
        if (error) {
            // TODO handle error
        } else {
            this.orderItem = data.fields;
            this.product = data.fields.Product__r.value.fields;
        }
    }

    qtyChangeHandler(event) {
        const field = event.target.dataset.field;
        const qty = event.detail.value === '' ? 0 : parseInt(event.detail.value, 10);
        const eventDetail = {
            orderItem: this.orderItem,
            change: {
                field: field,
                oldValue: this.orderItem[field].value,
                newValue: qty,
            },
        };

        this.orderItem[field].value = qty;

        const qtyChangeEvent = new CustomEvent('qtychange', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: eventDetail,
        });
        this.dispatchEvent(qtyChangeEvent);
    }

    deleteHandler() {
        const deleteEvent = new CustomEvent('delete', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: this.orderItem,
        });
        this.dispatchEvent(deleteEvent);
    }
}
