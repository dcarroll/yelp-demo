import { Element, api } from 'engine';
import pubsub from 'c-pubsub';
import { getFieldValue } from 'c-utils';

import MSRPField from '@salesforce/schema/Product__c.MSRP__c';
import NameField from '@salesforce/schema/Product__c.Name';
import PictureURLField from '@salesforce/schema/Product__c.Picture_URL__c';

/**
 * A presentation component to display a Product__c. The provided
 * Product__c data must contain all fields used by this component.
 */
export default class ProductTile extends Element {
    /** Product__c to display. */
    @api product;

    get pictureUrl() {
        return getFieldValue(this.product, PictureURLField).value;
    }

    get name() {
        return getFieldValue(this.product, NameField).value;
    }

    get msrp() {
        return getFieldValue(this.product, MSRPField).value;
    }

    productSelectedHandler() {
        pubsub.fire('productSelected', this.product);
    }

    dragStart(event) {
        event.dataTransfer.setData('product', JSON.stringify(this.product));
    }
}
