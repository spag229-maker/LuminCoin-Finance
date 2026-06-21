import {CategoriesService} from "./services/categories-service.js";

export class Incomes {
    constructor() {
        this.service = new CategoriesService('income');

        this.popup = document.querySelector('.popup-overlay');
        this.title = document.querySelector('.mainTitle');
        this.categoriesList = document.getElementById('categoriesList');
        this.createOperation = document.querySelector('.createOperation');
        this.editOperation = document.querySelector('.editOperation');

        this.newNameInput = document.getElementById('newIncomeName');
        this.editNameInput = document.getElementById('editIncomeName');
        this.createError = document.getElementById('createError');
        this.editError = document.getElementById('editError');

        this.confirmCreateBtn = document.getElementById('confirmCreate');
        this.cancelCreateBtn = document.getElementById('cancelCreate');
        this.confirmEditBtn = document.getElementById('confirmEdit');
        this.cancelEditBtn = document.querySelector('.cancelEdit');

        this.categoryIdToDelete = null;
        this.categoryIdToEdit = null;

        this.processBindings();
        this.loadCategories();
    }

    async loadCategories() {
        try {
            const categories = await this.service.getAll();
            this.renderCategories(categories || []);
        } catch (e) {
            this.categoriesList.innerHTML = `<p class="loadError">Не удалось загрузить категории: ${e.message}</p>`;
        }
    }

    renderCategories(categories) {
        this.categoriesList.innerHTML = '';

        categories.forEach(category => {
            const card = document.createElement('figure');
            card.className = 'income-card';
            card.dataset.id = category.id;
            card.innerHTML = `
                <h2>${this.escapeHtml(category.title)}</h2>
                <div>
                    <button class="blueBtn editCategory">Редактировать</button>
                    <button class="redBtn deleteOperation">Удалить</button>
                </div>
            `;
            this.categoriesList.appendChild(card);
        });

        const addCard = document.createElement('figure');
        addCard.className = 'income-card empty-income-card';
        addCard.innerHTML = '<button class="addOperation">+</button>';
        this.categoriesList.appendChild(addCard);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showCreateForm() {
        this.title.textContent = 'Создание категории доходов';
        this.newNameInput.value = '';
        this.createError.textContent = '';
        this.newNameInput.classList.remove('input-error');

        this.categoriesList.style.display = 'none';
        this.createOperation.style.display = 'block';
    }

    hideCreateForm() {
        this.title.textContent = 'Доходы';
        this.createOperation.style.display = 'none';
        this.categoriesList.style.display = 'flex';
    }

    showEditForm(id, currentTitle) {
        this.categoryIdToEdit = id;
        this.title.textContent = 'Редактирование категории доходов';
        this.editNameInput.value = currentTitle;
        this.editError.textContent = '';
        this.editNameInput.classList.remove('input-error');

        this.categoriesList.style.display = 'none';
        this.editOperation.style.display = 'block';
    }

    hideEditForm() {
        this.title.textContent = 'Доходы';
        this.editOperation.style.display = 'none';
        this.categoriesList.style.display = 'flex';
    }

    validateTitle(value, input, errorEl) {
        if (!value || value.trim() === '') {
            input.classList.add('input-error');
            errorEl.textContent = 'Название не может быть пустым';
            return false;
        }
        input.classList.remove('input-error');
        errorEl.textContent = '';
        return true;
    }

    async handleCreate() {

        const value = this.newNameInput.value.trim();
        if (!this.validateTitle(value, this.newNameInput, this.createError)) return;

        try {
            await this.service.create(value);
            this.hideCreateForm();
            await this.loadCategories();
        } catch (e) {
            this.createError.textContent = e.message || 'Не удалось создать категорию';
        }
    }

    async handleEdit() {
        const value = this.editNameInput.value.trim();
        if (!this.validateTitle(value, this.editNameInput, this.editError)) return;

        try {
            await this.service.update(this.categoryIdToEdit, value);
            this.hideEditForm();
            await this.loadCategories();
        } catch (e) {
            this.editError.textContent = e.message || 'Не удалось обновить категорию';
        }
    }

    async handleDeleteConfirmed() {
        if (this.categoryIdToDelete === null) return;
        try {
            await this.service.delete(this.categoryIdToDelete);
            await this.loadCategories();
        } catch (e) {
            console.error(e);
        }
        this.categoryIdToDelete = null;
        this.popup.style.display = 'none';
    }

    processBindings() {
        this.categoriesList.addEventListener('click', (e) => {
            if (e.target.classList.contains('addOperation')) {
                this.showCreateForm();
                return;
            }

            const card = e.target.closest('.income-card');
            if (!card) return;
            const id = card.dataset.id;

            if (e.target.classList.contains('editCategory')) {
                const currentTitle = card.querySelector('h2').textContent;
                this.showEditForm(id, currentTitle);
                return;
            }

            if (e.target.classList.contains('deleteOperation')) {
                this.categoryIdToDelete = id;
                this.popup.style.display = 'flex';
            }
        });

        this.confirmCreateBtn.onclick = () => this.handleCreate();
        this.cancelCreateBtn.onclick = () => this.hideCreateForm();

        this.confirmEditBtn.onclick = () => this.handleEdit();
        this.cancelEditBtn.onclick = () => this.hideEditForm();

        document.querySelector('.confirmDelete').onclick = () => this.handleDeleteConfirmed();

        document.querySelector('.cancelDelete').onclick = () => {
            this.categoryIdToDelete = null;
            this.popup.style.display = 'none';
        };

        this.popup.onclick = (e) => {
            if (e.target === this.popup) {
                this.categoryIdToDelete = null;
                this.popup.style.display = 'none';
            }
        };
    }
}