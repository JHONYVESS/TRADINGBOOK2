class Reports {
    constructor(trades) {
        this.trades = trades;
    }

    generateMonthlyReport(month, year) {
        const monthlyTrades = this.trades.filter(trade => {
            const date = new Date(trade.date);
            return date.getMonth() + 1 === month && date.getFullYear() === year;
        });

        return {
            period: `${year}-${month}`,
            summary: this.calculateSummary(monthlyTrades),
            performance: this.calculatePerformance(monthlyTrades),
            instruments: this.analyzeInstruments(monthlyTrades)
        };
    }

    generateQuarterlyReport(quarter, year) {
        const startMonth = (quarter - 1) * 3 + 1;
        const quarterlyTrades = this.trades.filter(trade => {
            const date = new Date(trade.date);
            const tradeMonth = date.getMonth() + 1;
            return date.getFullYear() === year && 
                   tradeMonth >= startMonth && 
                   tradeMonth < startMonth + 3;
        });

        return {
            period: `Q${quarter} ${year}`,
            summary: this.calculateSummary(quarterlyTrades),
            performance: this.calculatePerformance(quarterlyTrades),
            instruments: this.analyzeInstruments(quarterlyTrades)
        };
    }

    calculateSummary(trades) {
        return {
            totalTrades: trades.length,
            profitableTrades: trades.filter(t => t.pnl > 0).length,
            totalPnL: trades.reduce((sum, t) => sum + t.pnl, 0),
            averagePnL: trades.length ? 
                trades.reduce((sum, t) => sum + t.pnl, 0) / trades.length : 0,
            largestWin: Math.max(...trades.map(t => t.pnl)),
            largestLoss: Math.min(...trades.map(t => t.pnl))
        };
    }

    calculatePerformance(trades) {
        const initialCapital = 10000; // Example initial capital
        const finalCapital = trades.reduce((cap, trade) => cap + trade.pnl, initialCapital);
        
        return {
            returnOnCapital: ((finalCapital - initialCapital) / initialCapital) * 100,
            winRate: trades.length ? 
                (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0,
            profitFactor: this.calculateProfitFactor(trades)
        };
    }

    analyzeInstruments(trades) {
        const instruments = {};
        trades.forEach(trade => {
            if (!instruments[trade.symbol]) {
                instruments[trade.symbol] = {
                    trades: 0,
                    pnl: 0,
                    winRate: 0
                };
            }
            instruments[trade.symbol].trades++;
            instruments[trade.symbol].pnl += trade.pnl;
        });

        return instruments;
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
}