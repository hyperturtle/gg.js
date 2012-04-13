call cd assets
call cd css
call lessc -x style.less style.css
call cd ..\js
call del script.js
call del gg.js
call more libs\json2.js >> script.js
call more libs\underscore-min.js >> script.js
call cp script.js gg.js
call coffee -bpj script.js gg.coffee script.coffee >> script.js
call coffee -bp gg.coffee >> gg.js
call uglifyjs -mt -o script.min.js script.js
call uglifyjs -mt -o gg.min.js gg.js
call cd ..\..