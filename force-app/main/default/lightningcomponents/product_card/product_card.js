import { Element, api, track, wire } from 'engine';
import pubsub from 'c-pubsub';

const fields = [
    'Product__c.Name',
    'Product__c.Description__c',
    'Product__c.Gender__c',
    'Product__c.Category__c',
    'Product__c.Material__c',
    'Product__c.Price__c', 
    'Product__c.Picture_URL__c'
];

export default class ProductCard extends Element {

    @track recordId;

    @track product;

    @wire('record', { recordId: '$recordId', fields })
    loadProduct(error, data) {
        if (error) {
          alert('Error retrieving data');
          console.log(error);
        } else {
            this.product = data.fields;
        }
    }

    constructor() {
        super();
        pubsub.register('productSelected', this.productSelectedHandler.bind(this));
    }
    
    disconnectedCallback() {
        // TODO: unregister event listener
    }

    productSelectedHandler(product) {
        this.recordId = product.Id;
    }

    get header() {
        return this.product ? this.product.Name.value : "";
    }

}
