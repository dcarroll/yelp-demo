import { Element, api, track, wire } from 'engine';
import pubsub from 'c-pubsub';
import bike_assets from '@salesforce/resource-url/bike_assets';

/** Wire adapter for list views. */
import { getListUi } from 'lightning-ui-api-list-ui';
import { getFieldValue } from 'c-utils';

// TODO W-5159536 - adopt final notifications API
import { showToast } from 'lightning-notifications-library';

/** Schema. */
import ProductObject from '@salesforce/schema/Product__c.Name';
import NameField from '@salesforce/schema/Product__c.Name';
import LevelField from '@salesforce/schema/Product__c.Level__c';
import CategoryField from '@salesforce/schema/Product__c.Category__c';
import MaterialField from '@salesforce/schema/Product__c.Material__c';
import MSRPField from '@salesforce/schema/Product__c.MSRP__c';

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

    /** Whether the product tiles are draggable. */
    @api tilesAreDraggable = false;

    /** Url for bike logo. */
    @track logoUrl = bike_assets + '/logo.svg';

    /** All available products. */
    products;

    /** Product__c[] matching search criteria. */
    @track selectedProducts = [];

    /** Load the list of available products. */
    @wire(getListUi, { objectApiName: ProductObject, listViewApiName: 'ProductList', sortBy: ['Name'] })
    wiredProducts({ error, data }) {
        if (data) {
            this.products = this.selectedProducts = data.records.records;
        } else if (error) {
            showToast({
                title: 'Error Loading Product List',
                message: error.message,
                variant: 'error',
            });
        }
    }

    connectedCallback() {
        this.boundFilterChangeHandler = this.filterChangeHandler.bind(this);
        pubsub.register('filterChange', this.boundFilterChangeHandler);
    }

    disconnectedCallback() {
        pubsub.unregister('filterChange', this.boundFilterChangeHandler);
    }

    searchKeyChangeHandler(event) {
        const searchKey = event.target.value.toLowerCase();
        this.selectedProducts = this.products.filter(product =>
            getFieldValue(product, NameField)
                .value.toLowerCase()
                .includes(searchKey),
        );
    }

    filterChangeHandler(filters) {
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
