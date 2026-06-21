import {OperationsService} from "./services/operations-service.js";
import {CategoriesService} from "./services/categories-service.js";
import {refreshBalance} from "../utils/sidebar.js";

const DELETE_ICON_SVG = `<svg class="deleteThisTurnover" width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.5C4.27614 5.5 4.5 5.72386 4.5 6V12C4.5 12.2761 4.27614 12.5 4 12.5C3.72386 12.5 3.5 12.2761 3.5 12V6C3.5 5.72386 3.72386 5.5 4 5.5Z" fill="black"/><path d="M6.5 5.5C6.77614 5.5 7 5.72386 7 6V12C7 12.2761 6.77614 12.5 6.5 12.5C6.22386 12.5 6 12.2761 6 12V6C6 5.72386 6.22386 5.5 6.5 5.5Z" fill="black"/><path d="M9.5 6C9.5 5.72386 9.27614 5.5 9 5.5C8.72386 5.5 8.5 5.72386 8.5 6V12C8.5 12.2761 8.72386 12.5 9 12.5C9.27614 12.5 9.5 12.2761 9.5 12V6Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13 3C13 3.55228 12.5523 4 12 4H11.5V13C11.5 14.1046 10.6046 15 9.5 15H3.5C2.39543 15 1.5 14.1046 1.5 13V4H1C0.447715 4 0 3.55228 0 3V2C0 1.44772 0.447715 1 1 1H4.5C4.5 0.447715 4.94772 0 5.5 0H7.5C8.05229 0 8.5 0.447715 8.5 1H12C12.5523 1 13 1.44772 13 2V3ZM2.61803 4L2.5 4.05902V13C2.5 13.5523 2.94772 14 3.5 14H9.5C10.0523 14 10.5 13.5523 10.5 13V4.05902L10.382 4H2.61803ZM1 3V2H12V3H1Z" fill="black"/></svg>`;

const EDIT_ICON_SVG = `<svg class="editThisTurnover" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/></svg>`;

export class Turnovers {
    constructor() {
        this.incomesCategoriesService = new CategoriesService('income');
        this.expensesCategoriesService = new CategoriesService('expense');

        this.newIncomeBtn = document.querySelector('#newIncome');
        this.newExpenseBtn = document.querySelector('#newExpense');
        this.filters = document.querySelector('.mainInfo-filtersStroke');
        this.filterItems = document.querySelectorAll('.mainInfo-filter');
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');

        this.operationsList = document.getElementById('operationsList');
        this.createTurnover = document.querySelector('.createTurnover');
        this.cancelCreateTurnover = document.querySelector('.cancelCreateTurnover');
        this.newTurnover = document.querySelector('.newTurnover');
        this.mainTitle = document.querySelector('.mainTitle');

        this.typeSelect = document.getElementById('turnoverType');
        this.categorySelect = document.getElementById('turnoverCategory');
        this.amountInput = document.getElementById('turnoverAmount');
        this.dateInput = document.getElementById('turnoverDate');
        this.commentInput = document.getElementById('turnoverComment');
        this.confirmBtn = document.getElementById('confirmTurnover');

        this.errors = {
            category: document.getElementById('categoryError'),
            amount: document.getElementById('amountError'),
            date: document.getElementById('dateError'),
            comment: document.getElementById('commentError'),
        };

        this.popup = document.querySelector('.popup-overlay');

        this.currentPeriod = 'today';
        this.operationIdToDelete = null;
        this.operationIdToEdit = null;

        this.processBindings();
        this.loadOperations();
    }


    async loadOperations() {
        const filter = {period: this.currentPeriod};
        if (this.currentPeriod === 'interval') {
            filter.dateFrom = this.startDateInput.value;
            filter.dateTo = this.endDateInput.value;
        }

        try {
            const operations = await OperationsService.getAll(filter);
            this.renderOperations(operations || []);
        } catch (e) {
            this.operationsList.querySelectorAll('.operation').forEach(row => row.remove());
            console.error('Не удалось загрузить операции', e);
        }
    }

