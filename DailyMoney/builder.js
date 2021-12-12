const { watch, readFileSync, writeFileSync, readdirSync, lstatSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

// See: https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/
const args = process.argv.slice(2);
const mode = args[0];
const srcDir = './src/';

if (mode === 'create') {
    console.log('🚧 Building...');
    if (!existsSync(srcDir)){
        mkdirSync(srcDir);
    }
    const htmlTemplate = /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>${args[1] || 'SIMPLE APP'}</title>
    <!-- Mobile viewport optimization h5bp.com/ad -->
    <meta name="HandheldFriendly" content="True">
    <meta name="MobileOptimized" content="320">
    <!-- <meta name="viewport" content="width=device-width"> -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <!-- iOS web app, delete if not needed. https://github.com/h5bp/mobile-boilerplate/issues/94 -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <script>
        // The script prevents links from opening in mobile safari. https://gist.github.com/1042026
        (function (a, b, c) { if (c in b && b[c]) { var d, e = a.location, f = /^(a|html)$/i; a.addEventListener("click", function (a) { d = a.target; while (!f.test(d.nodeName)) d = d.parentNode; "href" in d && (d.href.indexOf("http") || ~d.href.indexOf(e.host)) && (a.preventDefault(), e.href = d.href) }, !1) } })(document, window.navigator, "standalone")
    </script>
    <script>
        // Storage lib
        window.storage=(()=>{var n="localStorage"in window&&!!window.localStorage;return{set:function(t,e){return n?(e=e instanceof String?e:JSON.stringify(e),window.localStorage.setItem(t,e)):null},get:function(t){if(n){var e=window.localStorage.getItem(t);try{return JSON.parse(e)}catch(t){return e}}return null},remove:function(t){n&&window.localStorage.removeItem(t)},clear:function(){n&&window.localStorage.clear()}}})();
    </script>
    <script>
        function pint(v) {
            if (typeof v === 'string' && v.trim() === '') { return 0; }
            return parseInt(v, 10);
        }
        function pfloat(v) {
            if (typeof v === 'string' && v.trim() === '') { return 0; }
            let num = parseFloat(v);
            if (num < 0) { return 0; }
            return parseFloat(num.toFixed(2));
        }
        function byId(id) {
            return document.getElementById(id);
        }
    </script>
    <!-- Mobile IE allows us to activate ClearType technology for smoothing fonts for easy reading -->
    <meta http-equiv="cleartype" content="on">
    <!-- Application styles. -->
    <style type="text/css">
        html { font-size: 16px; }
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            position: relative;
        }
        .hide { display: none !important; }

        h1 {
            font-family: ArialRoundedMTBold, sans-serif;
        }

        .blur {
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            backdrop-filter: saturate(180%) blur(20px);
        }

        .sml-shadow {
            box-shadow: 2px 3px 6px 0px rgba(71, 71, 71, 0.5);
        }
        /*<%CSS%>*/
    </style>
</head>
<body>
    <main>
        <h1>${args[1] || 'SIMPLE APP'}</h1>
               
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
           /*<%JS%>*/
        });
    </script>
</body>
</html>
`;
    writeFileSync(`${srcDir}src.html`, htmlTemplate);
    console.log(`Project sources created! 🤖✨`);
}
else if (mode === 'watch') {
    let debounce = null;
    function assemble(js = '', css = '') {
        const srcHTML = path.join(srcDir, 'src.html');
        if (!existsSync(srcHTML)) {
            throw 'Unable to find src.html';
        }
        let html = readFileSync(srcHTML).toString();
        html = html.replace('/*<%JS%>*/', js).replace('/*<%CSS%>*/', css);
        writeFileSync('index.html', html);
        console.log('|');
        console.log('Done! ✨');
        console.log();
        console.log('Watching... 👀');
    }
    console.log('Watching... 👀');
    watch(srcDir, (eventType, filename) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            if (eventType === 'change' || eventType === 'rename') {
                //console.log(`event type is: ${eventType}`);
                const files = readdirSync(srcDir);
                let JS_CODE = '';
                let CSS_CODE = '';
                console.log('Building... 🚧');
                console.log('|');
                files.forEach((file) => {
                    if (!file.endsWith('.js') && !file.endsWith('css') && !file.endsWith('.html')) { return; }
                    const filePath = path.join(srcDir, file);
                    const fileStat = lstatSync(filePath);
                    if (fileStat.isFile()) {
                        //console.log(filePath);
                        let code = readFileSync(filePath).toString();
                        console.log('|---' + file);
                        if (file.endsWith('.js')) {
                            // LM: 2021-12-07 11:18:31 [Make sure that index.js is at the top]
                            if (file.startsWith('index.')) {
                                JS_CODE = ';' + code + ';' + JS_CODE;
                            }
                            else {
                                JS_CODE += ';' + code;
                            }
                            
                        }
                        else if (file.endsWith('.css')) {
                            CSS_CODE += code;
                        }
                    }
                });
                //console.log(JS_CODE, CSS_CODE);              
                assemble(JS_CODE, CSS_CODE);
            }
        }, 300);

    });
}