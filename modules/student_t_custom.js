const distributions = require('distributions');

class StudenttCustom {
    constructor(n, mean, sd) {
      this.base = distributions.Studentt(n);
      this._mean = mean;
      this._sd = sd;
    }
    mean() {
      return this._mean;
    }
    median() {
      return this._mean;
    }
    variance() {
      return this._sd * this._sd;
    }
    inv(q) {
      return this.base.inv(q) * this._sd + this._mean;
    }
    pdf(x) {
      // https://en.wikipedia.org/wiki/Student%27s_t-distribution#Non-standardized_Student.27s_t-distribution
      return this.base.pdf((x - this._mean) / this._sd) / this._sd;
    }
    cdf(x) {
      return this.base.cdf((x - this._mean) / this._sd);
    }
}

module.exports = StudenttCustom;
