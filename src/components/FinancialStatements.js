class FinancialStatements {
    constructor(trades) {
        this.trades = trades;
    }

    generateProfitLoss() {
        const monthly = {};
        this.trades.forEach(trade => {
            const date = new Date(trade.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthly[monthKey]) {
                monthly[monthKey] = {
                    grossProfit: 0,
                    totalTrades: 0,
                    winningTrades: 0,
                    losingTrades: 0,
                    fees: 0
                };
            }
            monthly[monthKey].totalTrades++;
            monthly[monthKey].grossProfit += trade.pnl;
            if (trade.pnl > 0) {
                monthly[monthKey].winningTrades++;
            } else {
                monthly[monthKey].losingTrades++;
            }
            monthly[monthKey].fees += trade.volume * 0.001; // Exemple de frais
        });
        return monthly;
    }

    getEquityCurve() {
        return this.trades.reduce((acc, trade) => {
            const last = acc.length > 0 ? acc[acc.length - 1].equity : 10000; // Capital initial
            acc.push({
                date: trade.date,
                equity: last + trade.pnl
            });
            return acc;
        }, []);
    }

    getRiskMetrics() {
        const returns = this.trades.map(t => t.pnl);
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);

        return {
            sharpeRatio: mean / stdDev,
            maxDrawdown: this.calculateMaxDrawdown(),
            volatility: stdDev
        };
    }

    calculateMaxDrawdown() {
        const equityCurve = this.getEquityCurve();
        let maxDrawdown = 0;
        let peak = equityCurve[0].equity;

        equityCurve.forEach(point => {
            if (point.equity > peak) {
                peak = point.equity;
            }
            const drawdown = (peak - point.equity) / peak;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        });

        return maxDrawdown;
    }
}