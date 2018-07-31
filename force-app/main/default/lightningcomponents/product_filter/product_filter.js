import { Element, track } from 'engine';
import pubsub from 'c-pubsub';

export default class ProductFilter extends Element {
    @track searchKey = '';
    @track maxPrice = 10000;
    @track aluminum = true;
    @track carbon = true;
    @track commuter = true;
    @track mountain = true;
    @track beginner = true;
    @track enthusiast = true;
    @track racer = true;

    resetHandler() {
        this.searchKey = '';
        this.maxPrice = 10000;
        this.aluminum = true;
        this.carbon = true;
        this.commuter = true;
        this.mountain = true;
        this.beginner = true;
        this.enthusiast = true;
        this.racer = true;
        this.fireFilterChangeEvent();
    }

    searchKeyChangeHandler(event) {
        this.searchKey = event.detail.value;
        this.fireFilterChangeEvent();
    }

    maxPriceChangeHandler(event) {
        this.maxPrice = event.detail.value;
        this.fireFilterChangeEvent();
    }

    onCheckboxChange(event) {
        const target = event.currentTarget;
        this[target.dataset.src] = target.checked;
        this.fireFilterChangeEvent();
    }

    fireFilterChangeEvent() {
        const filters = {
            searchKey: this.searchKey,
            maxPrice: this.maxPrice,
            aluminum: this.aluminum,
            carbon: this.carbon,
            commuter: this.commuter,
            mountain: this.mountain,
            beginner: this.beginner,
            enthusiast: this.enthusiast,
            racer: this.racer,
        };
        pubsub.fire('filterChange', filters);
    }
}
