/**
 * Gets a field value from a record.
 * @param {Record} record The record holding the field.
 * @param {FieldId} field The field to return.
 * @return {Object} The field's value object, containing value and display value.
 * If it doesn't exist, undefined is returned.
 *
 * TODO - W-5245493 adopt Lightning Data Service's version when available
 */
export function getFieldValue(record, field) {
    const fields = field.fieldApiName.split('.');
    return recursiveGetFieldValue(record, fields);
}

function recursiveGetFieldValue(record, fields) {
    const f = fields[0];
    const value = record.fields[f];
    // if at final field || need to traverse to a sub-record and there isn't a sub-record
    if (fields.length === 1 || !value.value) {
        return value;
    }
    return recursiveGetFieldValue(value.value, fields.slice(1));
}
