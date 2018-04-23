import { Element, api, track } from 'engine';
// import { createRecord } from "lightning-lds-records";
// import { createRecordInputFromRecord } from "lightning-lds-records";

export default class OrderBuilder extends Element {

    @api orderId;

    @api orderItems = [];

    @track createStatus

    @track orderTotal = 0;

    @track totalItems = 0;

    // @wire('record-create-defaults', { apiName: 'Order_Item__c' })
    // defaults;

    dropHandler(event) {
        event.preventDefault();
        let product = JSON.parse(event.dataTransfer.getData("product"));
        let orderItem = {
            orderId: this.orderId,
            productId: product.Id,
            qtyS: 1,
            qtyM: 1,
            qtyL: 1,
            qtyXL: 1,
            name: product.Name,
            price: product.Price__c,
            category: product.Category__c,
            pictureURL: product.Picture_URL__c
        };
        this.orderItems.push(orderItem);
        this.totalItems = this.totalItems + 4;
        this.orderTotal = this.orderTotal + 4 * product.Price__c;


        // const recordInput = createRecordInputFromRecord(this.defaults.data.record);
        // let overrides = {
        //     "fields": {
        //         "Order__c": {
        //             "value": "a01R000000CLevFIAT"
        //         },
        //         "Product__c": {
        //             "value": product.Id
        //         },
        //         "Qty__c": {
        //             "value": 1
        //         }
        //     }
        // };

        // const record = Object.assign(recordInput, overrides);
        // this.createStatus = 'Creating Account record.';
        // createRecord(record)
        //     .then(newRecord => {
        //         this.createStatus = `Account record created. Id is ${newRecord.id}.`;
        //     })
        //     .catch(err => {
        //         this.createStatus = 'Account record creation failed. ' + err.message;
        //     });

    }

    dragOverHandler(event) {
        event.preventDefault();
    }

}