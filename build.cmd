call cd src\assets
call cd css
call lessc -x style.less style.css
call cd ..\js
call coffee -c script.coffee
call uglifyjs -o script.min.js script.js
