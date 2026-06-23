import { BalanceService } from '../components/services/balance-service.js';

export async function refreshBalance(): Promise<void> {
    const balanceElement = document.getElementById('currentBalance');
    if (!balanceElement) return;

    try {
        const result = await BalanceService.get();
        if (result && typeof result.balance !== 'undefined') {
            balanceElement.textContent = `${result.balance}$`;
        }
    } catch (e) {
        console.error('Не удалось загрузить баланс', e);
    }
}