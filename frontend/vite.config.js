import { defineConfig } from 'vite'

export default defineConfig({
    root: '.',
    publicDir: 'static',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './index.html',
                expenses: './templates/expenses.html',
                incomes: './templates/incomes.html',
                turnovers: './templates/turnovers.html',
                login: './templates/login.html',
                signup: './templates/signup.html',
            }
        }
    }
})