import { Element, track, wire, api } from 'engine';

/** Record DML operations. */
import {
    getRecordCreateDefaults,
    createRecord,
    generateRecordInputForCreate,
    updateRecord,
} from 'lightning-ui-api-record';
import { getFieldValue } from 'c-utils';

/** Use Apex to fetch related records. */
import { refreshApex } from '@salesforce/apex';
import getOrderItems from '@salesforce/apex/OrderController.getOrderItems';

// TODO W-5097897 - use deleteRecord from lightning-ui-api-record
import deleteOrderItem from '@salesforce/apex/OrderController.deleteOrderItem';

/** Event to display a toast. */

/** Static Resources. */
import assets from '@salesforce/resource-url/bike_assets';

/** Order_Item__c Schema. */
import OrderItemObject from '@salesforce/schema/Order_Item__c';
import OrderField from '@salesforce/schema/Order_Item__c.Order__c';
import ProductField from '@salesforce/schema/Order_Item__c.Product__c';
import QtySmallField from '@salesforce/schema/Order_Item__c.Qty_S__c';
import QtyMediumField from '@salesforce/schema/Order_Item__c.Qty_M__c';
import QtyLargeField from '@salesforce/schema/Order_Item__c.Qty_L__c';
import PriceField from '@salesforce/schema/Order_Item__c.Price__c';

/** Product__c Schema. */
import ProductMSRPField from '@salesforce/schema/Product__c.MSRP__c';

/** Discount for resellers. TODO - move to custom field on Account. */
const DISCOUNT = 0.6;

/**
 * Gets the quantity of all items in a Apex-retrieved Order_Item__c.
 */
function getQuantity(orderItem) {
    return (
        orderItem[QtySmallField.fieldApiName] +
        orderItem[QtyMediumField.fieldApiName] +
        orderItem[QtyLargeField.fieldApiName]
    );
}

/**
 * Gets the price for the specified quantity of Apex-retrieved Order_Item__c.
 */
function getPrice(orderItem, quantity) {
    return orderItem[PriceField.fieldApiName] * quantity;
}

/**
 * Calculates the quantity and price of all Apex-retrieved Order_Item__c[].
 */
function calculateOrderSummary(orderItems) {
    const summary = orderItems.reduce(
        (acc, orderItem) => {
            const quantity = getQuantity(orderItem);
            const price = getPrice(orderItem, quantity);
            acc.quantity += quantity;
            acc.price += price;
            return acc;
        },
        { quantity: 0, price: 0 },
    );
    return summary;
}

export default class OrderBuilder extends Element {
    /** Id of Order__c to display. */
    @api recordId;

    /** The Apex-retrieved Order_Item__c[] to display. */
    @track orderItems = [];

    /** Total price of the Order__c. Calculated from the Order_Item__c[]. */
    @track orderPrice = 0;

    /** Total quantity of the Order__c. Calculated from the Order_Item__c[]. */
    @track orderQuantity = 0;

    /** URL for company logo. */
    logoUrl = assets + '/logo.svg';

    /** Apex load the Order__c's Order_Item_c[] and their related Product__c details. */
    @wire(getOrderItems, { orderId: '$recordId' })
    wiredGetOrderItems(value) {
        this.wiredOrderItems = value;
        if (value.error) {
            this.showError({ title: 'Error Loading Order', message: value.error.message });
        } else if (value.data) {
            this.setOrderItems(value.data);
        }
    }

    // TODO - W-4907339 apiName will be renamed to objectApiName
    @wire(getRecordCreateDefaults, { apiName: OrderItemObject.objectApiName })
    defaults;

    /** Updates the order items, recalculating the order quantity and price. */
    setOrderItems(orderItems) {
        this.orderItems = orderItems;
        const summary = calculateOrderSummary(this.orderItems);
        this.orderQuantity = summary.quantity;
        this.orderPrice = summary.price;
    }

    /** Handles drag-and-drop'ing a new product to create a new Order_Item__c. */
    dropHandler(event) {
        event.preventDefault();

        // get product details
        const product = JSON.parse(event.dataTransfer.getData('product'));
        const msrp = getFieldValue(product, ProductMSRPField).value;

        // build new Order_Item__c
        const fields = {};
        fields[OrderField.fieldApiName] = this.recordId;
        fields[ProductField.fieldApiName] = product.id;
        fields[PriceField.fieldApiName] = Math.round(msrp * DISCOUNT);

        // create Order_Item__c on server
        const recordInput = generateRecordInputForCreate(this.defaults.data.record);
        Object.assign(recordInput, { fields });
        createRecord(recordInput)
            .then(() => {
                // refresh the Apex-retrieved Order_Item__c[]
                return refreshApex(this.wiredOrderItems);
            })
            .catch(e => {
                this.showError({ message: e.message });
            });
    }

    dragOverHandler(event) {
        event.preventDefault();
    }

    /** Handles event to change Order_Item__c details. */
    orderItemChangeHandler(evt) {
        const detail = evt.detail;
        const Id = detail.Id;

        // map back to schema shape
        const fields = {};
        if ('price' in detail) {
            fields[PriceField.fieldApiName] = detail.price;
        }
        if ('quantitySmall' in detail) {
            fields[QtySmallField.fieldApiName] = detail.quantitySmall;
        }
        if ('quantityMedium' in detail) {
            fields[QtyMediumField.fieldApiName] = detail.quantityMedium;
        }
        if ('quantityLarge' in detail) {
            fields[QtyLargeField.fieldApiName] = detail.quantityLarge;
        }

        // optimistically make the change on the client (requires synthesizing the shape
        // of an Apex-retrieved Order_Item__c).
        const previousOrderItems = this.orderItems;
        const orderItems = this.orderItems.map(orderItem => {
            if (orderItem.Id === Id) {
                return Object.assign({}, orderItem, fields);
            }
            return orderItem;
        });
        this.setOrderItems(orderItems);

        // update Order_Item__c on the server
        const recordInput = { fields: Object.assign({ Id }, fields) };
        updateRecord(recordInput)
            .then(() => {
                // if there were triggers/etc that invalidate the Apex result then we'd refresh it
                // return refreshApex(this.wiredOrderItems);
            })
            .catch(e => {
                // error updating server so rollback to previous data
                this.setOrderItems(previousOrderItems);
                this.showError({ message: e.message });
            });
    }

    /** Handles event to delete Order_Item__c. */
    orderItemDeleteHandler(evt) {
        const Id = evt.detail.Id;

        // optimistically make the change on the client
        let previousOrderItems = this.orderItems;
        const orderItems = this.orderItems.filter(orderItem => orderItem.Id !== Id);
        this.setOrderItems(orderItems);

        // delete Order_Item__c on the server
        deleteOrderItem({ orderItemId: Id })
            .then(() => {
                // if there were triggers/etc that invalidate the Apex result then we'd refresh it
                // return refreshApex(this.wiredOrderItems);
            })
            .catch(e => {
                // error updating server so rollback to previous data
                this.setOrderItems(previousOrderItems);
                this.showError({ message: e.message });
            });
    }

    /** Displays an error. */
    showError({ title, message }) {
        // TODO - display this in the UI
        window.console.error(title || 'Error Updating Order', message);
    }
    /** Whether there no Order_Item__c to display */
    get isEmpty() {
        return this.orderItems.length === 0;
    }
}
