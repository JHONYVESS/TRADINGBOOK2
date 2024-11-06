export class PerformanceTracker {
    constructor(trades) {
        this.trades = trades;
        this.timeFrames = {
            daily: 24 * 60 * 60 * 1000,
            weekly: 7 * 24 * 60 * 60 * 1000,
            monthly: 30 * 24 * 60 * 60 * 1000,
            yearly: 365 * 24 * 60 * 60 * 1000
        };
    }

    getMetrics(timeframe) {
        const sortedTrades = [...this.trades].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        const dates = sortedTrades.map(t => new Date(t.date).toLocaleDateString());
        let cumulativePnL = [];
        let runningTotal = 0;

        sortedTrades.forEach(trade => {
            runningTotal += trade.pnl;
            cumulativePnL.push(runningTotal);
        });

        const winningTrades = sortedTrades.filter(t => t.pnl > 0);
        const totalTrades = sortedTrades.length;

        const { returnRanges, returnDistribution } = this.calculateReturnDistribution(sortedTrades);

        return {
            totalTrades,
            winRate: totalTrades ? (winningTrades.length / totalTrades) * 100 : 0,
            profitFactor: this.calculateProfitFactor(sortedTrades),
            averageReturn: totalTrades ? 
                sortedTrades.reduce((sum, t) => sum + t.pnl, 0) / totalTrades : 0,
            dates,
            cumulativePnL,
            returnRanges,
            returnDistribution
        };
    }

    calculateProfitFactor(trades) {
        const grossProfit = trades
            .filter(t => t.pnl > 0)
            .reduce((sum, t) => sum + t.pnl, 0);
        const grossLoss = Math.abs(trades
            .filter(t => t.pnl < 0)
            .reduce((sum, t) => sum + t.pnl, 0));
        
        return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    }

    calculateReturnDistribution(trades) {
        const ranges = [-Infinity, -1000, -500, -100, 0, 100, 500, 1000, Infinity];
        const distribution = new Array(ranges.length - 1).fill(0);
        
        trades.forEach(trade => {
            for (let i = 0; i < ranges.length - 1; i++) {
                if (trade.pnl > ranges[i] && trade.pnl <= ranges[i + 1]) {
                    distribution[i]++;
                    break;
                }
            }
        });
        
        const returnRanges = ranges.slice(1).map((r, i) => 
            `${ranges[i]} to ${r === Infinity ? '∞' : r}`
        );
        
        return { returnRanges, returnDistribution: distribution };
    }

    getDrawdown() {
        let peak = 0;
        let maxDrawdown = 0;
        let currentValue = 0;

        this.trades.forEach(trade => {
            currentValue += trade.pnl;
            peak = Math.max(peak, currentValue);
            const drawdown = (peak - currentValue) / peak;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        });

        return maxDrawdown;
    }
}