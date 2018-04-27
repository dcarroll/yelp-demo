import { Element, track, wire, api } from 'engine';
import { getRecord } from 'lightning-ui-api-record';

const fields = ['Product__c.Name'];

export default class SkillLevel extends Element {
    @api
    set recordId(value) {
        this.recordIds = value ? [value] : undefined;
    }

    @api
    get recordId() {
        return this.recordIds ? this.recordIds[0] : undefined;
    }

    recordIds;

    @track product;

    @wire(getRecord, { recordIds: '$recordIds', fields: fields })
    wiredRecord(error, data) {
        if (error) {
            // TODO handle error
        } else {
            this.product = data.fields;
        }
    }
}
