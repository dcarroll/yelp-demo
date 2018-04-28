import { Element, track, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import pubsub from 'c-pubsub';

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

    @wire(getRecord, { recordId: '$recordId', fields: fields })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.product = data.fields;
        }
    }

    connectedCallback() {
        pubsub.register('productSelected', this.productSelectedHandler.bind(this));
    }

    disconnectedCallback() {
        // TODO: unregister event listener
    }

    productSelectedHandler(product) {
        this.recordId = product.Id;
    }

    get header() {
        return this.product ? this.product.Name.value : '';
    }
}
