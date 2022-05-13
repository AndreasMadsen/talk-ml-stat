(function () {
    const distributions = window.require('distributions');
    const cephes = window.require('cephes');
    const StudenttCustom = window.require('./student_t_custom');
    const summary = window.require('summary');
    const d3 = window.require('d3');
    const Plot = window.require('./plot');

    const margin = {top: 10, right: 30, bottom: 30, left: 30};
    const width = 600 - margin.left - margin.right;
    const height = 140 - margin.top - margin.bottom;

    // Sampled from `rbeta(100, 15, 2)`
    const observations = [
        0.959, 0.574, 0.847, 0.776, 0.967, 0.89, 0.915, 0.561, 0.893, 0.866,
        0.947, 0.905, 0.745, 0.87, 0.932, 0.971, 0.944, 0.97, 0.913, 0.916,
        0.945, 0.866, 0.639, 0.662, 0.873, 0.967, 0.974, 0.811, 0.716, 0.91,
        0.838, 0.854, 0.914, 0.918, 0.919, 0.946, 0.948, 0.807, 0.646, 0.903,
        0.936, 0.906, 0.91, 0.989, 0.973, 0.873, 0.802, 0.916, 0.904, 0.713,
        0.897, 0.869, 0.856, 0.824, 0.891, 0.92, 0.944, 0.964, 0.862, 0.886,
        0.974, 0.984, 0.902, 0.811, 0.877, 0.876, 0.821, 0.78, 0.923, 0.806,
        0.974, 0.855, 0.935, 0.621, 0.747, 0.848, 0.971, 0.907, 0.891, 0.905,
        0.918, 0.968, 0.953, 0.919, 0.757, 0.809, 0.964, 0.9, 0.873, 0.954,
        0.752, 0.923, 0.883, 0.862, 0.907, 0.896, 0.808, 0.778, 0.938, 0.927
    ].slice(0, 5);
    const logitObservations = observations.map((x) => logit(x));
    const stat = summary(observations);
    const logitStat = summary(logitObservations);

    class Beta {
        constructor(alpha, beta) {
            this._alpha = alpha;
            this._beta = beta;
            this._sum = this._alpha + this._beta;
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

    function logit(p) {
        return Math.log(p / (1 - p));
    }

    function expit(x) {
        return Math.exp(x) / (1 + Math.exp(x));
    }

    class LogStudenttCustom {
        constructor(n, mean, sd) {
          this.base = distributions.Studentt(n);
          this._mean = mean;
          this._sd = sd;
        }
        mean() {
          return expit(this._mean);
        }
        median() {
          return expit(this._mean);
        }
        variance() {
          return expit(this._sd) * expit(this._sd);
        }
        inv(q) {
          if (q === 0) return 0;
          if (q === 1) return 1;
          return expit(this.base.inv(q) * this._sd + this._mean);
        }
        pdf(x) {
          // https://en.wikipedia.org/wiki/Student%27s_t-distribution#Non-standardized_Student.27s_t-distribution
          return this.base.pdf((logit(x) - this._mean) / this._sd) / this._sd;
        }
        cdf(x) {
          return this.base.cdf((logit(x) - this._mean) / this._sd);
        }
    }

    const svg = d3.select("#logit-d3-transform").append("svg")
        .attr("class", "d3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 3 * (height + margin.top + margin.bottom));

    const normalContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const transformContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.bottom + 2 * margin.top) + ")");
    const studenttContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (2*height + 2*margin.bottom + 3 * margin.top) + ")");

    const normal = new Plot(normalContainer, {
        width: width,
        height: height,
        xdomain: [0, 1.2],
        ydomain: [0, 8]
    });
    for (var i = 0; i < observations.length; i++) {
        normal.drawObservation(observations[i]);
    }
    normal.drawDistribution(new Beta(15, 2));

    const transform = new Plot(transformContainer, {
        width: width,
        height: height,
        xdomain: [-5, 5],
        ydomain: [0, 1]
    });

    for (var i = 0; i < observations.length; i++) {
        transform.drawObservation(logitObservations[i]);
    }
    transform.annotationLine(logitStat.mean(), 'Mean');
    transform.drawDistribution(
        new StudenttCustom(logitStat.size() - 1, logitStat.mean(), logitStat.sd() / Math.sqrt(logitStat.size())),
        { showArea: true }
    );

    const studentt = new Plot(studenttContainer, {
        width: width,
        height: height,
        xdomain: [0, 1.2],
        ydomain: [0, 1]
    });
    studentt.annotationLine(expit(logitStat.mean()), 'Mean');
    studentt.drawDistribution(
        new LogStudenttCustom(logitStat.size() - 1, logitStat.mean(), logitStat.sd() / Math.sqrt(logitStat.size())),
        { showArea: true }
    );
})();
