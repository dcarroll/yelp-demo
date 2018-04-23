import { Element, track } from 'engine';
import pubsub from 'c-pubsub';

export default class ProductFilter extends Element {

    @track searchKey = '';

    @track maxPrice = 10000;

    @track aluminum = true;

    @track carbon = true;

    @track commuter = true;

    @track mountain = true;

    @track men = true;

    @track women = true;

    resetHandler() {
        this.searchKey = '';
        this.maxPrice = 10000;
        this.aluminum = true;
        this.carbon = true;
        this.commuter = true;
        this.mountain = true;
        this.men = true;
        this.women = true;
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
        const el = event.target.querySelector("input");
        this[event.target.dataset.src] = el.checked;
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
            men: this.men,
            women: this.women
        };
        pubsub.fire('filterChange', filters);
    }

}