import '../../styles/expenses.css';
import '../../styles/operations.css'

const popup = document.querySelector('.popup-overlay');
const deleteButtons = document.querySelectorAll('.deleteOperation');
const addBtn = document.querySelector('.addOperation');
const title = document.querySelector('.mainTitle');
const operations = document.querySelector('.operations');
const createOperation = document.querySelector('.createOperation');
const cancelBtn = createOperation.querySelector('.redBtn');
const editOperation = document.querySelector('.editOperation');
const editInput = document.querySelector('#editIncomeName');


deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
        popup.style.display = 'flex';
    });
});

document.querySelector('.confirmDelete').onclick = () => {
    popup.style.display = 'none';
};

document.querySelector('.cancelDelete').onclick = () => {
    popup.style.display = 'none';
};


popup.onclick = (e) => {
    if (e.target === popup) {
        popup.style.display = 'none';
    }
};



addBtn.onclick = () => {
    title.textContent = 'Создание категории расходов';

    operations.style.display = 'none';
    createOperation.style.display = 'block';
};

cancelBtn.onclick = () => {
    title.textContent = 'Расходы';

    createOperation.style.display = 'none';
    operations.style.display = 'flex';
};


operations.addEventListener('click', (e) => {
    if (e.target.classList.contains('blueBtn')) {

        const card = e.target.closest('.income-card');
        const categoryName = card.querySelector('h2').textContent;

        operations.style.display = 'none';
        editOperation.style.display = 'block';



        editInput.value = categoryName;
    }
});

document.querySelector('.cancelEdit').onclick = () => {
    editOperation.style.display = 'none';
    operations.style.display = 'flex';
};