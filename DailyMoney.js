// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: gray;
// icon-glyph: money-bill-alt;


const fm = FileManager.iCloud();
const htmlSourcePath = fm.documentsDirectory() + `/DailyMoney/index.html`;
const dbSourcePath = fm.documentsDirectory() + `/DailyMoney/db.json`;

await fm.downloadFileFromiCloud(htmlSourcePath);
await fm.downloadFileFromiCloud(dbSourcePath);
if (!fm.fileExists(dbSourcePath)) { 
    fm.writeString(dbSourcePath, '{}');
}

let rawDbData = fm.readString(dbSourcePath);
if (rawDbData.trim() === '') {
    rawDbData = '{}';
}

let APP_DATA = JSON.parse(rawDbData);
if (!('days' in APP_DATA)) {
    APP_DATA['days'] = {};
}

function saveData(appData) {
    fm.writeString(dbSourcePath, appData);
}

function ymd() {
    let date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth();
    let d = date.getDate();
    return `${y}-${m}-${d}`;
}

function isJSON(str) {
    try {
        return (JSON.parse(str) && !!str);
    } catch (e) {
        return false;
    }
}

function ensureDataIntegrity(dataStr) {
    if (isJSON(dataStr)) {
        let data = JSON.parse(dataStr)
        if (!data?.days) {
            return JSON.stringify({days: {}});
        }
        return JSON.stringify(data);
    }
    else {
        return JSON.stringify({days: {}});
    }
}

let htmlSource = fm.readString(htmlSourcePath);
htmlSource = htmlSource.replace('<<SCRIPTABLE>>', 'scriptable');
htmlSource = htmlSource.replace('"<<APP_DATA>>"', ensureDataIntegrity(JSON.stringify(APP_DATA)));
const wv = new WebView();
function watcher() {
    wv.evaluateJavaScript(`console.log('watcher activated...');`, true).then((appData) => {
        console.log(appData);
        saveData(ensureDataIntegrity(appData));
        watcher();       
    });
}
wv.loadHTML(htmlSource);
watcher();
// Make sure to call .present() last to avoid errors
wv.present(true).then(() => {
    
});
