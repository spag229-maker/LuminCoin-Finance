import {Router} from "./router.js";

class App {
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('hashchange', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this));

        this.bindUserDropdown();
        this.bindLogoutPopup();
    }

    handleRouteChanging() {
        this.router.openRoute();
    }

    bindUserDropdown() {
        const toggle = document.getElementById('userDropdownToggle');
        const dropdown = document.getElementById('userDropdown');
        if (!toggle || !dropdown) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('userDropdown-open');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('userDropdown-open');
            }
        });
    }

    bindLogoutPopup() {
        const logoutBtn = document.getElementById('logoutBtn');
        const popup = document.getElementById('logoutPopup');
        const confirmBtn = document.getElementById('confirmLogout');
        const cancelBtn = document.getElementById('cancelLogout');
        if (!logoutBtn || !popup || !confirmBtn || !cancelBtn) return;

        logoutBtn.addEventListener('click', (e) => {
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

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
            }
        });
    }
}

(new App());