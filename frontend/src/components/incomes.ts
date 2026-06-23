import { CategoriesService } from './services/categories-service.js';
import type { Category } from '../types/common.types.js';

export class Incomes {
    private readonly service: CategoriesService;

    private readonly popup: HTMLElement | null;
    private readonly title: HTMLElement | null;
    private readonly categoriesList: HTMLElement | null;
    private readonly createOperation: HTMLElement | null;
    private readonly editOperation: HTMLElement | null;

    private readonly newNameInput: HTMLInputElement | null;
    private readonly editNameInput: HTMLInputElement | null;
    private readonly createError: HTMLElement | null;
    private readonly editError: HTMLElement | null;

    private readonly confirmCreateBtn: HTMLElement | null;
    private readonly cancelCreateBtn: HTMLElement | null;
    private readonly confirmEditBtn: HTMLElement | null;
    private readonly cancelEditBtn: HTMLElement | null;

    private categoryIdToDelete: number | null = null;
    private categoryIdToEdit: number | null = null;

    constructor() {
        this.service = new CategoriesService('income');

        this.popup = document.querySelector('.popup-overlay');
        this.title = document.querySelector('.mainTitle');
        this.categoriesList = document.getElementById('categoriesList');
        this.createOperation = document.querySelector('.createOperation');
        this.editOperation = document.querySelector('.editOperation');

        this.newNameInput = document.getElementById('newIncomeName') as HTMLInputElement | null;
        this.editNameInput = document.getElementById('editIncomeName') as HTMLInputElement | null;
        this.createError = document.getElementById('createError');
        this.editError = document.getElementById('editError');

        this.confirmCreateBtn = document.getElementById('confirmCreate');
        this.cancelCreateBtn = document.getElementById('cancelCreate');
        this.confirmEditBtn = document.getElementById('confirmEdit');
        this.cancelEditBtn = document.querySelector('.cancelEdit');

        this.processBindings();
        this.loadCategories();
    }

    private async loadCategories(): Promise<void> {
        if (!this.categoriesList) return;
        try {
            const categories = await this.service.getAll();
            this.renderCategories(categories ?? []);
        } catch (e) {
            this.categoriesList.innerHTML = `<p class="loadError">Не удалось загрузить категории: ${(e as Error).message}</p>`;
        }
    }

    private renderCategories(categories: Category[]): void {
        if (!this.categoriesList) return;
        this.categoriesList.innerHTML = '';

        categories.forEach((category) => {
            const card = document.createElement('figure');
            card.className = 'income-card';
            card.dataset.id = String(category.id);
            card.innerHTML = `
                <h2>${this.escapeHtml(category.title)}</h2>
                <div>
                    <button class="blueBtn editCategory">Редактировать</button>
                    <button class="redBtn deleteOperation">Удалить</button>
                </div>
            `;
            this.categoriesList!.appendChild(card);
        });

        const addCard = document.createElement('figure');
        addCard.className = 'income-card empty-income-card';
        addCard.innerHTML = '<button class="addOperation">+</button>';
        this.categoriesList.appendChild(addCard);
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private showCreateForm(): void {
        if (this.title) this.title.textContent = 'Создание категории доходов';
        if (this.newNameInput) {
            this.newNameInput.value = '';
            this.newNameInput.classList.remove('input-error');
        }
        if (this.createError) this.createError.textContent = '';
        if (this.categoriesList) this.categoriesList.style.display = 'none';
        if (this.createOperation) this.createOperation.style.display = 'block';
    }

    private hideCreateForm(): void {
        if (this.title) this.title.textContent = 'Доходы';
        if (this.createOperation) this.createOperation.style.display = 'none';
        if (this.categoriesList) this.categoriesList.style.display = 'flex';
    }

    private showEditForm(id: number, currentTitle: string): void {
        this.categoryIdToEdit = id;
        if (this.title) this.title.textContent = 'Редактирование категории доходов';
        if (this.editNameInput) {
            this.editNameInput.value = currentTitle;
            this.editNameInput.classList.remove('input-error');
        }
        if (this.editError) this.editError.textContent = '';
        if (this.categoriesList) this.categoriesList.style.display = 'none';
        if (this.editOperation) this.editOperation.style.display = 'block';
    }

    private hideEditForm(): void {
        if (this.title) this.title.textContent = 'Доходы';
        if (this.editOperation) this.editOperation.style.display = 'none';
        if (this.categoriesList) this.categoriesList.style.display = 'flex';
    }

    private validateTitle(
        value: string,
        input: HTMLInputElement,
        errorEl: HTMLElement,
    ): boolean {
        if (!value || value.trim() === '') {
            input.classList.add('input-error');
            errorEl.textContent = 'Название не может быть пустым';
            return false;
        }
        input.classList.remove('input-error');
        errorEl.textContent = '';
        return true;
    }

    private async handleCreate(): Promise<void> {
        if (!this.newNameInput || !this.createError) return;
        const value = this.newNameInput.value.trim();
        if (!this.validateTitle(value, this.newNameInput, this.createError)) return;

        try {
            await this.service.create(value);
            this.hideCreateForm();
            await this.loadCategories();
        } catch (e) {
            this.createError.textContent = (e as Error).message || 'Не удалось создать категорию';
        }
    }

    private async handleEdit(): Promise<void> {
        if (!this.editNameInput || !this.editError || this.categoryIdToEdit === null) return;
        const value = this.editNameInput.value.trim();
        if (!this.validateTitle(value, this.editNameInput, this.editError)) return;

        try {
            await this.service.update(this.categoryIdToEdit, value);
            this.hideEditForm();
            await this.loadCategories();
        } catch (e) {
            this.editError.textContent = (e as Error).message || 'Не удалось обновить категорию';
        }
    }

    private async handleDeleteConfirmed(): Promise<void> {
        if (this.categoryIdToDelete === null) return;
        try {
            await this.service.delete(this.categoryIdToDelete);
            await this.loadCategories();
        } catch (e) {
            console.error(e);
        }
        this.categoryIdToDelete = null;
        if (this.popup) this.popup.style.display = 'none';
    }

    private processBindings(): void {
        this.categoriesList?.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (target.classList.contains('addOperation')) {
                this.showCreateForm();
                return;
            }

            const card = target.closest<HTMLElement>('.income-card');
            if (!card) return;
            const id = Number(card.dataset.id);

            if (target.classList.contains('editCategory')) {
                const currentTitle = card.querySelector('h2')?.textContent ?? '';
                this.showEditForm(id, currentTitle);
                return;
            }

            if (target.classList.contains('deleteOperation')) {
                this.categoryIdToDelete = id;
                if (this.popup) this.popup.style.display = 'flex';
            }
        });

        if (this.confirmCreateBtn) this.confirmCreateBtn.onclick = () => this.handleCreate();
        if (this.cancelCreateBtn) this.cancelCreateBtn.onclick = () => this.hideCreateForm();
        if (this.confirmEditBtn) this.confirmEditBtn.onclick = () => this.handleEdit();
        if (this.cancelEditBtn) this.cancelEditBtn.onclick = () => this.hideEditForm();

        document.querySelector('.confirmDelete')?.addEventListener('click', () =>
            this.handleDeleteConfirmed(),
        );

        document.querySelector('.cancelDelete')?.addEventListener('click', () => {
            this.categoryIdToDelete = null;
            if (this.popup) this.popup.style.display = 'none';
        });

        this.popup?.addEventListener('click', (e: MouseEvent) => {
            if (e.target === this.popup) {
                this.categoryIdToDelete = null;
                this.popup!.style.display = 'none';
            }
        });
    }
}