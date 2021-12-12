
class CfConfirmDialog extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.$backDrop = this.querySelector('.dialog-backdrop');
        this.$dialog = byId('confirm-dialog');
        this.events();
    }

    hide() {
        this.$backDrop.classList.add('hide');
        this.$dialog.classList.add('hide');
    }

    show() {
        this.$backDrop.classList.remove('hide');
        this.$dialog.classList.remove('hide');
    }

    confirmed() {
        triggerEvent(this, 'confirm');
    }

    onButtonClicked(e) {
        e.preventDefault();
        const $me = e.target;
        if ($me?.classList.contains('confirm-dialog__action')) {
            e.stopPropagation();
            this.confirmed();
            this.hide();
        }
        else if ($me?.classList.contains('confirm-dialog__cancel')) {
            e.stopPropagation();
            this.hide();
        }
    }

    onShow(e) {
        let label = e?.detail?.label ?? 'Delete';
        this.querySelector('button.confirm-dialog__action').textContent = label;
        this.show();
    }

    onHide() {
        this.hide();
    }

    events() {
        this.addEventListener('click', this.onButtonClicked.bind(this));
        this.addEventListener('show', this.onShow.bind(this));
        this.$backDrop.addEventListener('click', this.onHide.bind(this));
    }

    render() {

        this.innerHTML = /*html*/`
            <div id="confirm-dialog" class="blur sml-shadow dialog hide">
                <button class="confirm-dialog__action">Delete</button>
                <button class="confirm-dialog__cancel">Cancel</button>
            </div>
            <div class="dialog-backdrop hide"></div>
        `;
    }

    diconnectedCallback() {
        this.removeEventListener('click', this.onButtonClicked.bind(this));
        this.removeEventListener('show', this.onShow.bind(this));
        this.$backDrop.removeEventListener('click', this.onHide.bind(this));
    }
}
customElements.define('cf-confirm-dialog', CfConfirmDialog);

function doConfirm(label = 'Delete', callback = null) {
    callback = callback ?? (() => {});
    const $confirmElement = document.querySelector('cf-confirm-dialog');
    function confirm() {
        callback();
        $confirmElement?.removeEventListener('confirm', confirm);
    }
    $confirmElement?.removeEventListener('confirm', confirm);
    triggerEvent($confirmElement, 'show', {
        label
    });
    $confirmElement?.addEventListener('confirm', confirm);
}