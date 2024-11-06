import { Auth } from './src/components/Auth.js';
import { Analytics } from './src/components/Analytics.js';
import { PerformanceTracker } from './src/components/PerformanceTracker.js';

let auth, analytics, performanceTracker;
let currentTimeframe = 'daily';

document.addEventListener('DOMContentLoaded', () => {
    auth = new Auth();
    window.auth = auth;
    
    auth.auth.onAuthStateChanged(user => {
        if (user) {
            initializePerformance();
        }
    });
});

function initializePerformance() {
    const trades = JSON.parse(localStorage.getItem(`trades_${auth.getCurrentUser().uid}`)) || [];
    analytics = new Analytics(trades);
    performanceTracker = new PerformanceTracker(trades);
    updatePerformanceUI();
}

function updatePerformanceUI() {
    const metrics = performanceTracker.getMetrics(currentTimeframe);
    
    const elements = {
        totalTrades: document.getElementById('totalTrades'),
        winRate: document.getElementById('winRate'),
        profitFactor: document.getElementById('profitFactor'),
        averageReturn: document.getElementById('averageReturn')
    };

    if (elements.totalTrades) elements.totalTrades.textContent = metrics.totalTrades;
    if (elements.winRate) elements.winRate.textContent = `${metrics.winRate.toFixed(2)}%`;
    if (elements.profitFactor) elements.profitFactor.textContent = metrics.profitFactor.toFixed(2);
    if (elements.averageReturn) elements.averageReturn.textContent = `$${metrics.averageReturn.toFixed(2)}`;
    
    updatePerformanceCharts(metrics);
}

function updatePerformanceCharts(metrics) {
    const pnlCtx = document.getElementById('pnlChart')?.getContext('2d');
    const distributionCtx = document.getElementById('distributionChart')?.getContext('2d');
    
    if (pnlCtx) {
        new Chart(pnlCtx, {
            type: 'line',
            data: {
                labels: metrics.dates,
                datasets: [{
                    label: 'Cumulative P&L',
                    data: metrics.cumulativePnL,
                    borderColor: '#2563eb',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'P&L Evolution'
                    }
                }
            }
        });
    }
    
    if (distributionCtx) {
        new Chart(distributionCtx, {
            type: 'bar',
            data: {
                labels: metrics.returnRanges,
                datasets: [{
                    label: 'Return Distribution',
                    data: metrics.returnDistribution,
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Return Distribution'
                    }
                }
            }
        });
    }
}