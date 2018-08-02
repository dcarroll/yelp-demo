/**
 * Gets a field value from an Apex-retrieved SObject.
 * @param {SObject} sobject The SObject holding the field.
 * @param {FieldId} field The field to return.
 * @return {any} The field's value. If it doesn't exist, undefined is returned.
 *
 * TODO - W-5274497 adopt @salesforce/apex's version when available.
 */
export function getSObjectFieldValue(sobject, field) {
    const fields = field.fieldApiName.split('.');
    while (fields.length > 0) {
        const f = fields.shift();
        // if field or path to field is not found then return undefined
        if (!(f in sobject)) {
            return undefined;
        }
        sobject = sobject[f];
    }
    return sobject;
}
