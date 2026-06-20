import {Auth} from "../components/services/auth.js";

export class Router {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.sideBarElement = document.getElementById('sideBar');
        this.userNameElement = document.getElementById('userName');
        this.balanceElement = document.getElementById('currentBalance');

        // роуты, доступные без авторизации
        this.publicRoutes = ['#/login', '#/signup'];

        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: '/templates/index.html',
                styles: ['/styles/index.css'],
                load: () => {
                    import('../components/main.js').then(m => new m.Main());
                },
            },
            {
                route: '#/login',
                title: 'Вход',
                template: '/templates/login.html',
                styles: ['/styles/logpage.css'],
                load: () => {
                    import('../components/auth-form.js').then(m => new m.AuthForm('login'));
                },
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: '/templates/signup.html',
                styles: ['/styles/logpage.css'],
                load: () => {
                    import('../components/auth-form.js').then(m => new m.AuthForm('signup'));
                },
            },
            {
                route: '#/incomes',
                title: 'Доходы',
                template: '/templates/incomes.html',
                styles: ['/styles/incomes.css', '/styles/operations.css'],
                load: () => {
                    import('../components/incomes.js').then(m => new m.Incomes());
                },
            },
            {
                route: '#/expenses',
                title: 'Расходы',
                template: '/templates/expenses.html',
                styles: ['/styles/expenses.css', '/styles/operations.css'],
                load: () => {
                    import('../components/expenses.js').then(m => new m.Expenses());
                },
            },
            {
                route: '#/turnovers',
                title: 'Доходы и расходы',
                template: '/templates/turnovers.html',
                styles: ['/styles/turnovers.css'],
                load: () => {
                    import('../components/turnovers.js').then(m => new m.Turnovers());
                },
            },
        ];
    }

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0] || '#/';

        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }

        const isPublic = this.publicRoutes.includes(urlRoute);

        // неавторизованного пользователя пускаем только на login/signup
        if (!isPublic && !Auth.isAuthenticated()) {
            window.location.href = '#/login';
            return;
        }

        // авторизованного пользователя не пускаем на login/signup
        if (isPublic && Auth.isAuthenticated()) {
            window.location.href = '#/';
            return;
        }

        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (!newRoute) {
            window.location.href = Auth.isAuthenticated() ? '#/' : '#/login';
            return;
        }

        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.applyStyles(newRoute.styles);
        document.title = `LuminCoin Finance — ${newRoute.title}`;

        this.updateSideBar(isPublic);
        this.highlightActiveNav(urlRoute);

        newRoute.load();
    }

    applyStyles(stylesList) {
        document.querySelectorAll('link[data-route-style]').forEach(link => link.remove());

        stylesList.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.setAttribute('data-route-style', 'true');
            document.head.appendChild(link);
        });
    }

    updateSideBar(isPublicRoute) {
        if (!this.sideBarElement) return;

        if (isPublicRoute) {
            this.sideBarElement.style.display = 'none';
            return;
        }

        this.sideBarElement.style.display = 'block';

        const userInfo = Auth.getUserInfo();
        if (userInfo && this.userNameElement) {
            this.userNameElement.innerText = `${userInfo.name} ${userInfo.lastName}`;
        }
    }

    highlightActiveNav(urlRoute) {
        document.querySelectorAll('.navButton').forEach(btn => btn.classList.remove('navButton-active'));

        const map = {
            '#/': 'mainPageBtn',
            '#/turnovers': 'turnoverPageBtn',
        };

        const activeId = map[urlRoute];
        if (activeId) {
            document.getElementById(activeId)?.classList.add('navButton-active');
        }

        this.updateCategoriesDropdown(urlRoute);
    }

    updateCategoriesDropdown(urlRoute) {
        const dropdown = document.getElementById('categoriesDropdown');
        const dropdownContent = document.getElementById('categoriesDropdownContent');
        if (!dropdown || !dropdownContent) return;

        const isCategoriesRoute = urlRoute === '#/incomes' || urlRoute === '#/expenses';

        dropdown.classList.toggle('dropdown-active', isCategoriesRoute);
        dropdownContent.classList.toggle('dropdown-content-active', isCategoriesRoute);

        dropdownContent.classList.remove('dropdown-content-incomes', 'dropdown-content-expenses');
        if (urlRoute === '#/incomes') {
            dropdownContent.classList.add('dropdown-content-incomes');
        } else if (urlRoute === '#/expenses') {
            dropdownContent.classList.add('dropdown-content-expenses');
        }
    }
}