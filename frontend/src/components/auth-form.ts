import { Auth } from './services/auth.js';
import type { AuthResult, ValidationError } from '../types/common.types.js';

type AuthMode = 'login' | 'signup';

interface LoginPayload {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface SignupPayload {
    name: string;
    lastName: string;
    email: string;
    password: string;
    passwordRepeat: string;
}

type AuthPayload = LoginPayload | SignupPayload;

export class AuthForm {
    private static readonly RULES = {
        email: /^[a-zA-Z0-9@._-]+$/,
    };

    private readonly mode: AuthMode;
    private submitAttempted: boolean = false;

    private readonly form: HTMLElement | null;
    private readonly submitBtn: HTMLButtonElement | null;
    private readonly formError: HTMLElement | null;

    constructor(mode: AuthMode) {
        this.mode = mode;
        this.form = document.getElementById('authForm');
        this.submitBtn = document.getElementById('signupBtn') as HTMLButtonElement | null;
        this.formError = document.getElementById('formError');

        if (!this.form || !this.submitBtn) return;

        this.processBindings();
    }

    private processBindings(): void {
        document.querySelectorAll<HTMLInputElement>('.formInput').forEach((input) => {
            input.addEventListener('keydown', (e) => this.handleKeydown(e, input));
            input.addEventListener('input', () => this.handleInput(input));
        });

        this.submitBtn?.addEventListener('click', (e) => this.handleSubmit(e));
    }

    private handleKeydown(e: KeyboardEvent, input: HTMLInputElement): void {
        if (e.key === ' ') e.preventDefault();

        const id = input.closest('label')?.id;

        if ((id === 'name' || id === 'lastName') && /\d/.test(e.key)) {
            e.preventDefault();
        }

        if (
            (id === 'password' || id === 'passwordRepeat') &&
            /[^a-zA-Z0-9]/.test(e.key) &&
            e.key.length === 1
        ) {
            e.preventDefault();
        }
    }

    private handleInput(input: HTMLInputElement): void {
        if (!this.submitAttempted) {
            const isValid = this.validateInput(input, false);
            if (isValid) this.setValid(input);
            else this.clearState(input);
        } else {
            this.validateInput(input, true);
        }
    }

    private setInvalid(input: HTMLInputElement, message: string): void {
        input.classList.add('input-error');
        input.classList.remove('input-ok');

        let hint = input.parentElement?.querySelector<HTMLElement>('.validation-hint');
        if (!hint) {
            hint = document.createElement('span');
            hint.className = 'validation-hint';
            input.parentElement?.appendChild(hint);
        }
        hint.textContent = message;
    }

    private setValid(input: HTMLInputElement): void {
        input.classList.remove('input-error');
        input.classList.add('input-ok');

        const hint = input.parentElement?.querySelector<HTMLElement>('.validation-hint');
        if (hint) hint.textContent = '';
    }

    private clearState(input: HTMLInputElement): void {
        input.classList.remove('input-error', 'input-ok');
        const hint = input.parentElement?.querySelector<HTMLElement>('.validation-hint');
        if (hint) hint.textContent = '';
    }

    private validateInput(input: HTMLInputElement, showErrors: boolean = true): boolean {
        const id = input.closest('label')?.id ?? input.id;
        const value = input.value;

        if (value === '') {
            if (showErrors) this.setInvalid(input, 'Поле обязательно для заполнения');
            else this.clearState(input);
            return false;
        }

        if (id === 'name' || id === 'lastName') {
            if (value.length < 3) {
                if (showErrors) this.setInvalid(input, 'Не менее трёх символов');
                return false;
            }
        }

        if (id === 'email') {
            if (
                !AuthForm.RULES.email.test(value) ||
                !value.includes('@') ||
                !value.includes('.')
            ) {
                if (showErrors) this.setInvalid(input, 'Введите корректный email');
                return false;
            }
        }

        if (id === 'password' || id === 'passwordRepeat') {
            if (value.length < 6) {
                if (showErrors) this.setInvalid(input, 'Минимум 6 символов');
                return false;
            }
        }

        this.setValid(input);
        return true;
    }

    private showFormError(message: string): void {
        if (this.formError) this.formError.textContent = message;
    }

    private applyServerValidation(validation: ValidationError[] | null | undefined): void {
        if (!validation) return;
        validation.forEach((item) => {
            const label = document.getElementById(item.field);
            const input = label?.querySelector<HTMLInputElement>('.formInput');
            if (input) this.setInvalid(input, item.message);
        });
    }

    private collectPayload(): AuthPayload {
        const get = (id: string): string =>
            document.getElementById(id)?.querySelector('input')?.value ?? '';

        if (this.mode === 'login') {
            const rememberMe =
                document.querySelector<HTMLInputElement>('.rememberMe')?.checked ?? false;
            return { email: get('email'), password: get('password'), rememberMe };
        }

        return {
            name: get('name'),
            lastName: get('lastName'),
            email: get('email'),
            password: get('password'),
            passwordRepeat: get('passwordRepeat'),
        };
    }

    private async handleSubmit(e: MouseEvent): Promise<void> {
        e.preventDefault();
        this.submitAttempted = true;
        this.showFormError('');

        const inputs = [...document.querySelectorAll<HTMLInputElement>('.formInput')];
        let allOk = true;

        inputs.forEach((input) => {
            if (!this.validateInput(input, true)) allOk = false;
        });

        if (this.mode === 'signup') {
            const passInput = document.querySelector<HTMLInputElement>(
                '#password .formInput, #password input',
            );
            const repeatInput = document.querySelector<HTMLInputElement>(
                '#passwordRepeat .formInput, #passwordRepeat input',
            );
            if (passInput && repeatInput && passInput.value && repeatInput.value) {
                if (passInput.value !== repeatInput.value) {
                    this.setInvalid(repeatInput, 'Пароли не совпадают');
                    allOk = false;
                }
            }
        }

        if (!allOk) return;

        if (this.submitBtn) this.submitBtn.disabled = true;

        const payload = this.collectPayload();
        const result: AuthResult =
            this.mode === 'login'
                ? await Auth.login(payload as LoginPayload)
    : await Auth.signup(payload as SignupPayload);

        if (this.submitBtn) this.submitBtn.disabled = false;

        if (result.error) {
            this.applyServerValidation(result.validation);
            this.showFormError(result.message ?? 'Произошла ошибка');
            return;
        }

        window.location.href = this.mode === 'login' ? '#/' : '#/login';
    }
}