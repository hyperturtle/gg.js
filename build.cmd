call cd src\assets
call cd css
call lessc -x style.less style.css
call cd ..\js
call coffee -cj script.js gg.coffee script.coffee
call more libs\json2.js >> script.js
call more libs\console.log.js >> script.js
call more libs\localstorage.js >> script.js
call uglifyjs -mt -o script.min.js script.js