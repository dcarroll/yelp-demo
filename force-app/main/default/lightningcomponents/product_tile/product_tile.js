import { Element, api, track } from 'engine';

/** Pub-sub mechanism for sibling component communication. */
import pubsub from 'c-pubsub';

/** Util to extract field values from records. */
import { getFieldValue } from 'c-utils';

/** Product__c Schema. */
import PICTURE_URL_FIELD from '@salesforce/schema/Product__c.Picture_URL__c';
import NAME_FIELD from '@salesforce/schema/Product__c.Name';
import MSRP_FIELD from '@salesforce/schema/Product__c.MSRP__c';

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
        this.pictureUrl = getFieldValue(value, PICTURE_URL_FIELD).value;
        this.name = getFieldValue(value, NAME_FIELD).value;
        this.msrp = getFieldValue(value, MSRP_FIELD).value;
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
