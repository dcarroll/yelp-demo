import { Element, track, wire, api } from 'engine';

/** Record DML operations. */
import { createRecord, updateRecord } from 'lightning-ui-api-record';

/** Use Apex to fetch related records. */
import { refreshApex } from '@salesforce/apex';
import getOrderItems from '@salesforce/apex/OrderController.getOrderItems';
import { getFieldValue, getSObjectFieldValue } from 'c-utils';

// TODO W-5097897 - use deleteRecord from lightning-ui-api-record
import deleteOrderItem from '@salesforce/apex/OrderController.deleteOrderItem';

// TODO W-5159536 - adopt final notifications API
import { showToast } from 'lightning-notifications-library';

/** Static Resources. */
import bike_assets from '@salesforce/resource-url/bike_assets';

/** Order_Item__c Schema. */
import OrderItemObject from '@salesforce/schema/Order_Item__c';
import OrderField from '@salesforce/schema/Order_Item__c.Order__c';
import ProductField from '@salesforce/schema/Order_Item__c.Product__c';
import QtySmallField from '@salesforce/schema/Order_Item__c.Qty_S__c';
import QtyMediumField from '@salesforce/schema/Order_Item__c.Qty_M__c';
import QtyLargeField from '@salesforce/schema/Order_Item__c.Qty_L__c';
import PriceField from '@salesforce/schema/Order_Item__c.Price__c';

/** Order_Item__c Schema. */
import ProductMSRPField from '@salesforce/schema/Product__c.MSRP__c';

/** Discount for resellers. TODO - move to custom field on Account. */
const DISCOUNT = 0.6;

/**
 * Gets the quantity of all items in an Order_Item__c SObject.
 */
function getQuantity(orderItemSobject) {
    return (
        getSObjectFieldValue(orderItemSobject, QtySmallField) +
        getSObjectFieldValue(orderItemSobject, QtyMediumField) +
        getSObjectFieldValue(orderItemSobject, QtyLargeField)
    );
}

/**
 * Gets the price for the specified quantity of Order_Item__c SObject.
 */
function getPrice(orderItemSobject, quantity) {
    return getSObjectFieldValue(orderItemSobject, PriceField) * quantity;
}

/**
 * Calculates the quantity and price of all Order_Item__c SObjects.
 */
function calculateOrderSummary(orderItemSobjects) {
    const summary = orderItemSobjects.reduce(
        (acc, orderItemSobject) => {
            const quantity = getQuantity(orderItemSobject);
            const price = getPrice(orderItemSobject, quantity);
            acc.quantity += quantity;
            acc.price += price;
            return acc;
        },
        { quantity: 0, price: 0 },
    );
    return summary;
}

/**
 * Builds Order__c by CRUD'ing the related Order_Item__c SObjects.
 */
export default class OrderBuilder extends Element {
    /** Id of Order__c SObject to display. */
    @api recordId;

    /** The Order_Item__c SObjects to display. */
    @track orderItemSobjects = [];

    /** Total price of the Order__c. Calculated from this.orderItems. */
    @track orderPrice = 0;

    /** Total quantity of the Order__c. Calculated from this.orderItems. */
    @track orderQuantity = 0;

    /** URL for company logo. */
    logoUrl = bike_assets + '/logo.svg';

    /** Wired Apex result so it may be programatically refreshed. */
    wiredOrderItemSobjects;

    /** Apex load the Order__c's Order_Item_c[] and their related Product__c details. */
    @wire(getOrderItems, { orderId: '$recordId' })
    wiredGetOrderItems(value) {
        this.wiredOrderItemSobjects = value;
        if (value.error) {
            this.showError({ title: 'Error Loading Order', message: value.error.message });
        } else if (value.data) {
            this.setOrderItemSobjects(value.data);
        }
    }

    /** Updates the order items, recalculating the order quantity and price. */
    setOrderItemSobjects(orderItemSobjects) {
        this.orderItemSobjects = orderItemSobjects;
        const summary = calculateOrderSummary(this.orderItemSobjects);
        this.orderQuantity = summary.quantity;
        this.orderPrice = summary.price;
    }

    /** Handles drag-and-dropping a new product to create a new Order_Item__c. */
    dropHandler(event) {
        event.preventDefault();

        // Product__c from LDS
        const product = JSON.parse(event.dataTransfer.getData('product'));

        // build new Order_Item__c record
        const fields = {};
        fields[OrderField.fieldApiName] = this.recordId;
        fields[ProductField.fieldApiName] = product.id;
        fields[PriceField.fieldApiName] = Math.round(getFieldValue(product, ProductMSRPField).value * DISCOUNT);

        // create Order_Item__c record on server
        const recordInput = { apiName: OrderItemObject.objectApiName, fields };
        createRecord(recordInput)
            .then(() => {
                // refresh the Order_Item__c SObjects
                return refreshApex(this.wiredOrderItemSobjects);
            })
            .catch(e => {
                this.showError({ message: e.message });
            });
    }

    /** Handles for dragging events. */
    dragOverHandler(event) {
        event.preventDefault();
    }

    /** Handles event to change Order_Item__c details. */
    orderItemChangeHandler(evt) {
        const detail = evt.detail;
        const id = detail.id;

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

        // optimistically make the change on the client
        const previousOrderItemSobjects = this.orderItemSobjects;
        const orderItemSobjects = this.orderItemSobjects.map(orderItemSobject => {
            if (orderItemSobject.Id === id) {
                // synthesize a new Order_Item__c SObject
                return Object.assign({}, orderItemSobject, fields);
            }
            return orderItemSobject;
        });
        this.setOrderItemSobjects(orderItemSobjects);

        // update Order_Item__c on the server
        const recordInput = { fields: Object.assign({ Id: id }, fields) };
        updateRecord(recordInput)
            .then(() => {
                // if there were triggers/etc that invalidate the Apex result then we'd refresh it
                // return refreshApex(this.wiredOrderItemSobjects);
            })
            .catch(e => {
                // error updating server so rollback to previous data
                this.setOrderItemSobjects(previousOrderItemSobjects);
                this.showError({ message: e.message });
            });
    }

    /** Handles event to delete Order_Item__c. */
    orderItemDeleteHandler(evt) {
        const id = evt.detail.id;

        // optimistically make the change on the client
        let previousOrderItemSobjects = this.orderItemSobjects;
        const orderItemSobjects = this.orderItemSobjects.filter(orderItemSobject => orderItemSobject.Id !== id);
        this.setOrderItemSobjects(orderItemSobjects);

        // delete Order_Item__c SObject on the server
        deleteOrderItem({ orderItemId: id })
            .then(() => {
                // if there were triggers/etc that invalidate the Apex result then we'd refresh it
                // return refreshApex(this.wiredOrderItemSobjects);
            })
            .catch(e => {
                // error updating server so rollback to previous data
                this.setOrderItemSobjects(previousOrderItemSobjects);
                this.showError({ message: e.message });
            });
    }

    /** Displays an error. */
    showError({ title, message }) {
        showToast({
            title: title || 'Error Updating Order',
            message,
            variant: 'error',
        });
    }
    /** Whether there no Order_Item__c to display */
    get isEmpty() {
        return this.orderItemSobjects.length === 0;
    }
}
