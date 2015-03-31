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



        router.get('appm/devices/list/tenant/{+tenantId}/user/{+userId}', function(ctx){
            print(ctx);
        });
    };
    // prototype
    module.prototype = {
        constructor: module
    };
    // return module



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