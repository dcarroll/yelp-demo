import { Element, track, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import pubsub from 'c-pubsub';
import assets from '@salesforce/resource-url/bike_assets';

import NameField from '@salesforce/schema/Product__c.Name';
import DescriptionField from '@salesforce/schema/Product__c.Description__c';
import LevelField from '@salesforce/schema/Product__c.Level__c';
import CategoryField from '@salesforce/schema/Product__c.Category__c';
import MaterialField from '@salesforce/schema/Product__c.Material__c';
import MSRPField from '@salesforce/schema/Product__c.MSRP__c';
import PictureURLField from '@salesforce/schema/Product__c.Picture_URL__c';

const fields = [NameField, DescriptionField, LevelField, CategoryField, MaterialField, MSRPField, PictureURLField];

export default class ProductCard extends Element {
    @track recordId;
    @track product;
    @track logo = assets + '/logo.svg';

    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.product = data.fields;
        }
    }

    connectedCallback() {
        this.productSelectedCallback = this.onProductSelected.bind(this);
        pubsub.register('productSelected', this.productSelectedCallback);
    }

    disconnectedCallback() {
        pubsub.unregister('productSelected', this.productSelectedCallback);
    }

    onProductSelected(product) {
        this.recordId = product.Id;
    }

    get header() {
        return this.product ? this.product.Name.value : '';
    }
}
