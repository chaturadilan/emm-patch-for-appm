var appm = (function () {

    var module = function (db,router) {

        var user = new userModule(db);
        var authRole = configs.appM.apiAuthRole;
        try{
            var basicAuthAdminCredentials = base64Decode(request.getHeader("Authorization").replace("Basic ", "")).split(":");
        }catch(e){
            return;
        }

        if(basicAuthAdminCredentials.length < 2){
            return;
        }

        var authUser = user.authenticate({'username': basicAuthAdminCredentials[0], 'password': basicAuthAdminCredentials[1]});
        if(authUser == null || !(authUser.tenantId === -1234 && authUser.roles.indexOf(authRole) > 0)){
            return;
        }

        var store = new storeModule(db);
        var driver = require('driver').driver(db);
        var sqlscripts = require('/sqlscripts/db.js');

        router.get('appm/devices/list/tenant/{+tenantId}/user/{+userId}', function(ctx){
            var devices = driver.query(sqlscripts.devices.select26, String(ctx.userId), ctx.tenantId);
            print(devices);
        });


        router.post('appm/operations/tenant/{+tenantId}', function(ctx){

            var deviceModule = require('device.js').device;
            var device = new deviceModule(db);


           // log.info("CTX >>>>>>>>>>>>>>>>>>>>>" + stringify(ctx));

            if(ctx.to === "device"){
                var payload = getPayloadByType(ctx.resources[0], ctx);
                //log.info("Payload >>>>>>>>>>>>>>>>>>>>>" + stringify(payload));
                device.sendToDevices(payload);

            }else if(ctx.to === "user"){

               // log.info("user >>>>>>>>>>");

                ctx.resources.forEach(function(username){
                    var devices = driver.query(sqlscripts.devices.select26, String(username), ctx.tenantId);
                    devices.forEach(function(deviceOfUser){
                        var payload = getPayloadByType(deviceOfUser.id, ctx);
                        device.sendToDevices(payload);
                    });
                });


            }else if(ctx.to === "role"){
                var carbon = require('carbon');
                var server = require('store').server
                var um = new carbon.user.UserManager(server, ctx.tenantId);

                ctx.resources.forEach(function(role){
                    var users = parse(stringify(um.getUserListOfRole(role)));
                    users.forEach(function(username){
                        var devices = driver.query(sqlscripts.devices.select26, String(username), ctx.tenantId);
                        devices.forEach(function(deviceOfUser){
                            var payload = getPayloadByType(deviceOfUser.id, ctx);
                            device.sendToDevices(payload);
                        });
                    });
                });

               // log.info("Role >>>>>>>>>>");
            }

        });

    };
    // prototype
    module.prototype = {
        constructor: module
    };
    // return module


    function getPayloadByType(deviceId, ctx){
        switch(ctx.app.type){
            case "webapp":
                var payload = {"devices" : [{"deviceid" : deviceId, "identity" : ctx.app.location, "platform_id" : ctx.app.platform, "type" : "Web App", "title" : ctx.app.name}], "operation" : "WEBCLIP"};
                break;
            case 'public':
                if(ctx.action === "install"){
                    var payload = {"devices" : [{"deviceid" : deviceId, "identity" : ctx.app.packageName, "platform_id" : ctx.app.platform, "type" : "Market"}], "operation" : "INSTALLAPP"};
                 }else{
                    var payload = {"devices" : [{"deviceid" : deviceId, "identity" : ctx.app.packageName, "platform_id" : ctx.app.platform, "type" : "Market"}], "operation" : "UNINSTALLAPP"};
                 }
                break;
            default:
                if(ctx.action === "install"){
                    var payload = {"devices" : [{"deviceid" : deviceId, "identity" : ctx.app.location, "platform_id" : ctx.app.platform, "type" : "Enterprise"}], "operation" : "INSTALLAPP"};
                 }else{
                    var payload = {"devices" : [{"deviceid" : deviceId, "identity" : ctx.app.location, "platform_id" : ctx.app.platform, "type" : "Enterprise"}], "operation" : "UNINSTALLAPP"};
                }
        }

        log.info("Payload : " + stringify(payload));
        return payload;
    }

    function base64Decode(s) {
        var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
        var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for(i=0;i<64;i++){e[A.charAt(i)]=i;}
        for(x=0;x<L;x++){
            c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
            while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
        }
        return r;
    };



    return module;
})();