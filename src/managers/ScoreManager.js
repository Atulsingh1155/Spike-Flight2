export class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.bestScore = this.loadBestScore();
        this.coins = this.loadCoins();
    }

    addScore(points) {
        this.currentScore += points;
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            this.saveBestScore();
        }
    }

    addCoin() {
        this.coins++;
        this.saveCoins();
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.saveCoins();
            return true;
        }
        return false;
    }

    reset() {
        this.currentScore = 0;
    }

    loadBestScore() {
        return parseInt(localStorage.getItem('spikeFlightBestScore') || '0');
    }

    saveBestScore() {
        localStorage.setItem('spikeFlightBestScore', this.bestScore.toString());
    }

    loadCoins() {
        return parseInt(localStorage.getItem('spikeFlightCoins') || '0');
    }

    saveCoins() {
        localStorage.setItem('spikeFlightCoins', this.coins.toString());
    }

    getCurrentScore() {
        return this.currentScore;
    }

    getBestScore() {
        return this.bestScore;
    }

    getCoins() {
        return this.coins;
    }
}