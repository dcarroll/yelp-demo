public with sharing class OrderController {

    @AuraEnabled(Cacheable=true)
    public static Order_Item__c[] getOrderItems(Id orderId) {
        return [SELECT Id, Product__r.Name, Product__r.MSRP__c, Product__r.Picture_URL__c, Qty_S__c, Qty_M__c, Qty_L__c, Price__c
            FROM Order_Item__c WHERE Order__c = :orderId];
    }

    @AuraEnabled
    public static void deleteOrderItem(Id orderItemId) {
        Order_Item__c orderItem = new Order_Item__c(Id = orderItemId);
        delete orderItem;
    }

}
