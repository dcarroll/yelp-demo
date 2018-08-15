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
        it('fired when reset button is pressed', () => {
            const element = createElement('c-product_filter', { is: ProductFilter });
            document.body.appendChild(element);
            const resetButton = element.querySelector('lightning-button');
            resetButton.click();
            expect(pubsub.fire).toHaveBeenCalledWith('filterChange', expect.any(Object));
        });

        /*
         * Programmatically setting the element properties that are defined in the template produces
         * a warning in the engine. We have have temporarily disabled these tests while we find a
         * recommended generic solution.
         */

        //eslint-disable-next-line jest/no-disabled-tests
        it.skip('fired when slider value changes', () => {
            const expectedPrice = 500;
            const element = createElement('c-product_filter', { is: ProductFilter });
            document.body.appendChild(element);
            const slider = element.querySelector('lightning-slider');
            slider.value = expectedPrice;
            const changeEvent = new CustomEvent('change');
            slider.dispatchEvent(changeEvent);
            // only verify the relevant event params
            expect(pubsub.fire).toHaveBeenCalledWith(
                'filterChange',
                expect.objectContaining({ maxPrice: expectedPrice }),
            );
        });

        //eslint-disable-next-line jest/no-disabled-tests
        it.skip('fired when search value changes', () => {
            const expectedSearchKey = 'search string';
            const element = createElement('c-product_filter', { is: ProductFilter });
            document.body.appendChild(element);
            const searchInput = element.querySelector('[data-src="searchKey"]');
            searchInput.value = expectedSearchKey;
            const changeEvent = new CustomEvent('change');
            searchInput.dispatchEvent(changeEvent);
            expect(pubsub.fire).toHaveBeenCalledWith(
                'filterChange',
                expect.objectContaining({ searchKey: expectedSearchKey }),
            );
        });

        //eslint-disable-next-line jest/no-disabled-tests
        it.skip('fired when checkbox is toggled', () => {
            const element = createElement('c-product_filter', { is: ProductFilter });
            element.commuter = false;
            document.body.appendChild(element);
            const commuterCheckbox = element.querySelector('[data-src="commuter"]');
            commuterCheckbox.checked = false;
            expect(pubsub.fire).toHaveBeenCalledWith('filterChange', expect.objectContaining({ commuter: false }));
        });
    });
});
