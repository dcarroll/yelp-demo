import { Element, api, track } from 'engine';

/** Util to extract field values from SObjects. */
import { getSObjectFieldValue } from 'c-utils';

/** Order_Item__c Schema. */
import PRODUCT_PICTURE_URL_FIELD from '@salesforce/schema/Order_Item__c.Product__r.Picture_URL__c';
import PRODUCT_NAME_FIELD from '@salesforce/schema/Order_Item__c.Product__r.Name';
import PRODUCT_MSRP_FIELD from '@salesforce/schema/Order_Item__c.Product__r.MSRP__c';
import PRICE_FIELD from '@salesforce/schema/Order_Item__c.Price__c';
import QTY_SMALL_FIELD from '@salesforce/schema/Order_Item__c.Qty_S__c';
import QTY_MEDIUM_FIELD from '@salesforce/schema/Order_Item__c.Qty_M__c';
import QTY_LARGE_FIELD from '@salesforce/schema/Order_Item__c.Qty_L__c';

/**
 * Displays a Order_Item__c SObject.
 */
export default class OrderItemTile extends Element {
    _orderItemSobject;
    /** Order_Item__c SObject to display. */
    @api
    set orderItemSobject(value) {
        this._orderItemSobject = value;
        this.pictureUrl = getSObjectFieldValue(value, PRODUCT_PICTURE_URL_FIELD);
        this.name = getSObjectFieldValue(value, PRODUCT_NAME_FIELD);
        this.msrp = getSObjectFieldValue(value, PRODUCT_MSRP_FIELD);
        this.price = getSObjectFieldValue(value, PRICE_FIELD);
        this.quantitySmall = getSObjectFieldValue(value, QTY_SMALL_FIELD);
        this.quantityMedium = getSObjectFieldValue(value, QTY_MEDIUM_FIELD);
        this.quantityLarge = getSObjectFieldValue(value, QTY_LARGE_FIELD);
    }
    get orderItemSobject() {
        return this._orderItemSobject;
    }

    /** Order_Item__c SObject field values to display. */
    @track id;
    @track pictureUrl;
    @track name;
    @track msrp;
    @track price;
    @track quantitySmall;
    @track quantityMedium;
    @track quantityLarge;

    /** Whether the component has unsaved changes. */
    @track isModified = false;

    /** Mutated/unsaved Order_Item__c values. */
    form = {};

    /** Handles form input. */
    formChangeHandler(evt) {
        this.isModified = true;
        const field = evt.target.dataset.fieldName;
        let value = parseInt(evt.detail.value.trim(), 10);
        if (!Number.isInteger(value)) {
            value = 0;
        }
        this.form[field] = value;
    }

    /** Fires event to update the Order_Item__c SObject.  */
    saveOrderItem() {
        const event = new CustomEvent('orderitemchange', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: Object.assign({}, { id: this.orderItemSobject.Id }, this.form),
        });
        this.dispatchEvent(event);
        this.isModified = false;
    }

    /** Fires event to delete the Order_Item__c SObject.  */
    deleteOrderItem() {
        const event = new CustomEvent('orderitemdelete', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: { id: this.orderItemSobject.Id },
        });
        this.dispatchEvent(event);
    }
}
