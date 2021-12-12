window.appData = {

    makeTodayIfNotExists() {
        if (!APP_DATA.days?.[TODAY_KEY]) {
            APP_DATA.days[TODAY_KEY] = [];
        }
       
    },

    addItemForToday(value, isExpense = 1) {
        appData.makeTodayIfNotExists();
        APP_DATA.days[TODAY_KEY].push({
            timestamp: (new Date()).getTime(),
            value: pfloat(value),
            isExpense
        });
        appData.sortDataByTime();
        saveData();
    },

    calculateTotalsForToday() {
        appData.makeTodayIfNotExists();
        let incomeTotal = 0,
            expenseTotal = 0;
        APP_DATA.days[TODAY_KEY].map((item) => {
            if (item.isExpense) {
                expenseTotal += pfloat(item.value);
            }
            else {
                incomeTotal += pfloat(item.value);
            }
        });   
        return {expenseTotal, incomeTotal}; 
    },

    calculateTotalsForDate(dateKey) {
        appData.makeTodayIfNotExists();
        let incomeTotal = 0,
            expenseTotal = 0;
        APP_DATA.days[dateKey].map((item) => {
            if (item.isExpense) {
                expenseTotal += pfloat(item.value);
            }
            else {
                incomeTotal += pfloat(item.value);
            }
        });   
        return {expenseTotal, incomeTotal}; 
    },

    sortDataByTime() {
        Object.keys(APP_DATA.days).forEach((key) => {
            APP_DATA.days[key].sort((a, b) => {
                if (a.timestamp < b.timestamp) {
                    return 1;
                }
                if (a.timestamp > b.timestamp) {
                    return -1;
                }
                return 0;
            });
        });
        appData.sortDataByDate();
    },

    sortDataByDate() {
        let copy = {};
        let dates = Object.keys(APP_DATA.days);
        dates.sort((a, b) => {
            let aTimestamp = (new Date(a)).getTime();
            let bTimestamp = (new Date(b)).getTime();
            if (aTimestamp < bTimestamp) {
                return 1;
            }
            if (aTimestamp > bTimestamp) {
                return -1;
            }
            return 0;
        });
        dates.forEach((date) => {
            copy[date] = (APP_DATA.days[date]);
        });
        //console.log(copy);
        APP_DATA.days = copy;
    },
   
    deleteItem(dateKey, itemTimestamp) {
        if (APP_DATA.days?.[dateKey]) {
            APP_DATA.days[dateKey] = APP_DATA.days[dateKey].filter((item) => {
                return pint(item.timestamp) !== itemTimestamp;
            });
            appData.sortDataByTime();
            saveData();
        }
    },

    deleteDate(dateKey) {
        if (APP_DATA.days?.[dateKey]) {
            delete APP_DATA.days[dateKey];
            appData.sortDataByTime();
            saveData();
        }
    }

};