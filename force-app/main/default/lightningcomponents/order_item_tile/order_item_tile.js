import { Element, api, track } from 'engine';

export default class OrderItemTile extends Element {
    /** Id of Order_Item__c to display. */
    @api recordId;

    /** Values of the Order_Item__c to display/edit. */
    @api pictureUrl;
    @api name;
    @api msrp;
    @api price;
    @api quantitySmall;
    @api quantityMedium;
    @api quantityLarge;

    /** Whether the component has unsaved changes. */
    @track isModified = false;

    /** Mutated/unsaved Order_Item__c values. */
    form = {};

    /** Handles form input. */
    handleChange(evt) {
        this.isModified = true;
        const field = evt.target.dataset.fieldName;
        let value = parseInt(evt.detail.value.trim(), 10);
        if (!Number.isInteger(value)) {
            value = 0;
        }
        this.form[field] = value;
    }

    saveOrderItem() {
        const event = new CustomEvent('orderitemchange', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: Object.assign({}, { Id: this.recordId }, this.form),
        });
        this.dispatchEvent(event);
        this.isModified = false;
    }

    deleteOrderItem() {
        const event = new CustomEvent('orderitemdelete', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: { Id: this.recordId },
        });
        this.dispatchEvent(event);
    }
}
