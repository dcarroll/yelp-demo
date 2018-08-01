import { Element, track, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import pubsub from 'c-pubsub';
import { getFieldValue } from 'c-utils';

import bike_assets from '@salesforce/resource-url/bike_assets';

import NameField from '@salesforce/schema/Product__c.Name';
import DescriptionField from '@salesforce/schema/Product__c.Description__c';
import LevelField from '@salesforce/schema/Product__c.Level__c';
import CategoryField from '@salesforce/schema/Product__c.Category__c';
import MaterialField from '@salesforce/schema/Product__c.Material__c';
import MSRPField from '@salesforce/schema/Product__c.MSRP__c';
import PictureURLField from '@salesforce/schema/Product__c.Picture_URL__c';

const fields = [NameField, DescriptionField, LevelField, CategoryField, MaterialField, MSRPField, PictureURLField];

export default class ProductCard extends Element {
    recordId;

    /** Product__c to display */
    @track product;

    logo = bike_assets + '/logo.svg';

    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.product = data;
        }
    }

    get pictureUrl() {
        return getFieldValue(this.product, PictureURLField).value;
    }

    get category() {
        return getFieldValue(this.product, CategoryField).displayValue;
    }

    get level() {
        return getFieldValue(this.product, LevelField).displayValue;
    }

    get msrp() {
        return getFieldValue(this.product, MSRPField).value;
    }

    get material() {
        return getFieldValue(this.product, MaterialField).displayValue;
    }

    connectedCallback() {
        this.productSelectedCallback = this.onProductSelected.bind(this);
        pubsub.register('productSelected', this.productSelectedCallback);
    }

    disconnectedCallback() {
        pubsub.unregister('productSelected', this.productSelectedCallback);
    }

    onProductSelected(product) {
        this.recordId = product.id;
    }
    get header() {
        // header is always displayed so must handle absence of this.product
        return this.product ? getFieldValue(this.product, NameField).value : '';
    }
}
