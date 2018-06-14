public with sharing class ProductController {

    // TODO - is there value in defining a listView for Product__c and using @wire(getListUi, {...}) to fetch data
    // instead of using Apex? What guidance should we have for one vs the other?
    @AuraEnabled
    public static Product__c[] getProducts() {
        return [SELECT Id, Name, MSRP__c, Description__c, Category__c, Level__c, Picture_URL__c, Material__c
                FROM Product__c];
    }

}
