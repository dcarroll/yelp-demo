import { Element, track, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import { getPageReference } from 'lightning-navigation';

const fields = ['Product__c.Name'];

export default class SkillLevel extends Element {
    @track product;

    @wire(getPageReference, {})
    wiredPageReference(pageReference) {
        this.recordId = pageReference.attributes.recordId;
    }

    @wire(getRecord, { recordId: '$recordId', fields: fields })
    wiredRecord({ error, data }) {
        if (error) {
            // TODO handle error
        } else if (data) {
            this.product = data.fields;
        }
    }
}
