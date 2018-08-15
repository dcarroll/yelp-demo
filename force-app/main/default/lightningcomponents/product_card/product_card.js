import { Element, track, wire } from 'engine';

/** Wire adapter to load records. */
import { getRecord } from 'lightning-ui-api-record';

/** Util to extract field values from records. */
import { getFieldValue } from 'c-utils';

/** Pub-sub mechanism for sibling component communication. */
import pubsub from 'c-pubsub';

// TODO W-5159536 - adopt final notifications API
import { showToast } from 'lightning-notifications-library';

/** Static Resources. */
import BIKE_ASSETS_URL from '@salesforce/resource-url/bike_assets';

/** Product__c Schema. */
import NAME_FIELD from '@salesforce/schema/Product__c.Name';
import LEVEL_FIELD from '@salesforce/schema/Product__c.Level__c';
import CATEGORY_FIELD from '@salesforce/schema/Product__c.Category__c';
import MATERIAL_FIELD from '@salesforce/schema/Product__c.Material__c';
import MSRP_FIELD from '@salesforce/schema/Product__c.MSRP__c';
import PICTURE_URL_FIELD from '@salesforce/schema/Product__c.Picture_URL__c';

/** Record fields to load. */
const fields = [NAME_FIELD, LEVEL_FIELD, CATEGORY_FIELD, MATERIAL_FIELD, MSRP_FIELD, PICTURE_URL_FIELD];

/**
 * Component to display details of a Product__c.
 */
export default class ProductCard extends Element {
    /** Id of Product__c to display. */
    recordId;

    /** Product__c to display */
    @track product;

    /** Product__c field values to display. */
    @track name = '';
    @track pictureUrl;
    @track category;
    @track level;
    @track msrp;
    @track material;

    /** Load the Product__c to display. */
    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (error) {
            showToast({
                title: 'Error Loading Product Details',
                message: error.message,
                variant: 'error',
            });
        } else if (data) {
            this.product = data;
            this.name = getFieldValue(this.product, NAME_FIELD).value;
            this.pictureUrl = getFieldValue(this.product, PICTURE_URL_FIELD).value;
            this.category = getFieldValue(this.product, CATEGORY_FIELD).displayValue;
            this.level = getFieldValue(this.product, LEVEL_FIELD).displayValue;
            this.msrp = getFieldValue(this.product, MSRP_FIELD).value;
            this.material = getFieldValue(this.product, MATERIAL_FIELD).displayValue;
        }
    }

    @track logo = BIKE_ASSETS_URL + '/logo.svg';

    connectedCallback() {
        this.boundProductSelectedHandler = this.productSelectedHandler.bind(this);
        pubsub.register('productSelected', this.boundProductSelectedHandler);
    }

    disconnectedCallback() {
        pubsub.unregister('productSelected', this.boundProductSelectedHandler);
    }

    /**
     * Handler for when a product is selected. When `this.recordId` changes, the @wire
     * above will detect the change and provision new data.
     */
    productSelectedHandler(product) {
        this.recordId = product.id;
    }
}
