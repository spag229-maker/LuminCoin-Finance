export class Turnovers {
    constructor() {
        this.newIncomeBtn = document.querySelector('#newIncome');
        this.newExpenseBtn = document.querySelector('#newExpense');
        this.filters = document.querySelector('.mainInfo-filtersStroke');
        this.operations = document.querySelector('.operations');
        this.createTurnover = document.querySelector('.createTurnover');
        this.cancelCreateTurnover = document.querySelector('.cancelCreateTurnover');
        this.newTurnover = document.querySelector('.newTurnover');
        this.mainTitle = document.querySelector('.mainTitle');

        this.processBindings();
    }

    showCreateTurnover() {
        this.filters.style.display = 'none';
        this.operations.style.display = 'none';
        this.newTurnover.style.display = 'none';

        this.mainTitle.innerText = 'Создание дохода/расхода';

        this.createTurnover.style.display = 'flex';
    }

    hideCreateTurnover() {
        this.createTurnover.style.display = 'none';

        this.filters.style.display = 'flex';
        this.operations.style.display = 'block';
        this.newTurnover.style.display = 'block';
        this.mainTitle.innerText = 'Доходы и расходы';

        document.querySelector('#turnoverType').value = '';
        document.querySelector('#turnoverCategory').value = '';
        document.querySelector('#turnoverAmount').value = '';
        document.querySelector('#turnoverDate').value = '';
        document.querySelector('#turnoverComment').value = '';
    }

    processBindings() {
        this.newIncomeBtn.onclick = () => this.showCreateTurnover();
        this.newExpenseBtn.onclick = () => this.showCreateTurnover();

        this.cancelCreateTurnover.onclick = () => this.hideCreateTurnover();

        this.operations.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.editThisTurnover');
            if (!editBtn) return;

            const operation = editBtn.closest('.operation');

            const type = operation.querySelector('.type').textContent.trim();
            const category = operation.querySelector('.category').textContent.trim();
            const amount = operation.querySelector('.sum').textContent.trim();
            const date = operation.querySelector('.date').textContent.trim();
            const comment = operation.querySelector('.comment').textContent.trim();

            this.filters.style.display = 'none';
            this.operations.style.display = 'none';
            this.newTurnover.style.display = 'none';

            this.mainTitle.innerText = 'Редактирование дохода/расхода';

            this.createTurnover.style.display = 'flex';

            document.querySelector('#turnoverType').value = type;
            document.querySelector('#turnoverCategory').value = category;
            document.querySelector('#turnoverAmount').value = amount;
            document.querySelector('#turnoverDate').value = date;
            document.querySelector('#turnoverComment').value = comment;
        });
    }
}
