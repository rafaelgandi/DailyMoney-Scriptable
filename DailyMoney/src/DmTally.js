
const daysArr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];


class DmTally extends HTMLElement {
    constructor() {
        super();
        this.lastScrollPos = 0;
    }

    connectedCallback() {
        this.render();
        this.$mainInputComponent = document.querySelector('dm-main-input');
        this.$todayList = byId('tally-sec__today-list');
        this.$prevDaysCon = byId('tally-sec__prev-days-con');
        this.$emptyTodayCon = byId('hooray-empty');
        this.events();
    }

    refreshAllList() {
        this.$todayList.innerHTML = this.buildTodayList();
        this.$prevDaysCon.innerHTML = this.buildTallyLists();
    }

    onItemsUpdated() {
        this.$todayList.innerHTML = this.buildTodayList();
    }

    onDelete(e) {
        const $target = e.target;
        if ($target?.classList.contains('tally-sec__delete-item-button')) {
            doConfirm('Delete', () => {
                const dateKey = $target.getAttribute('data-tally-date').trim();
                const itemTimestamp = pint($target.getAttribute('data-item-timestamp'));
                appData.deleteItem(dateKey, itemTimestamp);
                this.refreshAllList();
                triggerEvent(document, 'tallyTodayListDeletion');
            });
        }
        if ($target?.classList.contains('tally-sec__delete-button')) {
            const dateKey = $target.getAttribute('data-tally-date').trim();
            doConfirm(`Delete ${dateKey} Items`, () => {
                appData.deleteDate(dateKey);
                // this.$prevDaysCon.innerHTML = this.buildTallyLists();
                this.refreshAllList();
            });
        }
    }

    buildTodayList() {
        let html = '';
        let hasItems = false;
        Object.keys(APP_DATA.days).forEach((key) => {
            if (key === TODAY_KEY) {
                hasItems = APP_DATA.days[key].length;
                APP_DATA.days[key].map((item) => {
                    html += /*html*/ `
                    <li>
                        <button class="tally-sec__delete-item-button" data-item-timestamp="${item.timestamp}" data-tally-date="${key}">🗑</button>
                        <time>${formatTime(item.timestamp)}</time>
                        <i class="${(item.isExpense) ? 'is-expense' : 'is-income'}">${formatNumber(item.value)}</i>
                    </li>
                    `;
                });
            }
        });
        requestAnimationFrame(() => {
            this.$emptyTodayCon.classList[(hasItems) ? 'add' : 'remove']('hide');
            this.$todayList.classList[(hasItems) ? 'remove' : 'add']('hide');
        });
        return html;
    }

    buildTallyLists() {
        let html = '';
        Object.keys(APP_DATA.days).forEach((key) => {
            if (key !== TODAY_KEY) {
                if (!APP_DATA.days[key].length) {
                    // Delete empty days
                    delete APP_DATA.days[key];
                    return;
                }
                const { expenseTotal, incomeTotal } = appData.calculateTotalsForDate(key);
                html += /*html*/ `
                <div class="tally-sec__con tally-sec__con--prev-dates">
                    <label>${daysArr[(new Date(key)).getDay()]}  ${key}</label> 
                    <div class="tally-sec__totals-con">
                        <div class="tally-sec__income-total">${formatNumber(incomeTotal)}</div>
                        <div class="tally-sec__expense-total">${formatNumber(expenseTotal)}</div>
                    </div>
                    <ul class="tally-sec__item-list">
                        ${(() => {
                        let listHtml = '';
                        APP_DATA.days[key].map((item) => {
                            listHtml += /*html*/ `
                                <li>
                                    <button class="tally-sec__delete-item-button" data-item-timestamp="${item.timestamp}" data-tally-date="${key}">🗑</button>
                                    <time>${formatTime(item.timestamp)}</time>
                                    <i class="${(item.isExpense) ? 'is-expense' : 'is-income'}">${formatNumber(item.value)}</i>
                                </li>
                                `;
                        });
                        return listHtml;
                    })()}
                    </ul>
                    <button class="tally-sec__delete-button" data-tally-date="${key}">Delete</button>
                </div>
                `;
            }
        });
        return html;
    }

    events() {
        this.$mainInputComponent.addEventListener('itemsUpdated', this.onItemsUpdated.bind(this));
        this.addEventListener('click', this.onDelete.bind(this));
    }

    render() {
        this.innerHTML = /*html*/ `
        <section class="tally-sec">
            <div class="tally-sec__con tally-sec__con--today">
                <label>Today</label> 
                <div id="hooray-empty"><span>🎉</span></div>
                <ul id="tally-sec__today-list" class="tally-sec__item-list hide">
                    ${this.buildTodayList()}
                </ul>
            </div>
            <!-- ========= -->
            <div id="tally-sec__prev-days-con"></div>          
        </section>
        `;
        requestAnimationFrame(() => {
            this.$prevDaysCon.innerHTML = this.buildTallyLists();
        });
    }

    disconnectedCallback() {
        this.$mainInputComponent.removeEventListener('itemsUpdated', this.onItemsUpdated.bind(this));
        this.removeEventListener('click', this.onDelete.bind(this));
    }
}

customElements.define('dm-tally', DmTally);