export class Analytics {
    constructor(trades) {
        this.trades = trades;
    }

    getBasicMetrics() {
        const totalTrades = this.trades.length;
        const winningTrades = this.trades.filter(t => t.pnl > 0).length;
        const losingTrades = totalTrades - winningTrades;
        
        return {
            totalTrades,
            winningTrades,
            losingTrades,
            winRate: totalTrades ? (winningTrades / totalTrades) * 100 : 0,
            totalPnL: this.trades.reduce((sum, t) => sum + t.pnl, 0),
            averagePnL: totalTrades ? this.trades.reduce((sum, t) => sum + t.pnl, 0) / totalTrades : 0
        };
    }

    getReturnMetrics() {
        const returns = this.trades.map(t => t.pnl);
        const mean = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
        const variance = returns.length ? 
            returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length : 0;
        
        return {
            mean,
            stdDev: Math.sqrt(variance),
            maxReturn: Math.max(...returns, 0),
            minReturn: Math.min(...returns, 0)
        };
    }

    getTradeDistribution() {
        const ranges = [-Infinity, -1000, -500, -100, 0, 100, 500, 1000, Infinity];
        const distribution = new Array(ranges.length - 1).fill(0);
        
        this.trades.forEach(trade => {
            for (let i = 0; i < ranges.length - 1; i++) {
                if (trade.pnl > ranges[i] && trade.pnl <= ranges[i + 1]) {
                    distribution[i]++;
                    break;
                }
            }
        });
        
        return {
            ranges: ranges.slice(1).map((r, i) => `${ranges[i]} to ${r === Infinity ? '∞' : r}`),
            distribution
        };
    }

    getProfitFactor() {
        const grossProfit = this.trades
            .filter(t => t.pnl > 0)
            .reduce((sum, t) => sum + t.pnl, 0);
        const grossLoss = Math.abs(this.trades
            .filter(t => t.pnl < 0)
            .reduce((sum, t) => sum + t.pnl, 0));
        
        return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    }

    getTimeBasedMetrics(timeframe) {
        const timeframes = {
            daily: 86400000,
            weekly: 604800000,
            monthly: 2592000000
        };
        
        const interval = timeframes[timeframe] || timeframes.daily;
        const groupedTrades = {};
        
        this.trades.forEach(trade => {
            const timestamp = new Date(trade.date).getTime();
            const period = Math.floor(timestamp / interval) * interval;
            
            if (!groupedTrades[period]) {
                groupedTrades[period] = {
                    trades: 0,
                    pnl: 0,
                    winning: 0
                };
            }
            
            groupedTrades[period].trades++;
            groupedTrades[period].pnl += trade.pnl;
            if (trade.pnl > 0) groupedTrades[period].winning++;
        });
        
        return Object.entries(groupedTrades).map(([timestamp, data]) => ({
            date: new Date(parseInt(timestamp)),
            ...data,
            winRate: (data.winning / data.trades) * 100
        }));
    }

    getSymbolMetrics() {
        const symbolStats = {};
        
        this.trades.forEach(trade => {
            if (!symbolStats[trade.symbol]) {
                symbolStats[trade.symbol] = {
                    trades: 0,
                    pnl: 0,
                    winning: 0
                };
            }
            
            symbolStats[trade.symbol].trades++;
            symbolStats[trade.symbol].pnl += trade.pnl;
            if (trade.pnl > 0) symbolStats[trade.symbol].winning++;
        });
        
        return Object.entries(symbolStats).map(([symbol, data]) => ({
            symbol,
            ...data,
            winRate: (data.winning / data.trades) * 100,
            averagePnL: data.pnl / data.trades
        }));
    }
}