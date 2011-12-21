if (!window.localStorage){
    function createCookie(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    }
     
    function readCookie(name){
        var result = ""
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' '){
                c = c.substring(1,c.length);    
            } 
            if (c.indexOf(nameEQ) == 0){
                result = c.substring(nameEQ.length,c.length);
            }else{
                result = "";
            }
        }
        return(result);
    }
    
    localStorage = (function () {
        return {
            setItem: function (key, value) {
                createCookie(key, value, 3000)
            },
             
            getItem: function (key) {
                return(readCookie(key));
            }
        };
    })();
}