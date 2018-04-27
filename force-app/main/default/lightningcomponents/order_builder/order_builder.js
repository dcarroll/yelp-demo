import { Element, api, track, wire } from 'engine';
import { getRecordCreateDefaults, createRecord, createRecordInputFromRecord } from 'lightning-ui-api-record';

export default class OrderBuilder extends Element {
    @api orderId;

    @track orderItems = [];

    @track orderTotal = 0;

    @track totalItems = 0;

    @wire(getRecordCreateDefaults, { apiName: 'Order_Item__c' })
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
        Object.assign(recordInput, overrides);
        createRecord(recordInput)
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

    orderItemChangeHandler(event) {
        const originalFields = event.detail.recordInput.fields;
        const changedFields = event.detail.overrides.fields;
        let countDiff = 0;
        let amountDiff = 0;
        Object.keys(changedFields).forEach(fieldName => {
            countDiff = countDiff + changedFields[fieldName] - originalFields[fieldName];
            amountDiff =
                amountDiff +
                (changedFields[fieldName] - originalFields[fieldName]) *
                    event.detail.orderItem.fields.Product__r.value.fields.Price__c.value;
        });
        this.totalItems = this.totalItems + countDiff;
        this.orderTotal = this.orderTotal + amountDiff;
    }

    orderItemDeleteHandler(event) {
        const orderItem = event.detail;
        const product = orderItem.Product__r.value.fields;
        const orderItemQty =
            orderItem.Qty_S__c.value + orderItem.Qty_M__c.value + orderItem.Qty_L__c.value + orderItem.Qty_XL__c.value;
        this.totalItems = this.totalItems - orderItemQty;
        this.orderTotal = this.orderTotal - orderItemQty * product.Price__c.value;
        this.orderItems = this.orderItems.filter(item => item.id !== orderItem.Id.value);
    }
}
