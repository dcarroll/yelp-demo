import getListByAddress from '@salesforce/apex/YelpServiceController.getListByAddress';
import getListByLatLon from '@salesforce/apex/YelpServiceController.getListByLatLon';
import { wire, api } from 'engine';

export default class YelpService {
    @wire(getListByAddress, { address: '$address', searchTerm: '$searchTerm' })
    listByAddress;

    @wire(getListByLatLon, { latlon: '$latlon', searchTerm: '$searchTerm' })
    listByLatLon;

    handleYelpData = response => {
        var state = response.getState();
        if (state === 'ERROR') {
            this.errorMessage = 'We got lost on the way to the data.';
            /* var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "type": "error",
                "title": "Ooops!",
                "message": 'A really bad thing happened on the way to retrieving your data.',
                "mode": "sticky"
            });
            toastEvent.fire();*/
        } else if (state === 'SUCCESS') {
            var data = JSON.parse(response.getReturnValue());
            if (data.error) {
                this.errorMessage = data.error;
            } else if (data.bizArray) {
                /* var yelpEvent = component.getEvent("yelpDataFound");
                yelpEvent.setParams( { locationUsed: data.location, resultList: data.bizArray } );
                yelpEvent.fire(); */
            }
        }
    };

    @api
    getYelpData = (searchTerm, address, latlon) => {
        if (address) {
            this.listByAddress({ address: address, searchTerm: searchTerm })
                .then(results => {
                    this.handleYelpData(results);
                })
                .catch(error => {
                    this.errorMessage = error.toString();
                });
        } else if (latlon) {
            this.listByLatLon({ latlon: latlon, searchTerm: searchTerm })
                .then(results => {
                    this.handleYelpData(results);
                })
                .catch(error => {
                    this.errorMessage = error.toString();
                });
        }
    };

    updateSearch = () => {
        getYelpData();
    };
}
