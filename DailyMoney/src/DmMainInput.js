

class DmMainInput extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.$input = byId('input-sec__input');
        this.$incomeButton = byId('income-button');
        this.$expenseButton = byId('expense-button');
        this.$totalIncomeCon = this.querySelector('.input-sec__income-total');
        this.$totalExpenseCon = this.querySelector('.input-sec__expense-total');
        requestAnimationFrame(() => {
            this.$input.focus();
            this.updateTotals();
        });
        this.events();
    }

    reset() {
        this.$input.value = '';
    }

    getValue() {
        let val = this.$input.value.trim();
        val = pfloat(val);
        if (isNaN(val)) { return 0; }
        if (val < 0) { return 0; }
        return val;
    }

    updateTotals() {
        const { expenseTotal, incomeTotal } = appData.calculateTotalsForToday();
        this.$totalIncomeCon.textContent = formatNumber(incomeTotal);
        this.$totalExpenseCon.textContent = formatNumber(expenseTotal);
        this.$totalIncomeCon.setAttribute('data-clipboarditem', incomeTotal);
        this.$totalExpenseCon.setAttribute('data-clipboarditem', expenseTotal);
    }

    onExpense() {
        let val = this.getValue();
        if (val) {
            appData.addItemForToday(val, 1);
        }
        this.updateTotals();
        this.reset();
        triggerEvent(this, 'itemsUpdated');
    }

    onIncome() {
        let val = this.getValue();
        if (val) {
            appData.addItemForToday(val, 0);
        }
        this.updateTotals();
        this.reset();
        triggerEvent(this, 'itemsUpdated');
    }

    onTallyListDeletion() {
        this.updateTotals();
    }

    onClipboradCopy(e) {
        const $target = e.target;
        if ($target.getAttribute('data-clipboarditem')) {
            let copyItem = $target.getAttribute('data-clipboarditem');
            toClipboard(copyItem);
        }
    }

    onFocusCheck() {
        if (TODAY_KEY !== formatDate((new Date()).getTime())) {
            document.querySelector('main').classList.add('hide');
            document.body.style.backgroundImage = 'none';
            byId('relaunch-label').classList.remove('hide');
        }
    }

    events() {
        this.$incomeButton.addEventListener('click', this.onIncome.bind(this));
        this.$expenseButton.addEventListener('click', this.onExpense.bind(this)); 
        document.addEventListener('tallyTodayListDeletion', this.onTallyListDeletion.bind(this));
        this.addEventListener('click', this.onClipboradCopy.bind(this));
        this.$input.addEventListener('focus', this.onFocusCheck.bind(this));
    }

    render() {
        this.innerHTML = /*html*/ `
            <section class="input-sec">
                <div class="input-sec__totals-con">
                    <div class="input-sec__income-total">0.00</div>
                    <div class="input-sec__expense-total">0.00</div>
                </div>
                <input type="number" inputmode="decimal" placeholder="0.00" id="input-sec__input">
                <div class="input-sec__button-con">
                    <button id="income-button"><b>+</b> Income</button>
                    <button id="expense-button"><b>-</b> Expense</button>
                </div>
            </section>
        `;
    }

    disconnectedCallback() {
        this.$incomeButton.removeEventListener('click', this.onIncome.bind(this));
        this.$expenseButton.removeEventListener('click', this.onExpense.bind(this));
        document.removeEventListener('tallyTodayListDeletion', this.onTallyListDeletion.bind(this));
        this.removeEventListener('click', this.onClipboradCopy.bind(this));
        this.$input.removeEventListener('focus', this.onFocusCheck.bind(this));
    }
}

customElements.define('dm-main-input', DmMainInput);