window.onerror = (e) => {
    console.log(e);
};

const TODAY = new Date();
const TODAY_KEY = formatDate(TODAY.getTime());

const IS_SCRIPTABLE = "<<SCRIPTABLE>>" === 'scriptable';
let APP_DATA = (IS_SCRIPTABLE) ? "<<APP_DATA>>" : {
    'days': {}
};

// If not in Scriptable environment. On development mode.
if (!window.completion) { 
    window.completion = (str) => {
        try {
            localStorage.setItem('DM', str);
        } catch (err) {}              
    }; 
    // try-catch needed because ios webview throws "insecure operation" error on
    // localStorage.
    try {
        if (window?.localStorage.getItem('DM')) {
            APP_DATA = JSON.parse(localStorage.getItem('DM'));
        }
    }
    catch (err) {}
}

const saveData = (() => {
    let debouncer = null;
    return () => {
        clearTimeout(debouncer);
        debouncer = setTimeout(() => {
            appData.sortDataByTime();
            completion(JSON.stringify(APP_DATA));
        }, 1e3);
    };
})();


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
function formatNumber(num) {
    num = parseFloat(num);
    // See: https://blog.abelotech.com/posts/number-currency-formatting-javascript/
    return num.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
function triggerEvent(parent, eventName, data = null) {
    parent.dispatchEvent(new CustomEvent(eventName, {
        detail: data
    }));
}
function formatDate(timestamp) {
    const d = new Date(timestamp);
    let date = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    if (date < 10) {
        date = '0' + date;
    }
    if (month < 10) {
        month = '0' + month;
    }
    return `${year}-${month}-${date}`;
}

function formatTime(timestamp) {
    const d = new Date(timestamp);
    let hr = d.getHours();
    let meridiem = 'AM';
    if (hr >= 12) { meridiem = 'PM'; }
    if (hr > 12) { hr = hr - 12; }  
    let min = d.getMinutes();
    if (min < 10) {
        min = '0' + min;
    }
    if (hr < 10) {
        hr = '0' + hr;
    }
    return `${hr}:${min} ${meridiem}`;
}

function toClipboard(text) {
    let input = document.createElement("textarea");
    input.style.opacity = "0";
    input.style.position = "fixed";
    input.value = text;
    document.body.appendChild(input);
    input.focus();
    input.setSelectionRange(0, input.value.length);
    document.execCommand("Copy");
    input.remove();
}
