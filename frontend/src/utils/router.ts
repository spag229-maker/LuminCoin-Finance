import { Auth } from '../components/services/auth.js';
import { refreshBalance } from './sidebar.js';

interface Route {
    route: string;
    title: string;
    template: string;
    styles: string[];
    load: () => void;
}

export class Router {
    private readonly contentElement: HTMLElement | null;
    private readonly sideBarElement: HTMLElement | null;
    private readonly userNameElement: HTMLElement | null;

    private readonly publicRoutes: string[] = ['#/login', '#/signup'];

    private readonly routes: Route[] = [
        {
            route: '#/',
            title: 'Главная',
            template: '/templates/index.html',
            styles: ['/styles/index.css'],
            load: () => {
                import('../components/main.js').then((m) => new m.Main());
            },
        },
        {
            route: '#/login',
            title: 'Вход',
            template: '/templates/login.html',
            styles: ['/styles/logpage.css'],
            load: () => {
                import('../components/auth-form.js').then((m) => new m.AuthForm('login'));
            },
        },
        {
            route: '#/signup',
            title: 'Регистрация',
            template: '/templates/signup.html',
            styles: ['/styles/logpage.css'],
            load: () => {
                import('../components/auth-form.js').then((m) => new m.AuthForm('signup'));
            },
        },
        {
            route: '#/incomes',
            title: 'Доходы',
            template: '/templates/incomes.html',
            styles: ['/styles/incomes.css', '/styles/operations.css'],
            load: () => {
                import('../components/incomes.js').then((m) => new m.Incomes());
            },
        },
        {
            route: '#/expenses',
            title: 'Расходы',
            template: '/templates/expenses.html',
            styles: ['/styles/expenses.css', '/styles/operations.css'],
            load: () => {
                import('../components/expenses.js').then((m) => new m.Expenses());
            },
        },
        {
            route: '#/turnovers',
            title: 'Доходы и расходы',
            template: '/templates/turnovers.html',
            styles: ['/styles/turnovers.css', '/styles/operations.css'],
            load: () => {
                import('../components/turnovers.js').then((m) => new m.Turnovers());
            },
        },
    ];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.sideBarElement = document.getElementById('sideBar');
        this.userNameElement = document.getElementById('userName');
    }

    async openRoute(): Promise<void> {
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

        if (!isPublic && !Auth.isAuthenticated()) {
            window.location.href = '#/login';
            return;
        }

        if (isPublic && Auth.isAuthenticated()) {
            window.location.href = '#/';
            return;
        }

        const newRoute = this.routes.find((item) => item.route === urlRoute);

        if (!newRoute) {
            window.location.href = Auth.isAuthenticated() ? '#/' : '#/login';
            return;
        }

        if (!this.contentElement) return;

        this.contentElement.innerHTML = await fetch(newRoute.template).then((r) => r.text());
        this.applyStyles(newRoute.styles);
        document.title = `LuminCoin Finance — ${newRoute.title}`;

        this.updateSideBar(isPublic);
        this.highlightActiveNav(urlRoute);

        if (!isPublic) {
            refreshBalance();
        }

        newRoute.load();
    }

    private applyStyles(stylesList: string[]): void {
        document.querySelectorAll('link[data-route-style]').forEach((link) => link.remove());

        stylesList.forEach((href) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.setAttribute('data-route-style', 'true');
            document.head.appendChild(link);
        });
    }

    private updateSideBar(isPublicRoute: boolean): void {
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

    private highlightActiveNav(urlRoute: string): void {
        document.querySelectorAll('.navButton').forEach((btn) => btn.classList.remove('navButton-active'));

        const map: Record<string, string> = {
            '#/': 'mainPageBtn',
            '#/turnovers': 'turnoverPageBtn',
        };

        const activeId = map[urlRoute];
        if (activeId) {
            document.getElementById(activeId)?.classList.add('navButton-active');
        }

        this.updateCategoriesDropdown(urlRoute);
    }

    private updateCategoriesDropdown(urlRoute: string): void {
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