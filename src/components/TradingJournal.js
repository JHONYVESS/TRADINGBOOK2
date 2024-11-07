export class TradingJournal {
    constructor() {
        this.auth = window.auth;
        this.userId = this.auth.getCurrentUser()?.uid;
        this.trades = this.loadUserTrades();
        this.initializeUI();
        this.setupEventListeners();
        this.updateUI();
    }

    // Previous methods remain the same until handleTradeSubmit
    loadUserTrades() {
        if (!this.userId) return [];
        const trades = localStorage.getItem(`trades_${this.userId}`);
        return trades ? JSON.parse(trades) : [];
    }

    initializeUI() {
        this.tradeModal = document.getElementById('tradeModal');
        this.tradeForm = document.getElementById('tradeForm');
        this.tradesBody = document.getElementById('tradesBody');
        this.addTradeButton = document.getElementById('addTrade');
        this.exportButton = document.getElementById('exportData');
        
        this.stats = {
            totalTrades: document.getElementById('totalTrades'),
            winRate: document.getElementById('winRate'),
            totalPnL: document.getElementById('totalPnL'),
            avgReturn: document.getElementById('avgReturn')
        };

        this.charts = {
            pnl: document.getElementById('pnlChart')?.getContext('2d'),
            winLoss: document.getElementById('winLossChart')?.getContext('2d')
        };
    }

    setupEventListeners() {
        if (this.addTradeButton) {
            this.addTradeButton.addEventListener('click', () => {
                this.tradeModal.style.display = 'block';
            });
        }

        if (this.tradeModal) {
            const cancelButton = this.tradeModal.querySelector('.cancel');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    this.tradeModal.style.display = 'none';
                    this.tradeForm.reset();
                });
            }
        }

        if (this.tradeForm) {
            this.tradeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTradeSubmit(e);
            });
        }

        if (this.exportButton) {
            this.exportButton.addEventListener('click', () => this.exportTrades());
        }
    }

    handleTradeSubmit(e) {
        const formData = new FormData(this.tradeForm);
        const trade = {
            id: Date.now(),
            date: new Date().toISOString(),
            symbol: formData.get('pair'),
            type: formData.get('type'),
            entry: parseFloat(formData.get('entry')),
            exit: parseFloat(formData.get('exit')),
            stopLoss: parseFloat(formData.get('stopLoss')),
            volume: parseFloat(formData.get('volume')),
            notes: formData.get('notes')
        };

        trade.pnl = this.calculatePnL(formData);
        this.trades.push(trade);
        this.saveTrades();
        this.updateUI();
        this.tradeModal.style.display = 'none';
        this.tradeForm.reset();
    }

    calculatePnL(formData) {
        const entry = parseFloat(formData.get('entry'));
        const exit = parseFloat(formData.get('exit'));
        const volume = parseFloat(formData.get('volume'));
        const type = formData.get('type');
        const pair = formData.get('pair');
      
        const pipValueByPair = {
            'GBPUSD': 0.00001,
            'EURUSD': 0.00001,
            'USDJPY': 0.01,
            'USDCAD': 0.0001,
            'USDCHF': 0.0001,
            'AUDUSD': 0.0001,
            'NZDUSD': 0.0001,
        };
        const pipvalue = exit - entry;
        const pips = pipvalue / pipValueByPair[pair] || 0.01;
      
        return type === 'long' ? pips * volume : -pips * volume;
    }

    calculateRR(trade) {
        const { entry, exit, stopLoss, type } = trade;
        
        if (type === 'long') {
            // Pour un trade long
            const risk = Math.abs(entry - stopLoss); // Distance entre l'entrée et le stop loss
            const reward = Math.abs(exit - entry); // Distance entre l'entrée et la sortie
            return (reward / risk).toFixed(2);
        } else {
            // Pour un trade short
            const risk = Math.abs(stopLoss - entry); // Distance entre le stop loss et l'entrée
            const reward = Math.abs(entry - exit); // Distance entre l'entrée et la sortie
            return (reward / risk).toFixed(2);
        }
    }

    updateUI() {
        this.updateStats();
        this.updateTradesTable();
        this.updateCharts();
    }

    updateStats() {
        if (!this.stats.totalTrades) return;

        const totalTrades = this.trades.length;
        const winningTrades = this.trades.filter(t => t.pnl > 0).length;
        const totalPnL = this.trades.reduce((sum, t) => sum + t.pnl, 0);
        
        this.stats.totalTrades.textContent = totalTrades;
        this.stats.winRate.textContent = totalTrades 
            ? `${((winningTrades / totalTrades) * 100).toFixed(1)}%`
            : '0%';
        this.stats.totalPnL.textContent = `${totalPnL.toFixed(2)} $`;
        this.stats.avgReturn.textContent = totalTrades 
            ? `${(totalPnL / totalTrades).toFixed(2)} $`
            : '0 $';
    }

    updateTradesTable() {
        if (!this.tradesBody) return;
        
        this.tradesBody.innerHTML = this.trades
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(trade => `
                <tr>
                    <td>${new Date(trade.date).toLocaleDateString()}</td>
                    <td>${trade.symbol}</td>
                    <td>${trade.type}</td>
                    <td>${trade.entry}</td>
                    <td>${trade.exit}</td>
                    <td>${trade.stopLoss}</td>
                    <td>${trade.volume}</td>
                    <td class="${trade.pnl > 0 ? 'positive' : 'negative'}">
                        ${trade.pnl.toFixed(2)} $
                    </td>
                    <td>${this.calculateRR(trade)}</td>
                    <td>${trade.notes}</td>
                    <td>
                        <button onclick="window.journal.deleteTrade(${trade.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
    }

    updateCharts() {
        this.updatePnLChart();
        this.updateWinLossChart();
    }

    updatePnLChart() {
        if (!this.charts.pnl) return;

        const pnlData = this.trades.map(t => ({
            date: new Date(t.date),
            pnl: t.pnl
        })).sort((a, b) => a.date - b.date);

        new Chart(this.charts.pnl, {
            type: 'line',
            data: {
                labels: pnlData.map(d => d.date.toLocaleDateString()),
                datasets: [{
                    label: 'P&L',
                    data: pnlData.map(d => d.pnl),
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

    updateWinLossChart() {
        if (!this.charts.winLoss) return;

        const winningTrades = this.trades.filter(t => t.pnl > 0).length;
        const losingTrades = this.trades.filter(t => t.pnl < 0).length;

        new Chart(this.charts.winLoss, {
            type: 'doughnut',
            data: {
                labels: ['Winning Trades', 'Losing Trades'],
                datasets: [{
                    data: [winningTrades, losingTrades],
                    backgroundColor: ['#22c55e', '#ef4444']
                }]
            }
        });
    }

    deleteTrade(id) {
        this.trades = this.trades.filter(t => t.id !== id);
        this.saveTrades();
        this.updateUI();
    }

    saveTrades() {
        if (!this.userId) return;
        localStorage.setItem(`trades_${this.userId}`, JSON.stringify(this.trades));
    }

    exportTrades() {
        const dataStr = JSON.stringify(this.trades, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', 'trades.json');
        exportLink.click();
    }
}
