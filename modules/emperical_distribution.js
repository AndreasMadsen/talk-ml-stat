const summary = require('summary');

class EmpericalDistribution {
    constructor(obs, bins, xstart, xend) {
        this._stat = summary(obs);
        this._xstart = xstart;
        this._bin_width = bins / (xend - xstart);

        this._counts = new Int32Array(bins);
        for (let x of obs) {
        this._counts[this._binIndex(x)] += 1;
        }
        this._count_stat = summary(this._counts);
    }
    _binIndex(x) {
        return Math.floor((x - this._xstart) * this._bin_width);
    }
    mean() {
        return this._stat.mean();
    }
    median() {
        return this._stat.median();
    }
    variance() {
        return this._stat.variance();
    }
    inv(q) {
        if (q == 0) return this._stat.min() - this._bin_width;
        if (q == 1) return this._stat.max() + this._bin_width;
        return this._stat.quartile(q);
    }
    pdf(x) {
        return this._counts[this._binIndex(x)] / this._count_stat.max();
    }
}

module.exports = EmpericalDistribution;

