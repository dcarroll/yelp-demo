import { Element, track, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import pubsub from 'c-pubsub';
import assets from '@resource-url/bike_assets';

const fields = [
    'Product__c.Name',
    'Product__c.Description__c',
    'Product__c.Gender__c',
    'Product__c.Category__c',
    'Product__c.Material__c',
    'Product__c.MSRP__c',
    'Product__c.Picture_URL__c',
];

export default class ProductCard extends Element {
    @track recordId;
    @track product;
    @track logo = assets + '/logo.svg';

    @wire(getRecord, { recordId: '$recordId', fields: fields })
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
