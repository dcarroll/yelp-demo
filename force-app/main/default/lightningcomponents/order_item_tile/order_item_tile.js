import { Element, api, track } from 'engine';
import { getSObjectFieldValue } from 'c-utils';

/** Order_Item__c Schema. */
import ProductPictureURLField from '@salesforce/schema/Order_Item__c.Product__r.Picture_URL__c';
import ProductNameField from '@salesforce/schema/Order_Item__c.Product__r.Name';
import ProductMSRPField from '@salesforce/schema/Order_Item__c.Product__r.MSRP__c';
import PriceField from '@salesforce/schema/Order_Item__c.Price__c';
import QtySmallField from '@salesforce/schema/Order_Item__c.Qty_S__c';
import QtyMediumField from '@salesforce/schema/Order_Item__c.Qty_M__c';
import QtyLargeField from '@salesforce/schema/Order_Item__c.Qty_L__c';

/**
 * Displays a Order_Item__c SObject.
 *
 * Ideally order_build would retrieve Order_Item__c[] via Lightning Data Service, in which
 * case it could provide
 */
export default class OrderItemTile extends Element {
    _orderItemSobject;
    /** Order_Item__c SObject to display. */
    @api
    set orderItemSobject(value) {
        this._orderItemSobject = value;
        this.pictureUrl = getSObjectFieldValue(value, ProductPictureURLField);
        this.name = getSObjectFieldValue(value, ProductNameField);
        this.msrp = getSObjectFieldValue(value, ProductMSRPField);
        this.price = getSObjectFieldValue(value, PriceField);
        this.quantitySmall = getSObjectFieldValue(value, QtySmallField);
        this.quantityMedium = getSObjectFieldValue(value, QtyMediumField);
        this.quantityLarge = getSObjectFieldValue(value, QtyLargeField);
    }
    get orderItemSobject() {
        return this._orderItemSobject;
    }

    /** Order_Item__c field values to display. */
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
