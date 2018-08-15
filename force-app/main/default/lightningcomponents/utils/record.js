/**
 * Gets a field value from a record.
 * @param {Record} record - The record holding the field.
 * @param {FieldId} field - The field to return.
 * @return {object} The field's value object, containing value and display value.
 * If it doesn't exist, undefined is returned.
 *
 * TODO - W-5245493 adopt Lightning Data Service's version when available
 */
export function getFieldValue(record, field) {
    const fields = field.fieldApiName.split('.');
    while (fields.length > 0 && record) {
        const f = fields.shift();
        record = record.fields[f];
        if (record === undefined) {
            return undefined;
        } else if (fields.length > 0) {
            record = record.value;
        }
    }
    return record;
}
