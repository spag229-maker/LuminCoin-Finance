export class Expenses {
    constructor() {
        this.popup = document.querySelector('.popup-overlay');
        this.deleteButtons = document.querySelectorAll('.deleteOperation');
        this.addBtn = document.querySelector('.addOperation');
        this.title = document.querySelector('.mainTitle');
        this.operations = document.querySelector('.operations');
        this.createOperation = document.querySelector('.createOperation');
        this.cancelBtn = this.createOperation.querySelector('.redBtn');
        this.editOperation = document.querySelector('.editOperation');
        this.editInput = document.querySelector('#editIncomeName');

        this.processBindings();
    }

    processBindings() {
        this.deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.popup.style.display = 'flex';
            });
        });

        document.querySelector('.confirmDelete').onclick = () => {
            this.popup.style.display = 'none';
        };

        document.querySelector('.cancelDelete').onclick = () => {
            this.popup.style.display = 'none';
        };

        this.popup.onclick = (e) => {
            if (e.target === this.popup) {
                this.popup.style.display = 'none';
            }
        };

        this.addBtn.onclick = () => {
            this.title.textContent = 'Создание категории расходов';
            this.operations.style.display = 'none';
            this.createOperation.style.display = 'block';
        };

        this.cancelBtn.onclick = () => {
            this.title.textContent = 'Расходы';
            this.createOperation.style.display = 'none';
            this.operations.style.display = 'flex';
        };

        this.operations.addEventListener('click', (e) => {
            if (e.target.classList.contains('blueBtn')) {
                const card = e.target.closest('.income-card');
                const categoryName = card.querySelector('h2').textContent;

                this.operations.style.display = 'none';
                this.editOperation.style.display = 'block';

                this.editInput.value = categoryName;
            }
        });

        document.querySelector('.cancelEdit').onclick = () => {
            this.editOperation.style.display = 'none';
            this.operations.style.display = 'flex';
        };
    }
}
