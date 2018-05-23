import { Element, api, track } from 'engine';
import pubsub from 'c-pubsub';
import assets from '@resource-url/bike_assets';
import { getProducts } from '@apex/ProductController.getProducts';

export default class ProductTileList extends Element {
    @api searchBarIsVisible = false;

    @track selectedProducts = [];

    @track logo = assets + '/logo.svg';

    products;

    connectedCallback() {
        this.filterChangeCallback = this.onFilterChange.bind(this);
        pubsub.register('filterChange', this.filterChangeCallback);
        getProducts()
            .then(result => {
                this.products = result;
                this.selectedProducts = result;
            })
            .catch(() => {
                //TODO: implement error handling
            });
    }

    disconnectedCallback() {
        pubsub.unregister('filterChange', this.filterChangeCallback);
    }

    searchKeyChangeHandler(event) {
        const searchKey = event.target.value;
        this.selectedProducts = this.products.filter(product =>
            product.Name.toLowerCase().includes(searchKey.toLowerCase()),
        );
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
                (filters.beginner ? true : product.Level__c !== 'Beginner') &&
                (filters.enthusiast ? true : product.Level__c !== 'Enthusiast') &&
                (filters.racer ? true : product.Level__c !== 'Racer')
            );
        });
    }

    get isEmpty() {
        return this.selectedProducts.length === 0;
    }
}
