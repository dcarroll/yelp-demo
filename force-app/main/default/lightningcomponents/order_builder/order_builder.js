import { Element, track, wire, api } from 'engine';
import { getRecordCreateDefaults, createRecord, createRecordInputFromRecord } from 'lightning-ui-api-record';
import assets from '@salesforce/resource-url/bike_assets';
import getOrderItems from '@salesforce/apex/OrderController.getOrderItems';
import deleteOrderItem from '@salesforce/apex/OrderController.deleteOrderItem';
import OrderItemObject from '@salesforce/schema/Order_Item__c';

export default class OrderBuilder extends Element {
    @api recordId;

    @wire(getOrderItems, { orderId: '$recordId' })
    wiredOrderItems({ data, error }) {
        if (error) {
            //TODO: implement error handling
        } else if (data) {
            this.orderItems = data;
            this.orderItems.forEach(orderItem => {
                const orderItemQty = orderItem.Qty_S__c + orderItem.Qty_M__c + orderItem.Qty_L__c;
                this.orderTotalQty = this.orderTotalQty + orderItemQty;
                this.orderTotalAmount = this.orderTotalAmount + orderItemQty * orderItem.Price__c;
            });
        }
    }

    @track orderItems = [];

    @track orderTotalAmount = 0;

    @track orderTotalQty = 0;

    @track logo = assets + '/logo.svg';

    // TODO - W-4907339 apiName will be renamed to objectApiName
    @wire(getRecordCreateDefaults, { apiName: OrderItemObject.objectApiName })
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
                this.orderItems = [...this.orderItems, { Id: newRecord.id }];
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
        deleteOrderItem({ orderItemId: orderItem.Id.value })
            .then(() => {
                this.orderItems = this.orderItems.filter(item => item.Id !== orderItem.Id.value);
            })
            .catch((/*error*/) => {
                //TODO: implement error handling
            });
    }

    get isEmpty() {
        return this.orderItems.length === 0;
    }
}
