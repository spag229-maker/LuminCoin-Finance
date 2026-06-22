import {Chart} from 'chart.js/auto';
import {OperationsService} from "./services/operations-service.js";

const CHART_COLORS = [
    '#0D6EFD', '#20C997', '#DC3545', '#FD7E14', '#FFC107',
    '#FD7E14', '#20C997', '#0D6EFD', '#6C757D', '#D63384',
];

export class Main {
    constructor() {
        this.filterItems = document.querySelectorAll('.mainInfo-filter');
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');

        this.incomeCanvas = document.getElementById('incomeChart');
        this.expenseCanvas = document.getElementById('expenseChart');

        this.incomeChart = null;
        this.expenseChart = null;
        this.currentPeriod = 'today';

        this.processBindings();
        this.loadStatistics();
    }

    processBindings() {
        this.filterItems.forEach(item => {
            item.addEventListener('click', () => this.handleFilterClick(item));
        });

        this.startDateInput.addEventListener('change', () => {
            if (this.currentPeriod === 'interval') this.loadStatistics();
        });
        this.endDateInput.addEventListener('change', () => {
            if (this.currentPeriod === 'interval') this.loadStatistics();
        });
    }

    async handleFilterClick(item) {
        this.filterItems.forEach(el => el.classList.remove('mainInfo-filter-active'));
        item.classList.add('mainInfo-filter-active');

        this.currentPeriod = item.dataset.period;

        const isInterval = this.currentPeriod === 'interval';
        this.startDateInput.disabled = !isInterval;
        this.endDateInput.disabled = !isInterval;

        if (!isInterval) {
            await this.loadStatistics();
        } else if (this.startDateInput.value && this.endDateInput.value) {
            await this.loadStatistics();
        }
    }

    async loadStatistics() {
        const filter = {period: this.currentPeriod};
        if (this.currentPeriod === 'interval') {
            filter.dateFrom = this.startDateInput.value;
            filter.dateTo = this.endDateInput.value;
        }

        let operations;
        try {
            operations = await OperationsService.getAll(filter);
        } catch (e) {
            console.error('Не удалось загрузить операции для статистики', e);
            return;
        }

        const incomeGroups = this.groupByCategory(operations, 'income');
        const expenseGroups = this.groupByCategory(operations, 'expense');

        this.renderChart('income', incomeGroups);
        this.renderChart('expense', expenseGroups);
    }

    groupByCategory(operations, type) {
        const groups = {};

        operations
            .filter(op => op.type === type)
            .forEach(op => {
                const label = op.category || 'Без категории';
                groups[label] = (groups[label] || 0) + op.amount;
            });

        return groups;
    }

    renderChart(type, groups) {
        const canvas = type === 'income' ? this.incomeCanvas : this.expenseCanvas;
        const existingChart = type === 'income' ? this.incomeChart : this.expenseChart;

        const labels = Object.keys(groups);
        const data = Object.values(groups);

        if (existingChart) {
            existingChart.destroy();
        }

        const chart = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels.length ? labels : ['Нет данных'],
                datasets: [{
                    data: data.length ? data : [1],
                    backgroundColor: data.length
                        ? labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
                        : ['#E9ECEF'],
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        enabled: data.length > 0,
                    },
                },
            },
        });

        if (type === 'income') {
            this.incomeChart = chart;
        } else {
            this.expenseChart = chart;
        }
    }
}