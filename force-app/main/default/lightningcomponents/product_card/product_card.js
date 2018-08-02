import { Element, track, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import { getFieldValue } from 'c-utils';
import pubsub from 'c-pubsub';

// TODO W-5159536 - adopt final notifications API
import { showToast } from 'lightning-notifications-library';

import bike_assets from '@salesforce/resource-url/bike_assets';

import NameField from '@salesforce/schema/Product__c.Name';
import LevelField from '@salesforce/schema/Product__c.Level__c';
import CategoryField from '@salesforce/schema/Product__c.Category__c';
import MaterialField from '@salesforce/schema/Product__c.Material__c';
import MSRPField from '@salesforce/schema/Product__c.MSRP__c';
import PictureURLField from '@salesforce/schema/Product__c.Picture_URL__c';

const fields = [NameField, LevelField, CategoryField, MaterialField, MSRPField, PictureURLField];

/**
 * Component to display details of a Product__c.
 */
export default class ProductCard extends Element {
    /** Id of Product__c to display. */
    recordId;

    /** Product__c to display */
    @track product;

    /** Product__c field values to display. */
    @track name = '';
    @track pictureUrl;
    @track category;
    @track level;
    @track msrp;
    @track material;

    /** Load the Product__c to display. */
    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            showToast({
                title: 'Error Loading Product Details',
                message: error.message,
                variant: 'error',
            });
        } else if (data) {
            this.product = data;
            this.name = getFieldValue(this.product, NameField).value;
            this.pictureUrl = getFieldValue(this.product, PictureURLField).value;
            this.category = getFieldValue(this.product, CategoryField).displayValue;
            this.level = getFieldValue(this.product, LevelField).displayValue;
            this.msrp = getFieldValue(this.product, MSRPField).value;
            this.material = getFieldValue(this.product, MaterialField).displayValue;
        }
    }

    @track logo = bike_assets + '/logo.svg';

    connectedCallback() {
        this.boundProductSelectedHandler = this.productSelectedHandler.bind(this);
        pubsub.register('productSelected', this.boundProductSelectedHandler);
    }

    disconnectedCallback() {
        pubsub.unregister('productSelected', this.boundProductSelectedHandler);
    }

    productSelectedHandler(product) {
        this.recordId = product.id;
    }
}
