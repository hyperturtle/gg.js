call cd src\assets
call cd css
call lessc -x style.less style.css
call cd ..\js
call del script.js
call more libs\json2.js >> script.js
REM call more libs\console.log.js >> script.js
REM call more libs\localstorage.js >> script.js
call more libs\underscore-min.js >> script.js
call more libs\soundmanager2-nodebug-jsmin.js >> script.js
REM call more libs\soundmanager2.js >> script.js
call coffee -bpj script.js gg.coffee script.coffee >> script.js
call uglifyjs -mt -o script.min.js script.js
