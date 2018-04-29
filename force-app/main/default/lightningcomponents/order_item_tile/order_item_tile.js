import { Element, api, track, wire } from 'engine';
import {
    getRecord,
    updateRecord,
    createRecordInputFromRecord,
    createRecordInputFilteredByEditedFields,
} from 'lightning-ui-api-record';

const fields = [
    'Order_Item__c.Id',
    'Order_Item__c.Qty_S__c',
    'Order_Item__c.Qty_M__c',
    'Order_Item__c.Qty_L__c',
    'Order_Item__c.Price__c',
    'Order_Item__c.Product__r.Name',
    'Order_Item__c.Product__r.MSRP__c',
    'Order_Item__c.Product__r.Picture_URL__c',
];

export default class OrderItemTile extends Element {
    @api recordId;
    @track orderItem;
    @track product;
    @track isModified = false;

    overrides = {
        fields: {},
    };

    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.orderItem = data;
            this.product = data.fields.Product__r.value;
        }
    }

    qtyChangeHandler(event) {
        this.isModified = true;
        const field = event.target.dataset.field;
        const qty = event.detail.value === '' ? 0 : parseInt(event.detail.value, 10);
        this.overrides.fields[field] = qty;
    }

    deleteHandler() {
        const orderItemDeleteEvent = new CustomEvent('orderitemdelete', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: this.orderItem,
        });
        this.dispatchEvent(orderItemDeleteEvent);
    }

    saveHandler() {
        const recordInput = createRecordInputFromRecord(this.orderItem);
        const mergedRecordInput = Object.assign({}, recordInput, this.overrides);
        const filteredRecordInput = createRecordInputFilteredByEditedFields(mergedRecordInput, this.orderItem);
        updateRecord(filteredRecordInput)
            .then(() => {
                const eventDetail = {
                    orderItem: this.orderItem,
                    recordInput: recordInput,
                    overrides: Object.assign({}, this.overrides),
                };
                const orderItemChangeEvent = new CustomEvent('orderitemchange', {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: eventDetail,
                });
                this.dispatchEvent(orderItemChangeEvent);
                this.overrides = { fields: {} };
                this.isModified = false;
            })
            .catch(err => {
                this.updateStatus = 'Order item record update failed. ' + err;
            });
    }
}
