const cephes = require('cephes');
const jStat = require('jstat');

class Beta {
    constructor(alpha, beta) {
        this._alpha = alpha;
        this._beta = beta;
        this._sum = this._alpha + this._beta;
    }
    domain() {
        return [0, 1];
    }
    sample() {
        return jStat.beta.sample( this._alpha, this._beta );
    }
    mean() {
        return this._alpha / this._sum;
    }
    variance() {
        return (this._alpha * this._beta) / (this._sum * this._sum * (this._sum + 1));
    }
    median() {
        return this.inv(0.5);
    }
    inv(q) {
        return cephes.incbi(this._alpha, this._beta, q);
    }
    pdf(x) {
        return (Math.pow(x, this._alpha - 1) * Math.pow(1 - x, this._beta - 1)) / cephes.beta(this._alpha, this._beta);
    }
    cdf(x) {
        return cephes.incbet(this._alpha, this._beta, x);
    }
}

module.exports = Beta;
