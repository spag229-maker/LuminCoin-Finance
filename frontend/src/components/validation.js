import '../../styles/logpage.css'

document.addEventListener('DOMContentLoaded', () => {

    const RULES = {
        email:    /^[a-zA-Z0-9@._-]+$/,
    };

    let submitAttempted = false; // флаг — была ли попытка отправки

    const setInvalid = (input, message) => {
        input.classList.add('input-error');
        input.classList.remove('input-ok');

        let hint = input.parentElement.querySelector('.validation-hint');
        if (!hint) {
            hint = document.createElement('span');
            hint.className = 'validation-hint';
            input.parentElement.appendChild(hint);
        }
        hint.textContent = message;
    };

    const setValid = (input) => {
        input.classList.remove('input-error');
        input.classList.add('input-ok');

        const hint = input.parentElement.querySelector('.validation-hint');
        if (hint) hint.textContent = '';
    };

    const clearState = (input) => {
        input.classList.remove('input-error', 'input-ok');
        const hint = input.parentElement.querySelector('.validation-hint');
        if (hint) hint.textContent = '';
    };

    // showErrors: true — показывать ошибки, false — только проверить (без UI)
    const validateInput = (input, showErrors = true) => {
        const id    = input.closest('label')?.id || input.id;
        const value = input.value;

        if (value === '') {
            if (showErrors) setInvalid(input, 'Поле обязательно для заполнения');
            else clearState(input);
            return false;
        }

        if (id === 'name' || id === 'lastName') {
            if (value.length < 2) {
                if (showErrors) setInvalid(input, 'Не менее двух символов');
                return false;
            }
        }

        if (id === 'email') {
            if (!RULES.email.test(value)) {
                if (showErrors) setInvalid(input, 'Только латинские буквы, цифры и символы @ . _ -');
                return false;
            }
            if (!value.includes('@') || !value.includes('.')) {
                if (showErrors) setInvalid(input, 'Введите корректный email');
                return false;
            }
        }

        if (id === 'password' || id === 'confirm-password') {
            if (value.length < 8) {
                if (showErrors) setInvalid(input, 'Минимум 8 символов');
                return false;
            }
        }

        setValid(input); // всегда зеленим если валидно
        return true;
    };

    document.querySelectorAll('.formInput').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === ' ') e.preventDefault();

            const id = input.closest('label')?.id;

            if ((id === 'name' || id === 'lastName') && /\d/.test(e.key)) {
                e.preventDefault();
            }

            if ((id === 'password' || id === 'confirm-password') && /[^a-zA-Z0-9]/.test(e.key) && e.key.length === 1) {
                e.preventDefault();
            }
        });

        input.addEventListener('input', () => {
            if (!submitAttempted) {
                // До первого submit: только зеленим если валидно, ошибки не показываем
                const isValid = validateInput(input, false);
                if (isValid) setValid(input);
                else clearState(input);
            } else {
                // После попытки submit: полная валидация с ошибками
                validateInput(input, true);
            }
        });
    });

    const submitBtn = document.querySelector('#signupBtn');
    if (!submitBtn) return;

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        submitAttempted = true;

        const inputs = [...document.querySelectorAll('.formInput')];
        let allOk = true;

        inputs.forEach(input => {
            const ok = validateInput(input, true);
            if (!ok) allOk = false;
        });

        const pass    = document.querySelector('#password input');
        const confirm = document.querySelector('#confirm-password input');
        if (pass && confirm && pass.value && confirm.value) {
            if (pass.value !== confirm.value) {
                setInvalid(confirm, 'Пароли не совпадают');
                allOk = false;
            }
        }

        // const rememberMe = document.querySelector('.rememberMe');
        // if (rememberMe && !rememberMe.checked) {
        //     let hint = rememberMe.closest('label').querySelector('.validation-hint');
        //     if (!hint) {
        //         hint = document.createElement('span');
        //         hint.className = 'validation-hint';
        //         rememberMe.closest('label').appendChild(hint);
        //     }
        //     hint.textContent = 'Необходимо принять условия';
        //     rememberMe.closest('label').classList.add('checkbox-error');
        //     allOk = false;
        // }

        if (allOk) {
            document.querySelector('.formFields')?.submit();
        }
    });

});