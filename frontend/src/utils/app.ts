import { Router } from './router.js';

class App {
    private readonly router: Router;

    constructor() {
        this.router = new Router();

        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('hashchange', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this));

        this.bindUserDropdown();
        this.bindLogoutPopup();
    }

    private handleRouteChanging(): void {
        this.router.openRoute();
    }

    private bindUserDropdown(): void {
        const toggle = document.getElementById('userDropdownToggle');
        const dropdown = document.getElementById('userDropdown');
        if (!toggle || !dropdown) return;

        toggle.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            dropdown.classList.toggle('userDropdown-open');
        });

        document.addEventListener('click', (e: MouseEvent) => {
            if (!dropdown.contains(e.target as Node)) {
                dropdown.classList.remove('userDropdown-open');
            }
        });
    }

    private bindLogoutPopup(): void {
        const logoutBtn = document.getElementById('logoutBtn');
        const popup = document.getElementById('logoutPopup');
        const confirmBtn = document.getElementById('confirmLogout');
        const cancelBtn = document.getElementById('cancelLogout');

        if (!logoutBtn || !popup || !confirmBtn || !cancelBtn) return;

        logoutBtn.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            popup.style.display = 'flex';
        });

        confirmBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            window.location.href = '#/logout';
        });

        cancelBtn.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        popup.addEventListener('click', (e: MouseEvent) => {
            if (e.target === popup) {
                popup.style.display = 'none';
            }
        });
    }
}

new App();