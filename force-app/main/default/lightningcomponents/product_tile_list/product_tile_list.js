import { Element, api, track, wire } from 'engine';
import pubsub from 'c-pubsub';
import bike_assets from '@salesforce/resource-url/bike_assets';
import { getListUi } from 'lightning-ui-api-list-ui';

import ProductObject from '@salesforce/schema/Product__c.Name';
import NameField from '@salesforce/schema/Product__c.Name';
import LevelField from '@salesforce/schema/Product__c.Level__c';
import CategoryField from '@salesforce/schema/Product__c.Category__c';
import MaterialField from '@salesforce/schema/Product__c.Material__c';
import MSRPField from '@salesforce/schema/Product__c.MSRP__c';
import { getFieldValue } from 'c-utils';

function getCategories(filters) {
    const categories = [];
    if (filters.commuter) {
        categories.push('Commuter');
    }
    if (filters.mountain) {
        categories.push('Mountain');
    }
    return categories;
}

function getMaterials(filters) {
    const materials = [];
    if (filters.aluminum) {
        materials.push('Aluminum');
    }
    if (filters.carbon) {
        materials.push('Carbon');
    }
    return materials;
}

function getLevels(filters) {
    const levels = [];
    if (filters.beginner) {
        levels.push('Beginner');
    }
    if (filters.enthusiast) {
        levels.push('Enthusiast');
    }
    if (filters.racer) {
        levels.push('Racer');
    }
    return levels;
}

/**
 * Container component that loads and displays a list of Product__c records.
 */
export default class ProductTileList extends Element {
    /** Whether to display the search bar. */
    @api searchBarIsVisible = false;

    /** Url for bike logo. */
    logoUrl = bike_assets + '/logo.svg';

    /** All available products. */
    products;

    /** Products matching search criteria. */
    @track selectedProducts = [];

    /** Load the list of available products. */
    @wire(getListUi, { objectApiName: ProductObject, listViewApiName: 'ProductList' })
    wiredProducts({ error, data }) {
        if (data) {
            this.products = this.selectedProducts = data.records.records;
        } else if (error) {
            // TODO: handle errors
        }
    }

    connectedCallback() {
        this.filterChangeCallback = this.onFilterChange.bind(this);
        pubsub.register('filterChange', this.filterChangeCallback);
    }

    disconnectedCallback() {
        pubsub.unregister('filterChange', this.filterChangeCallback);
    }

    searchKeyChangeHandler(event) {
        const searchKey = event.target.value.toLowerCase();

        this.selectedProducts = this.products.filter(product =>
            getFieldValue(product, NameField)
                .value.toLowerCase()
                .includes(searchKey),
        );
    }

    onFilterChange(filters) {
        const searchKey = filters.searchKey.toLowerCase();
        const categories = getCategories(filters);
        const materials = getMaterials(filters);
        const levels = getLevels(filters);

        this.selectedProducts = this.products.filter(product => {
            return (
                getFieldValue(product, NameField)
                    .value.toLowerCase()
                    .includes(searchKey) &&
                getFieldValue(product, MSRPField).value <= filters.maxPrice &&
                categories.includes(getFieldValue(product, CategoryField).value) &&
                materials.includes(getFieldValue(product, MaterialField).value) &&
                levels.includes(getFieldValue(product, LevelField).value)
            );
        });
    }

    get isEmpty() {
        return this.selectedProducts.length === 0;
    }
}
