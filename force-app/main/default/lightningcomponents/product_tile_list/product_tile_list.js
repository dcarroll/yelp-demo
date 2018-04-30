import { Element, api, track } from 'engine';
import pubsub from 'c-pubsub';
import assets from '@resource-url/bike_assets';

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

    @track logo = assets + '/logo.svg';

    _products;

    connectedCallback() {
        this.filterChangeCallback = this.onFilterChange.bind(this);
        pubsub.register('filterChange', this.filterChangeCallback);
    }

    disconnectedCallback() {
        pubsub.unregister('filterChange', this.filterChangeCallback);
    }

    onFilterChange(filters) {
        this.selectedProducts = this.products.filter(product => {
            return (
                product.MSRP__c <= filters.maxPrice &&
                product.Name.toLowerCase().includes(filters.searchKey.toLowerCase()) &&
                (filters.commuter ? true : product.Category__c !== 'Commuter') &&
                (filters.mountain ? true : product.Category__c !== 'Mountain') &&
                (filters.aluminum ? true : product.Material__c !== 'Aluminum') &&
                (filters.carbon ? true : product.Material__c !== 'Carbon') &&
                (filters.men ? true : product.Gender__c !== 'Men') &&
                (filters.women ? true : product.Gender__c !== 'Women')
            );
        });
    }

    get isEmpty() {
        return !(this.selectedProducts && this.selectedProducts.length > 0);
    }
}
