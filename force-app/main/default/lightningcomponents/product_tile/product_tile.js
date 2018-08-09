import { Element, api, track } from 'engine';
import pubsub from 'c-pubsub';
import { getFieldValue } from 'c-utils';

/** Schema. */
import PictureURLField from '@salesforce/schema/Product__c.Picture_URL__c';
import NameField from '@salesforce/schema/Product__c.Name';
import MSRPField from '@salesforce/schema/Product__c.MSRP__c';

/**
 * A presentation component to display a Product__c. The provided
 * Product__c data must contain all fields used by this component.
 */
export default class ProductTile extends Element {
    /** Whether the tile is draggable. */
    @api draggable;

    _product;
    /** Product__c to display. */
    @api
    get product() {
        return this._product;
    }
    set product(value) {
        this._product = value;
        this.pictureUrl = getFieldValue(value, PictureURLField).value;
        this.name = getFieldValue(value, NameField).value;
        this.msrp = getFieldValue(value, MSRPField).value;
    }

    /** Product__c field values to display. */
    @track pictureUrl;
    @track name;
    @track msrp;

    clickHandler() {
        pubsub.fire('productSelected', this.product);
    }

    dragStartHandler(event) {
        event.dataTransfer.setData('product', JSON.stringify(this.product));
    }
}
