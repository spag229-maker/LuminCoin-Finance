import { Chart } from 'chart.js/auto';
import { OperationsService } from './services/operations-service.js';
import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';
import localeRu from 'air-datepicker/locale/ru';
import type { Operation, OperationFilter, CategoryType } from '../types/common.types.js';

const CHART_COLORS: string[] = [
    '#0D6EFD', '#20C997', '#DC3545', '#FD7E14', '#FFC107',
    '#FD7E14', '#20C997', '#0D6EFD', '#6C757D', '#D63384',
];

export class Main {
    private readonly filterItems: NodeListOf<HTMLElement>;
    private readonly startDateInput: HTMLInputElement;
    private readonly endDateInput: HTMLInputElement;

    private readonly incomeCanvas: HTMLCanvasElement;
    private readonly expenseCanvas: HTMLCanvasElement;

    private incomeChart: Chart | null = null;
    private expenseChart: Chart | null = null;
    private currentPeriod: string = 'today';

    constructor() {
        this.filterItems = document.querySelectorAll<HTMLElement>('.mainInfo-filter');
        this.startDateInput = document.getElementById('startDate') as HTMLInputElement;
        this.endDateInput = document.getElementById('endDate') as HTMLInputElement;

        this.incomeCanvas = document.getElementById('incomeChart') as HTMLCanvasElement;
        this.expenseCanvas = document.getElementById('expenseChart') as HTMLCanvasElement;

        new AirDatepicker('#startDate', {
            autoClose: true,
            locale: localeRu,
            dateFormat: 'dd.MM.yyyy',
        });

        new AirDatepicker('#endDate', {
            autoClose: true,
            locale: localeRu,
            dateFormat: 'dd.MM.yyyy',
        });

        this.processBindings();
        this.loadStatistics();
    }

    private processBindings(): void {
        this.filterItems.forEach((item) => {
            item.addEventListener('click', () => this.handleFilterClick(item));
        });

        this.startDateInput.addEventListener('change', () => {
            if (this.currentPeriod === 'interval') this.loadStatistics();
        });

        this.endDateInput.addEventListener('change', () => {
            if (this.currentPeriod === 'interval') this.loadStatistics();
        });
    }

    private async handleFilterClick(item: HTMLElement): Promise<void> {
        this.filterItems.forEach((el) => el.classList.remove('mainInfo-filter-active'));
        item.classList.add('mainInfo-filter-active');

        this.currentPeriod = item.dataset.period ?? 'today';

        const isInterval = this.currentPeriod === 'interval';
        this.startDateInput.disabled = !isInterval;
        this.endDateInput.disabled = !isInterval;

        if (!isInterval) {
            await this.loadStatistics();
        } else if (this.startDateInput.value && this.endDateInput.value) {
            await this.loadStatistics();
        }
    }

    private async loadStatistics(): Promise<void> {
        const filter: OperationFilter = { period: this.currentPeriod as OperationFilter['period'] };

        if (this.currentPeriod === 'interval') {
            filter.dateFrom = this.startDateInput.value;
            filter.dateTo = this.endDateInput.value;
        }

        let operations: Operation[] | null;
        try {
            operations = await OperationsService.getAll(filter);
        } catch (e) {
            console.error('Не удалось загрузить операции для статистики', e);
            return;
        }

        const list = operations ?? [];
        const incomeGroups = this.groupByCategory(list, 'income');
        const expenseGroups = this.groupByCategory(list, 'expense');

        this.renderChart('income', incomeGroups);
        this.renderChart('expense', expenseGroups);
    }

    private groupByCategory(
        operations: Operation[],
        type: CategoryType,
    ): Record<string, number> {
        const groups: Record<string, number> = {};

        operations
            .filter((op) => op.type === type)
            .forEach((op) => {
                const label = op.category || 'Без категории';
                groups[label] = (groups[label] ?? 0) + op.amount;
            });

        return groups;
    }

    private renderChart(type: CategoryType, groups: Record<string, number>): void {
        const canvas = type === 'income' ? this.incomeCanvas : this.expenseCanvas;
        const existingChart = type === 'income' ? this.incomeChart : this.expenseChart;

        const labels = Object.keys(groups);
        const data = Object.values(groups);

        existingChart?.destroy();

        const chart = new Chart(canvas, {
            type: 'pie',
            data: {
                labels: labels.length ? labels : ['Нет данных'],
                datasets: [
                    {
                        data: data.length ? data : [1],
                        backgroundColor: data.length
                            ? labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
                            : ['#E9ECEF'],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { enabled: data.length > 0 },
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