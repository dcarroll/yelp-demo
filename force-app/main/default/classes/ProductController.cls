public with sharing class ProductController {

    @AuraEnabled
    public static Product__c[] getProducts() {
        return [SELECT Id, Name, MSRP__c, Description__c, Category__c, Gender__c, Picture_URL__c, Material__c
                FROM Product__c];
    }

}
