import { Element, api, track } from 'engine';
import pubsub from 'c-pubsub';

export default class ProductTileList extends Element {
    @api
    set products(products) {
        this._products = products;
        this.selectedProducts = products;
    }

    @api
    get products() {
        return this._products;
    }

    @track selectedProducts;

    _products;

    constructor() {
        super();
        pubsub.register('filterChange', this.onFilterChange.bind(this));
    }

    onFilterChange(filters) {
        this.selectedProducts = this.products.filter(product => {
            return (
                product.MSRP__c <= filters.maxPrice &&
                product.Name.indexOf(filters.searchKey) > -1 &&
                (filters.commuter ? true : product.Category__c !== 'Commuter') &&
                (filters.mountain ? true : product.Category__c !== 'Mountain') &&
                (filters.aluminum ? true : product.Material__c !== 'Aluminum') &&
                (filters.carbon ? true : product.Material__c !== 'Mountain') &&
                (filters.men ? true : product.Gender__c !== 'Men') &&
                (filters.women ? true : product.Gender__c !== 'Women')
            );
        });
    }
}
