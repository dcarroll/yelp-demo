import { Element, track, wire, api } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import NameField from '@salesforce/schema/Product__c.Name';

export default class SkillLevel extends Element {
    @track product;
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: [NameField] })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.product = data.fields;
        }
    }
}
