import { createElement } from 'engine';
import ProductTitleList from 'c-product_tile_list';
import { registerLdsTestWireAdapter } from 'wire-service-jest-util';
import { getListUi } from 'lightning-ui-api-list-ui';
import pubsub from 'c-pubsub';

// Jest does not know how to resolve Salesforce specific imports like @apex so we need to mock it
// this will be done automatically in Winter '19
jest.mock(
    '@apex/ProductController.getProducts',
    () => {
        return {
            getProducts: jest.fn(),
        };
    },
    { virtual: true },
);

// use the wire-service-jest-util to manually emit data through the wire adapters
const getListUiAdapter = registerLdsTestWireAdapter(getListUi);

/*
 * Import a snapshot of getListUi's response for functional verification. This eliminates
 * the need to connect to an org to retrieve data, which allows for running all unit tests
 * on localhost (aka offline).
 *
 * This data can be captured using a REST client accessing the UI API resource which the
 * @wire(getListUi) represents: /ui-api/mru-list-ui/${objectApiName}. Documentation for
 * this UI API resource is at
 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_resources_mru_list_views_records_md.htm
 *
 * Community-provided instructions for access Salesforce REST resources is at
 * https://blog.mkorman.uk/using-postman-to-explore-salesforce-restful-web-services/
 */
const mockGetListUi = require('./data/getListUi.json');

describe('c-product_tile_list', () => {
    afterEach(() => {
        // jsdom instance shared across test cases in a single file
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        // prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
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
            getListUiAdapter.emit({ records: { records: [] } });
            // return a promise to wait for any asynchronous DOM updates. Jest
            // will automatically wait for the Promise chain to complete before
            // ending the test and fail the test if the Promise ends in the
            // rejected state
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
            getListUiAdapter.emit(mockGetListUi);
            document.body.appendChild(element);
            return Promise.resolve().then(() => {
                const content = element.querySelector('.content');
                expect(content.textContent).not.toBe(expected);
            });
        });

        it('renders a c-product_tile for each product item', () => {
            const element = createElement('c-product_tile_list', { is: ProductTitleList });
            document.body.appendChild(element);
            getListUiAdapter.emit(mockGetListUi);
            return Promise.resolve().then(() => {
                const productTiles = element.querySelectorAll('c-product_tile');
                expect(productTiles).toHaveLength(mockGetListUi.records.records.length);
            });
        });

        it('applies maxPrice filter when filterChange event is fired', () => {
            const filter = {
                aluminum: true,
                beginner: true,
                carbon: true,
                commuter: true,
                enthusiast: true,
                maxPrice: 7000, // this will filter out the $7,800 bike
                mountain: true,
                racer: true,
                searchKey: '',
            };

            const element = createElement('c-product_tile_list', { is: ProductTitleList });
            document.body.appendChild(element);
            getListUiAdapter.emit(mockGetListUi);
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
