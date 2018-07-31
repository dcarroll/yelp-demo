import { createElement } from 'engine';
import ProductFilter from 'c-product_filter';
import pubsub from 'c-pubsub';

// mock out the event firing function to verify it was called with the expected parameters
jest.mock('c-pubsub', () => {
    return {
        fire: jest.fn(),
    };
});

describe('c-product_filter', () => {
    afterEach(() => {
        // jsdom instance shared across test cases in a single file
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        // prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    describe('filterChange event', () => {
        it('fired when checkbox is toggled', () => {
            const element = createElement('c-product_filter', { is: ProductFilter });
            document.body.appendChild(element);
            const commuterCheckbox = element.querySelector('[data-src="commuter"]');

            // dynamically setting the checked value on a lightning-input will be simplified in Winter '19
            const input = document.createElement('input');
            input.checked = false;
            commuterCheckbox.appendChild(input);
            commuterCheckbox.dataset = { src: 'commuter' };

            // fires the change event on the checkbox element to trigger the change event
            const changeEvent = new CustomEvent('change');
            commuterCheckbox.dispatchEvent(changeEvent);
            expect(pubsub.fire).toHaveBeenCalledWith('filterChange', expect.objectContaining({ commuter: false }));
        });

        it('fired when slider value changes', () => {
            const element = createElement('c-product_filter', { is: ProductFilter });
            document.body.appendChild(element);
            const slider = element.querySelector('lightning-slider');
            const changeEvent = new CustomEvent('change', { detail: { value: '500' } });
            slider.dispatchEvent(changeEvent);
            // only verify the relevant event params
            expect(pubsub.fire).toHaveBeenCalledWith('filterChange', expect.objectContaining({ maxPrice: '500' }));
        });

        it('fired when search value changes', () => {
            const element = createElement('c-product_filter', { is: ProductFilter });
            document.body.appendChild(element);
            const searchInput = element.querySelector('[data-src="searchKey"]');
            const changeEvent = new CustomEvent('change', { detail: { value: 'foobar' } });
            searchInput.dispatchEvent(changeEvent);
            expect(pubsub.fire).toHaveBeenCalledWith('filterChange', expect.objectContaining({ searchKey: 'foobar' }));
        });

        it('fired when reset button is pressed', () => {
            const element = createElement('c-product_filter', { is: ProductFilter });
            document.body.appendChild(element);
            const resetButton = element.querySelector('lightning-button');
            resetButton.click();
            expect(pubsub.fire).toHaveBeenCalledWith('filterChange', expect.any(Object));
        });
    });
});
