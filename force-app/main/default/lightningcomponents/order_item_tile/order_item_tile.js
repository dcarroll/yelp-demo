import { Element, api, track, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';

const fields = [
    'Order_Item__c.Id',
    'Order_Item__c.Product__r.Name',
    'Order_Item__c.Product__r.MSRP__c',
    'Order_Item__c.Product__r.Picture_URL__c',
];

export default class OrderItemTile extends Element {
    @api recordId;
    @track product;
    @track isModified = false;

    originalValues;

    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.product = data.fields.Product__r.value;
        }
    }

    inputChangeHandler() {
        this.isModified = true;
    }

    deleteHandler() {
        const orderItemDeleteEvent = new CustomEvent('orderitemdelete', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: this.originalValues,
        });
        this.dispatchEvent(orderItemDeleteEvent);
    }

    formLoadHandler(event) {
        this.originalValues = event.detail.records[this.recordId].fields;
    }

    formSuccessHandler(event) {
        const newValues = event.detail.fields;
        const eventDetail = {
            recordId: this.recordId,
            originalValues: {
                price: this.originalValues.Price__c.value,
                qty:
                    this.originalValues.Qty_S__c.value +
                    this.originalValues.Qty_M__c.value +
                    this.originalValues.Qty_L__c.value,
            },
            newValues: {
                price: newValues.Price__c.value,
                qty: newValues.Qty_S__c.value + newValues.Qty_M__c.value + newValues.Qty_L__c.value,
            },
        };
        const orderItemChangeEvent = new CustomEvent('orderitemchange', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: eventDetail,
        });
        this.dispatchEvent(orderItemChangeEvent);
        this.isModified = false;
    }
}
