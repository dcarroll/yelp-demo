import { createElement } from 'engine';
import ProductTitleList from 'c-product_tile_list';
import { registerTestWireAdapter } from 'wire-service-jest-util';
import { getProducts } from '@apex/ProductController.getProducts';
import pubsub from 'c-pubsub';

jest.mock(
    '@apex/ProductController.getProducts',
    () => {
        return {
            getProducts: jest.fn(),
        };
    },
    { virtual: true },
);

const getProductsTestAdapter = registerTestWireAdapter(getProducts);

const mockRecords = [
    {
        Category__c: 'Mountain',
        Description__c:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        Id: 'a02Z000000L5kXVIAZ',
        Level__c: 'Racer',
        MSRP__c: 10000,
        Material__c: 'Carbon',
        Name: 'MODEL A',
        Picture_URL__c: 'https://foo.jpeg',
    },
    {
        Category__c: 'Mountain',
        Description__c:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        Id: 'a02Z000000L5kXWIAZ',
        Level__c: 'Racer',
        MSRP__c: 7800,
        Material__c: 'Carbon',
        Name: 'DYNAMO X1',
        Picture_URL__c: 'https://foo.jpeg',
    },
];

describe('c-product_tile_list', () => {
    afterEach(() => {
        // jsdom instance shared across test cases in a single file
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('no products', () => {
        it('displays "no products" message', () => {
            const expected = 'There are no products matching your current selection';
            const element = createElement('c-product_tile_list', { is: ProductTitleList });
            document.body.appendChild(element);
            const content = element.querySelector('.content');
            expect(content.textContent).toBe(expected);
        });

        it('does not render any c-product_tile components', () => {
            const element = createElement('c-product_tile_list', { is: ProductTitleList });
            document.body.appendChild(element);
            getProductsTestAdapter.emit({ data: [] });
            return Promise.resolve().then(() => {
                const productTiles = element.querySelectorAll('c-product_tile');
                expect(productTiles).toHaveLength(0);
            });
        });
    });

    describe('with products', () => {
        it('does not display "no products" message', () => {
            const expected = 'There are no products matching your current selection';
            const element = createElement('c-product_tile_list', { is: ProductTitleList });
            document.body.appendChild(element);
            getProductsTestAdapter.emit({ data: mockRecords });
            return Promise.resolve().then(() => {
                const content = element.querySelector('.content');
                expect(content.textContent).not.toBe(expected);
            });
        });

        it('renders a c-product_tile for each product item', () => {
            const element = createElement('c-product_tile_list', { is: ProductTitleList });
            document.body.appendChild(element);
            getProductsTestAdapter.emit({ data: mockRecords });
            return Promise.resolve().then(() => {
                const productTiles = element.querySelectorAll('c-product_tile');
                expect(productTiles).toHaveLength(mockRecords.length);
            });
        });

        it('applies maxPrice filter when filterChange event is fired', () => {
            const filter = {
                aluminum: true,
                beginner: true,
                carbon: true,
                commuter: true,
                enthusiast: true,
                maxPrice: 9999, // this will filter out the $10,000 bike
                mountain: true,
                racer: true,
                searchKey: '',
            };

            const element = createElement('c-product_tile_list', { is: ProductTitleList });
            document.body.appendChild(element);
            getProductsTestAdapter.emit({ data: mockRecords });
            let originalProductCount;

            return Promise.resolve()
                .then(() => {
                    originalProductCount = element.querySelectorAll('c-product_tile').length;
                    pubsub.fire('filterChange', filter);
                })
                .then(() => {
                    const productTiles = element.querySelectorAll('c-product_tile');
                    expect(productTiles).toHaveLength(originalProductCount - 1);
                });
        });
    });
});
