({
    initHandler : function(component, event, helper) {
        var action = component.get("c.getProducts");
        action.setCallback(this, function (response) {
            component.set("v.products", response.getReturnValue());
        });
        $A.enqueueAction(action);
    }
})
