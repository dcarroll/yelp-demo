import { Element, api, track, wire } from 'engine';
import { getRecordCreateDefaults, createRecord, createRecordInputFromRecord } from 'lightning-ui-api-record';

export default class OrderBuilder extends Element {
    @api orderId;

    @track orderItems = [];

    @track orderTotalAmount = 0;

    @track orderTotalQty = 0;

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
                Price__c: Math.round(product.MSRP__c * 0.6), // TODO: get discount from Account object
            },
        };
        Object.assign(recordInput, overrides);
        createRecord(recordInput)
            .then(newRecord => {
                this.orderItems = [...this.orderItems, newRecord];
                const orderItem = newRecord.fields;
                const orderItemQty = orderItem.Qty_S__c.value + orderItem.Qty_M__c.value + orderItem.Qty_L__c.value;
                this.orderTotalQty = this.orderTotalQty + orderItemQty;
                this.orderTotalAmount = this.orderTotalAmount + orderItemQty * orderItem.Price__c.value;
            })
            .catch((/*error*/) => {
                // TODO handle error
            });
    }

    dragOverHandler(event) {
        event.preventDefault();
    }

    orderItemChangeHandler(event) {
        const originalValues = event.detail.originalValues;
        const newValues = event.detail.newValues;
        this.orderTotalQty = this.orderTotalQty + newValues.qty - originalValues.qty;
        this.orderTotalAmount =
            this.orderTotalAmount + newValues.qty * newValues.price - originalValues.qty * originalValues.price;
    }

    orderItemDeleteHandler(event) {
        const orderItem = event.detail;
        const orderItemQty = orderItem.Qty_S__c.value + orderItem.Qty_M__c.value + orderItem.Qty_L__c.value;
        this.orderTotalQty = this.orderTotalQty - orderItemQty;
        this.orderTotalAmount = this.orderTotalAmount - orderItemQty * orderItem.Price__c.value;
        this.orderItems = this.orderItems.filter(item => item.id !== orderItem.Id.value);
    }
}
