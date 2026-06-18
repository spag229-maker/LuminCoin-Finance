const newIncomeBtn = document.querySelector('#newIncome');
const newExpenseBtn = document.querySelector('#newExpense');
const filters = document.querySelector('.mainInfo-filtersStroke');
const operations = document.querySelector('.operations');
const createTurnover = document.querySelector('.createTurnover');
const cancelCreateTurnover = document.querySelector('.cancelCreateTurnover');
const newTurnover = document.querySelector('.newTurnover');
const mainTitle = document.querySelector('.mainTitle');

const showCreateTurnover = () => {
    filters.style.display = 'none';
    operations.style.display = 'none';
    newTurnover.style.display = 'none';

    mainTitle.innerText = 'Создание дохода/расхода';

    createTurnover.style.display = 'flex';
};

newIncomeBtn.onclick = showCreateTurnover;
newExpenseBtn.onclick = showCreateTurnover;

cancelCreateTurnover.onclick = () => {
    createTurnover.style.display = 'none';

    filters.style.display = 'flex';
    operations.style.display = 'block';
    newTurnover.style.display = 'block';
    mainTitle.innerText = 'Доходы и расходы';
};

operations.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.editThisTurnover');

    if (!editBtn) return;

    const operation = editBtn.closest('.operation');

    const type = operation.querySelector('.type').textContent.trim();
    const category = operation.querySelector('.category').textContent.trim();
    const amount = operation.querySelector('.sum').textContent.trim();
    const date = operation.querySelector('.date').textContent.trim();
    const comment = operation.querySelector('.comment').textContent.trim();

    filters.style.display = 'none';
    operations.style.display = 'none';
    newTurnover.style.display = 'none';

    mainTitle.innerText = 'Редактирование дохода/расхода';

    createTurnover.style.display = 'flex';

    document.querySelector('#turnoverType').value = type;
    document.querySelector('#turnoverCategory').value = category;
    document.querySelector('#turnoverAmount').value = amount;
    document.querySelector('#turnoverDate').value = date;
    document.querySelector('#turnoverComment').value = comment;
});