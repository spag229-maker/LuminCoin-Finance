import {Router} from "./router.js";

class App {
    constructor() {
        this.router = new Router();
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('hashchange', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this));

        this.bindUserDropdown();
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
}

(new App());