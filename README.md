## oZo Bicycles Lightning Web Components Sample App [![CircleCI](https://circleci.com/gh/forcedotcom/ebikes-lwc.svg?style=svg&circle-token=9ec6704318a45814d2e03c0076b7757c8d15cebd)](https://circleci.com/gh/forcedotcom/ebikes-lwc)

oZo bicycles is a fictitious electric bike manufacturer. This sample app demonstrates how to build applications on the Salesforce platform using Lightning web components. The application allows oZo to manage its products and its relationships with resellers.

### Required

To work with this samples repo, install these tools.

- **An Org Configured as a Dev Hub**

    We recommend that you use a Dev Hub org dedicated to the pilot, and don't mix your Lightning web components evaluation with your normal development efforts.

    * <a href="https://developer.salesforce.com/promotions/orgs/dx-signup" target="_blank">Salesforce DX org sign-up</a>

    The pilot coordinator must enable Lightning Web Components for your Dev Hub org. Send the Dev Hub org ID to the pilot coordinator via the [**Lightning Web Components - Pilot**](https://org62.lightning.force.com/one/one.app#/chatter/record/0F90M0000004r9GSAQ) Chatter group.

    To find your org ID, from Setup, enter *company* in the **Quick Find** box, then select **Company Information**.

- **The Salesforce CLI and `salesforcedx` Plugin.**

    To install the Salesforce CLI, start here: <a href="https://developer.salesforce.com/tools/sfdxcli" target="_blank">Salesforce CLI</a>

    If you've already installed the Salesforce CLI, update your plugins.
    ```bash
    sfdx plugins:update
    ```

    The installed version of the salesforcedx plugin must support API version 42.0 or later. Check the API version.
    ```bash
    sfdx plugins --core
    ```
- **Git**

   Install [Git](https://help.github.com/articles/set-up-git/)

- **Node.js**

   Install [Node.js](https://nodejs.org)

### Highly Recommended Tools

We want you to enjoy developing Lightning web components as much as we do, so we've created an extension for Visual Studio Code that provides code completion, static analysis, compiler validation as you type, and lots more. You can also run Salesforce CLI commands right from Visual Studio Code. We're really looking forward to your feedback about these tools, so we hope you use them!

* Install [Visual Studio Code](https://code.visualstudio.com/)

* Install [Salesforce Extensions for VS Code](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)

* Install [LWC Code Editor for Visual Studio](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-lwc)

    To learn how to use the extension, check out the [ReadMe](/docs/README_vscode_extension.md).


## Installation Instructions

1. Authenticate with your hub org (if not already done):
    ```
    sfdx force:auth:web:login -d -a myhuborg
    ```

1. Clone the repository:
    ```
    git clone https://github.com/forcedotcom/ebikes-lwc
    cd ebikes-lwc
    ```

1. Install dependencies:
    ```
    npm install
    ```

1. Create a scratch org and provide it with an alias (nto):
    ```
    sfdx force:org:create -s -f config/project-scratch-def.json -a ebikes
    ```

1. Push the app to your scratch org:
    ```
    sfdx force:source:push
    ```

1. Assign the **bikes** permission set to the default user:
    ```
    sfdx force:user:permset:assign -n bikes
    ```

1. Load sample data:
    ```
    sfdx force:data:tree:import --plan ./data/Product__c-plan.json
    sfdx force:data:tree:import --plan ./data/Account__c-plan.json
    ```

1. Open the scratch org:
    ```
    sfdx force:org:open
    ```

1. In App Launcher, select the **oZo bicycles** app.

## Application Walkthrough

1. Click the **Product Explorer** tab.

1. Filter the list using the filter component in the left sidebar.

1. Click a product in the tile list to see the details in the product card.

### Reseller Orders

1. Click the down arrow on the **Reseller Order** tab and click **New Reseller Order**.

1. Select an account, for example **Wheelworks** and click **Save**.

1. Drag a product from the product list on the right onto the gray panel in the center. The product is automatically added to the order as an order item.

1. Modify the ordered quantity for small (S), medium (M), and large (L) frames and click the save button (checkmark icon).

1. Repeat steps 3 and 4 to add more products to the order.

1. Mouse over an order item tile and click the trash can icon to delete an order item from the order.

## Code Highlights

### Product Explorer

- In [ProductTileList](force-app/main/default/lightningcomponents/product_tile_list/product_tile_list.js), the list of products is retrieved by invoking ```getProducts()``` in the [ProductController](force-app/main/default/classes/ProductController.cls) Apex class.

- [pubsub](force-app/main/default/lightningcomponents/pubsub/pubsub.js) is a custom utility that provides a minimalistic implementation of an event broker to support inter-component communication in App Builder. This capability was previously supported using **application events** in Aura.

- In [ProductTile](force-app/main/default/lightningcomponents/product_tile/product_tile.js), we use the [pubsub](force-app/main/default/lightningcomponents/pubsub/pubsub.js) utility to publish a ```productSelected``` event when the user selects a product by clicking a product tile.

- [ProductCard](force-app/main/default/lightningcomponents/product_card/product_card.js) uses the [pubsub](force-app/main/default/lightningcomponents/pubsub/pubsub.js) utility to register a listener for the ```productSelected``` event. When a ```productSelected``` event is published, we set the ```recordId``` to the id of the product that was selected. The Lightning Data Service then automatically retrieves the data for the newly selected product.

    ```
    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (data) {
            this.product = data.fields;
        }
    }
    ```

- [ProductFilter](force-app/main/default/lightningcomponents/product_filter/product_filter.js) uses the [pubsub](force-app/main/default/lightningcomponents/pubsub/pubsub.js) utility to publish a ```filterChange``` event when the user changes the filters.

- [ProductTileList](force-app/main/default/lightningcomponents/product_tile_list/product_tile_list.js) uses the [pubsub](force-app/main/default/lightningcomponents/pubsub/pubsub.js) utility to register a listener for the ```filterChange``` event. When a ```filterChange``` event is published, we filter the list based on the new criteria.

### Reseller Orders

- In [OrderBuilder](force-app/main/default/lightningcomponents/order_builder/order_builder.js), the list of order items is retrieved by invoking ```getOrderItems()``` in the [ProductController](force-app/main/default/classes/ProductController.cls) Apex class.

- In [OrderItemTile](force-app/main/default/lightningcomponents/order_item_tile/order_item_tile.js), we use the Lightning Data Service to retrieve the product data.

    ```
    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (data) {
            this.product = data.fields.Product__r.value;
        }
    }
    ```

- In [OrderItemTile](force-app/main/default/lightningcomponents/order_item_tile/order_item_tile.html), we use ```lightning-record-edit-form``` to edit the order item (change price and quantities) without code. When the changes are submitted, we use the ```formSuccessHandler``` handler to fire an ```orderitemchange``` event. The parent component ([OrderBuilder](force-app/main/default/lightningcomponents/order_builder/order_builder.js)) handles the event to display the updated order total.

- In [OrderBuilder](force-app/main/default/lightningcomponents/order_builder/order_builder.js), we use the ```getRecordCreateDefaults``` function of the Lightning Data Service to obtain the default values for an Order_Item__c record. These default values are used when creating new order items.

    ```
    @wire(getRecordCreateDefaults, { apiName: 'Order_Item__c' })
    defaults;
    ```

- When a product is dropped in the order items area, we use ```createRecordInputFromRecord``` to prepare a new order item record using the default values obtained using ```getRecordCreateDefaults```. We then override the default values with the order id, the product id, and the product price, and we create the record using the ```createRecord``` function of the Lightning Data Service.

- In [OrderItemTile](force-app/main/default/lightningcomponents/order_item_tile/order_item_tile.html), an ```orderitemdelete``` event is fired when the user clicks the delete button. The parent component ([OrderBuilder](force-app/main/default/lightningcomponents/order_builder/order_builder.js)) handles the event and calls ```deleteOrderItem()``` in the [ProductController](force-app/main/default/classes/ProductController.cls) Apex class.