    renderOperations(operations) {
        this.operationsList.querySelectorAll('.operation').forEach(row => row.remove());

        operations.forEach((operation, index) => {
            const row = document.createElement('div');
            row.className = 'operation operation-field';
            row.dataset.id = operation.id;

            const typeLabel = operation.type === 'income' ? 'Доход' : 'Расход';
            const typeClass = operation.type === 'income' ? 'income' : 'expense';
            const categoryLabel = operation.category || 'Без категории';

            row.innerHTML = `
                <span class="number">${index + 1}</span>
                <span></span>
                <span class="type ${typeClass}">${typeLabel}</span>
                <span></span>
                <span class="category">${this.escapeHtml(categoryLabel)}</span>
                <span></span>
                <span class="sum">${operation.amount}$</span>
                <span></span>
                <span class="date">${this.formatDate(operation.date)}</span>
                <span></span>
                <span class="comment">${this.escapeHtml(operation.comment || '')}</span>
                <span></span>
                ${DELETE_ICON_SVG}
                <span></span>
                ${EDIT_ICON_SVG}
            `;

            this.operationsList.appendChild(row);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(isoDate) {
        if (!isoDate) return '';
        const [year, month, day] = isoDate.split('-');
        if (!year || !month || !day) return isoDate;
        return `${day}.${month}.${year}`;
    }

    async handleFilterClick(item) {
        this.filterItems.forEach(el => el.classList.remove('mainInfo-filter-active'));
        item.classList.add('mainInfo-filter-active');

        this.currentPeriod = item.dataset.period;

        const isInterval = this.currentPeriod === 'interval';
        this.startDateInput.disabled = !isInterval;
        this.endDateInput.disabled = !isInterval;

        if (!isInterval) {
            await this.loadOperations();
        } else if (this.startDateInput.value && this.endDateInput.value) {
            await this.loadOperations();
        }
    }


    async loadCategoriesFor(type) {
        const service = type === 'income' ? this.incomesCategoriesService : this.expensesCategoriesService;
        this.categorySelect.innerHTML = '<option value="" disabled selected>Выберите категорию...</option>';

        try {
            const categories = await service.getAll();
            (categories || []).forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.title;
                this.categorySelect.appendChild(option);
            });
        } catch (e) {
            console.error('Не удалось загрузить категории', e);
        }
    }

    async showCreateTurnover(type) {
        this.operationIdToEdit = null;
        this.resetFormErrors();

        this.filters.style.display = 'none';
        this.operationsList.style.display = 'none';
        this.newTurnover.style.display = 'none';

        this.mainTitle.innerText = 'Создание дохода/расхода';
        this.confirmBtn.textContent = 'Создать';

        this.typeSelect.value = type;
        this.amountInput.value = '';
        this.dateInput.value = '';
        this.commentInput.value = '';

        await this.loadCategoriesFor(type);

        this.createTurnover.style.display = 'flex';
    }

    async showEditTurnover(operationRow) {
        const id = operationRow.dataset.id;
        this.operationIdToEdit = id;
        this.resetFormErrors();

        let operation;
        try {
            operation = await OperationsService.getOne(id);
        } catch (e) {
            console.error('Не удалось загрузить операцию', e);
            return;
        }

        this.filters.style.display = 'none';
        this.operationsList.style.display = 'none';
        this.newTurnover.style.display = 'none';

        this.mainTitle.innerText = 'Редактирование дохода/расхода';
        this.confirmBtn.textContent = 'Сохранить';

        this.typeSelect.value = operation.type;
        this.amountInput.value = operation.amount;
        this.dateInput.value = operation.date;
        this.commentInput.value = operation.comment || '';

        await this.loadCategoriesFor(operation.type);
        if (operation.category) {
            const matchingOption = [...this.categorySelect.options].find(opt => opt.textContent === operation.category);
            if (matchingOption) this.categorySelect.value = matchingOption.value;
        }

        this.createTurnover.style.display = 'flex';
    }

    hideCreateTurnover() {
        this.createTurnover.style.display = 'none';

        this.filters.style.display = 'flex';
        this.operationsList.style.display = 'block';
        this.newTurnover.style.display = 'block';
        this.mainTitle.innerText = 'Доходы и расходы';

        this.operationIdToEdit = null;
        this.resetFormErrors();
    }

    resetFormErrors() {
        Object.values(this.errors).forEach(el => el.textContent = '');
        [this.categorySelect, this.amountInput, this.dateInput, this.commentInput].forEach(el => el.classList.remove('input-error'));
    }

    validateForm() {
        let isValid = true;
        this.resetFormErrors();

        if (!this.categorySelect.value) {
            this.errors.category.textContent = 'Выберите категорию';
            this.categorySelect.classList.add('input-error');
            isValid = false;
        }

        const amount = parseFloat(this.amountInput.value);
        if (!this.amountInput.value || isNaN(amount) || amount <= 0) {
            this.errors.amount.textContent = 'Введите сумму больше нуля';
            this.amountInput.classList.add('input-error');
            isValid = false;
        }

        if (!this.dateInput.value) {
            this.errors.date.textContent = 'Выберите дату';
            this.dateInput.classList.add('input-error');
            isValid = false;
        }

        if (!this.commentInput.value.trim()) {
            this.errors.comment.textContent = 'Добавьте комментарий';
            this.commentInput.classList.add('input-error');
            isValid = false;
        }

        return isValid;
    }

    async handleConfirm() {
        if (!this.validateForm()) return;

        const payload = {
            type: this.typeSelect.value,
            category_id: this.categorySelect.value,
            amount: this.amountInput.value,
            date: this.dateInput.value,
            comment: this.commentInput.value.trim(),
        };

        try {
            if (this.operationIdToEdit) {
                await OperationsService.update(this.operationIdToEdit, payload);
            } else {
                await OperationsService.create(payload);
            }
            this.hideCreateTurnover();
            await this.loadOperations();
            await refreshBalance();
        } catch (e) {
            this.errors.comment.textContent = e.message || 'Не удалось сохранить операцию';
        }
    }


    async handleDeleteConfirmed() {
        if (!this.operationIdToDelete) return;
        try {
            await OperationsService.delete(this.operationIdToDelete);
            await this.loadOperations();
            await refreshBalance();
        } catch (e) {
            console.error('Не удалось удалить операцию', e);
        }
        this.operationIdToDelete = null;
        this.popup.style.display = 'none';
    }


    processBindings() {
        this.newIncomeBtn.onclick = () => this.showCreateTurnover('income');
        this.newExpenseBtn.onclick = () => this.showCreateTurnover('expense');

        this.cancelCreateTurnover.onclick = () => this.hideCreateTurnover();
        this.confirmBtn.onclick = () => this.handleConfirm();

        this.typeSelect.addEventListener('change', () => {
            this.loadCategoriesFor(this.typeSelect.value);
        });

        this.filterItems.forEach(item => {
            item.addEventListener('click', () => this.handleFilterClick(item));
        });

        this.startDateInput.addEventListener('change', () => {
            if (this.currentPeriod === 'interval') this.loadOperations();
        });
        this.endDateInput.addEventListener('change', () => {
            if (this.currentPeriod === 'interval') this.loadOperations();
        });
        this.startDateInput.disabled = true;
        this.endDateInput.disabled = true;

        this.operationsList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.deleteThisTurnover');
            if (deleteBtn) {
                const row = deleteBtn.closest('.operation');
                this.operationIdToDelete = row.dataset.id;
                this.popup.style.display = 'flex';
                return;
            }

            const editBtn = e.target.closest('.editThisTurnover');
            if (editBtn) {
                const row = editBtn.closest('.operation');
                this.showEditTurnover(row);
            }
        });

        document.querySelector('.confirmDelete').onclick = () => this.handleDeleteConfirmed();
        document.querySelector('.cancelDelete').onclick = () => {
            this.operationIdToDelete = null;
            this.popup.style.display = 'none';
        };
        this.popup.onclick = (e) => {
            if (e.target === this.popup) {
                this.operationIdToDelete = null;
                this.popup.style.display = 'none';
            }
        };
    }
}