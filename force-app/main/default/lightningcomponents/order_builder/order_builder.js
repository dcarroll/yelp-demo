import { Element, api, track, wire } from 'engine';
import { createRecord } from 'lightning-lds-records';
import { createRecordInputFromRecord } from 'lightning-lds-records';

export default class OrderBuilder extends Element {
    @api orderId;

    @track orderItems = [];

    @track orderTotal = 0;

    @track totalItems = 0;

    @wire('record-create-defaults', { apiName: 'Order_Item__c' })
    defaults;

    dropHandler(event) {
        event.preventDefault();
        const product = JSON.parse(event.dataTransfer.getData('product'));
        const recordInput = createRecordInputFromRecord(this.defaults.data.record);
        const overrides = {
            fields: {
                Order__c: this.orderId,
                Product__c: product.Id,
            },
        };
        const record = Object.assign(recordInput, overrides);
        createRecord(record)
            .then(newRecord => {
                this.orderItems = [...this.orderItems, newRecord];
                const orderItem = newRecord.fields;
                const orderItemQty =
                    orderItem.Qty_S__c.value +
                    orderItem.Qty_M__c.value +
                    orderItem.Qty_L__c.value +
                    orderItem.Qty_XL__c.value;
                this.totalItems = this.totalItems + orderItemQty;
                this.orderTotal = this.orderTotal + orderItemQty * product.Price__c;
            })
            .catch((/*error*/) => {
                // TODO handle error
            });
    }

    dragOverHandler(event) {
        event.preventDefault();
    }

    qtyChangeHandler(event) {
        const product = event.detail.orderItem.Product__r.value.fields;
        const change = event.detail.change;
        this.totalItems = this.totalItems - change.oldValue + change.newValue;
        this.orderTotal = this.orderTotal + (change.newValue - change.oldValue) * product.Price__c.value;
    }

    deleteHandler(event) {
        const orderItem = event.detail;
        const product = orderItem.Product__r.value.fields;
        const orderItemQty =
            orderItem.Qty_S__c.value + orderItem.Qty_M__c.value + orderItem.Qty_L__c.value + orderItem.Qty_XL__c.value;
        this.totalItems = this.totalItems - orderItemQty;
        this.orderTotal = this.orderTotal - orderItemQty * product.Price__c.value;
        this.orderItems = this.orderItems.filter(item => item.id !== orderItem.Id.value);
    }
}
