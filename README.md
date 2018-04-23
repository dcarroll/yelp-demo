## Electric Bike Company Sample App

## Installation Instructions

1. Authenticate with your hub org (if not already done):
    ```
    sfdx force:auth:web:login -d -a myhuborg
    ```

1. Clone the repository:
    ```
    git clone https://github.com/forcedotcom/ebikes-lwc
    cd northern-trail
    ```

1. Create a scratch org and provide it with an alias (nto):
    ```
    sfdx force:org:create -s -f config/project-scratch-def.json -a ebikes --setdefaultusername
    ```

1. Push the app to your scratch org:
    ```
    sfdx force:source:push
    ```

1. Assign the nto permission set to the default user:
    ```
    sfdx force:user:permset:assign -n bikes
    ```

1. Load sample data:
    ```
    sfdx force:data:tree:import --plan ./data/Product__c-plan.json
    ```

1. Open the scratch org:
    ```
    sfdx force:org:open
    ```

1. In App Launcher, select the **oZo bicycles app**