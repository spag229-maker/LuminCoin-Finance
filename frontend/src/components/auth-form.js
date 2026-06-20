import {Auth} from "./services/auth.js";

export class AuthForm {
    static RULES = {
        email: /^[a-zA-Z0-9@._-]+$/,
    };

    constructor(mode) {
        this.mode = mode; // 'login' | 'signup'
        this.submitAttempted = false;
        this.form = document.getElementById('authForm');
        this.submitBtn = document.getElementById('signupBtn');
        this.formError = document.getElementById('formError');

        if (!this.form || !this.submitBtn) return;

        this.processBindings();
    }

    processBindings() {
        document.querySelectorAll('.formInput').forEach(input => {
            input.addEventListener('keydown', (e) => this.handleKeydown(e, input));
            input.addEventListener('input', () => this.handleInput(input));
        });

        this.submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
    }

    handleKeydown(e, input) {
        if (e.key === ' ') e.preventDefault();

        const id = input.closest('label')?.id;

        if ((id === 'name' || id === 'lastName') && /\d/.test(e.key)) {
            e.preventDefault();
        }

        if ((id === 'password' || id === 'passwordRepeat') && /[^a-zA-Z0-9]/.test(e.key) && e.key.length === 1) {
            e.preventDefault();
        }
    }

    handleInput(input) {
        if (!this.submitAttempted) {
            const isValid = this.validateInput(input, false);
            if (isValid) this.setValid(input);
            else this.clearState(input);
        } else {
            this.validateInput(input, true);
        }
    }

    setInvalid(input, message) {
        input.classList.add('input-error');
        input.classList.remove('input-ok');

        let hint = input.parentElement.querySelector('.validation-hint');
        if (!hint) {
            hint = document.createElement('span');
            hint.className = 'validation-hint';
            input.parentElement.appendChild(hint);
        }
        hint.textContent = message;
    }

    setValid(input) {
        input.classList.remove('input-error');
        input.classList.add('input-ok');

        const hint = input.parentElement.querySelector('.validation-hint');
        if (hint) hint.textContent = '';
    }

    clearState(input) {
        input.classList.remove('input-error', 'input-ok');
        const hint = input.parentElement.querySelector('.validation-hint');
        if (hint) hint.textContent = '';
    }

    validateInput(input, showErrors = true) {
        const id = input.closest('label')?.id || input.id;
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
            if (!AuthForm.RULES.email.test(value) || !value.includes('@') || !value.includes('.')) {
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

    showFormError(message) {
        if (this.formError) this.formError.textContent = message || '';
    }

    applyServerValidation(validation) {
        if (!validation) return;
        validation.forEach(item => {
            const label = document.getElementById(item.key);
            const input = label ? label.querySelector('.formInput') : null;
            if (input) this.setInvalid(input, item.message);
        });
    }

    collectPayload() {
        const get = (id) => document.getElementById(id)?.querySelector('input')?.value ?? '';

        if (this.mode === 'login') {
            const rememberMe = document.querySelector('.rememberMe')?.checked || false;
            return {
                email: get('email'),
                password: get('password'),
                rememberMe,
            };
        }

        return {
            name: get('name'),
            lastName: get('lastName'),
            email: get('email'),
            password: get('password'),
            passwordRepeat: get('passwordRepeat'),
        };
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.submitAttempted = true;
        this.showFormError('');

        const inputs = [...document.querySelectorAll('.formInput')];
        let allOk = true;

        inputs.forEach(input => {
            const ok = this.validateInput(input, true);
            if (!ok) allOk = false;
        });

        if (this.mode === 'signup') {
            const passInput = document.querySelector('#password .formInput, #password input');
            const repeatInput = document.querySelector('#passwordRepeat .formInput, #passwordRepeat input');
            if (passInput && repeatInput && passInput.value && repeatInput.value) {
                if (passInput.value !== repeatInput.value) {
                    this.setInvalid(repeatInput, 'Пароли не совпадают');
                    allOk = false;
                }
            }
        }

        if (!allOk) return;

        this.submitBtn.disabled = true;

        const payload = this.collectPayload();
        const result = this.mode === 'login'
            ? await Auth.login(payload)
            : await Auth.signup(payload);

        this.submitBtn.disabled = false;

        if (result.error) {
            this.applyServerValidation(result.validation);
            this.showFormError(result.message || 'Произошла ошибка');
            return;
        }

        if (this.mode === 'login') {
            window.location.href = '#/';
        } else {
            window.location.href = '#/login';
        }
    }
}
