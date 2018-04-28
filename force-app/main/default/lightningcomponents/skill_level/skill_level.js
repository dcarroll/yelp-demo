import { Element, track, wire, api } from 'engine';
import { getRecord } from 'lightning-ui-api-record';

const fields = ['Product__c.Name'];

export default class SkillLevel extends Element {
    @api recordId;
    @track product;

    @wire(getRecord, { recordId: '$recordId', fields: fields })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.product = data.fields;
        }
    }
}
