import { Element, track, wire, api } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import pubsub from 'c-pubsub';

const fields = [
    'Product__c.Name',
    'Product__c.Description__c',
    'Product__c.Gender__c',
    'Product__c.Category__c',
    'Product__c.Material__c',
    'Product__c.Price__c',
    'Product__c.Picture_URL__c',
];

export default class ProductCard extends Element {
    /**
     * Setter for recordId property. Resets UI and triggers @wire reload.
     * @param {String} value new record id.
     */
    @api
    set recordId(value) {
        this.recordIds = value ? [value] : undefined;
    }

    /** Getter for recordId property. */
    @api
    get recordId() {
        return this.recordIds ? this.recordIds[0] : undefined;
    }

    /** Ids of records to load. */
    recordIds;

    @track product;

    @wire(getRecord, { recordIds: '$recordIds', fields: fields })
    wiredRecord(error, data) {
        if (error) {
            // TODO handle error
        } else {
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
