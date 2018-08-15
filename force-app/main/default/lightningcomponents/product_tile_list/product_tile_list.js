import { Element, api, track, wire } from 'engine';

/** Pub-sub mechanism for sibling component communication. */
import pubsub from 'c-pubsub';

/** Static Resources. */
import BIKE_ASSETS_URL from '@salesforce/resource-url/bike_assets';

/** Wire adapter for list views. */
import { getListUi } from 'lightning-ui-api-list-ui';

/** Util to extract field values from records. */
import { getFieldValue } from 'c-utils';

// TODO W-5159536 - adopt final notifications API
import { showToast } from 'lightning-notifications-library';

/** Product__c Schema. */
import PRODUCT_OBJECT from '@salesforce/schema/Product__c.Name';
import NAME_FIELD from '@salesforce/schema/Product__c.Name';
import LEVEL_FIELD from '@salesforce/schema/Product__c.Level__c';
import CATEGORY_FIELD from '@salesforce/schema/Product__c.Category__c';
import MATERIAL_FIELD from '@salesforce/schema/Product__c.Material__c';
import MSRP_FIELD from '@salesforce/schema/Product__c.MSRP__c';

/** Gets the categories to filter to. */
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

/** Gets the materials to filter to. */
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

/** Gets the skill levels to filter to */
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
    /**
     * Whether to display the search bar.
     * TODO - normalize value because it may come as a boolean, string or otherwise.
     */
    @api searchBarIsVisible = false;

    /**
     * Whether the product tiles are draggable.
     * TODO - normalize value because it may come as a boolean, string or otherwise.
     */
    @api tilesAreDraggable = false;

    /** Url for bike logo. */
    @track logoUrl = BIKE_ASSETS_URL + '/logo.svg';

    /** All available Product__c[]. */
    products;

    /** Product__c[] matching search criteria. */
    @track selectedProducts = [];

    /**
     * Load the list of available products.
     * TODO W-5336635 - sortBy should accept a schema object, not require fieldApiName
     */
    @wire(getListUi, {
        objectApiName: PRODUCT_OBJECT,
        listViewApiName: 'ProductList',
        sortBy: [NAME_FIELD.fieldApiName],
    })
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
            getFieldValue(product, NAME_FIELD)
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
                getFieldValue(product, NAME_FIELD)
                    .value.toLowerCase()
                    .includes(searchKey) &&
                getFieldValue(product, MSRP_FIELD).value <= filters.maxPrice &&
                categories.includes(getFieldValue(product, CATEGORY_FIELD).value) &&
                materials.includes(getFieldValue(product, MATERIAL_FIELD).value) &&
                levels.includes(getFieldValue(product, LEVEL_FIELD).value)
            );
        });
    }

    get zeroSelectedProducts() {
        return this.selectedProducts.length === 0;
    }
}
