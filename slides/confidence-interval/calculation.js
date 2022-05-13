(function () {
  const d3 = window.require('d3');
  const distributions = window.require('distributions');
  const summary = window.require('summary');

  const margin = {top: 20, right: 30, bottom: 30, left: 30};
  const width = 480 - margin.left - margin.right;
  const height = 436 - margin.top - margin.bottom;

  // Sampled from `rgamma(100, 100, 1/(0.1/100))`
  const observations = [
    0.863367810743224, 0.681460534274309, 0.865503953243458, 0.5638138650724, 0.744813625927115,
    0.947207984521809, 0.927831207727075, 0.939828828197837, 0.553375928961857, 0.65128480990911,
    0.712550592828182, 0.9858931868348, 0.78213465201822, 0.917750105509262, 0.978817832919915,
    0.506001868088882, 0.739883643361279, 0.914619556741007, 0.863006584348621, 0.592582959741838,
    0.789128735402557, 0.799198431592056, 0.538029284856009, 0.857597032519997, 0.893725737175615,
    0.623398622361521, 0.762709813210816, 0.531053746344887, 0.515768447787796, 0.800927074216965,
    0.582556100734405, 0.783945461303085, 0.785062188496748, 0.886043992564313, 0.757343215849428,
    0.720357909306354, 0.874299012519612, 0.406159968832137, 0.854081153349818, 0.816498713774936,
    0.400739091546741, 0.88229129891996, 0.683480200617075, 0.736321432485092, 0.874194450986221,
    0.595407880607023, 0.570137883130127, 0.937113945285924, 0.797284974512079, 0.638311722295033,
    0.602047923436874, 0.793613081427743, 0.375774988960045, 0.863399335504866, 0.88017514360046,
    0.953274803578611, 0.837564653857, 0.889686381978267, 0.895057611038006, 0.857180012718854,
    0.732094331906043, 0.894824080540837, 0.916446021244477, 0.851463258638338, 0.840342744474476,
    0.871184600887302, 0.727677400312197, 0.656228832204548, 0.641764632840363, 0.970914794100862,
    0.805484443289088, 0.866883285314564, 0.638626538306006, 0.935759829180262, 0.872480122670752,
    0.961130697783642, 0.864035304747643, 0.94118931154092, 0.796078391500643, 0.761263524572883,
    0.65843644937794, 0.72499716734654, 0.947780036213223, 0.593291927765173, 0.652410324631066,
    0.737978486630919, 0.820324684098966, 0.608216219809592, 0.537782948345027, 0.575488391539982,
    0.889791137915674, 0.938556442652636, 0.861162335026833, 0.864599842552293, 0.894495771959286,
    0.896953383138608, 0.71231381750424, 0.905134001649141, 0.908675256490446, 0.76528126263085
  ];

  class Plot{
    constructor(container, normal) {
      this.container = container;
      this.normal = normal;

      this.x = d3.scaleLinear()
        .range([0, width])
        .domain([
          Math.max(0, normal.mean() - 3 * Math.sqrt(normal.variance())),
          normal.mean() + 3 * Math.sqrt(normal.variance())
        ]);

      this.y = d3.scaleLinear()
        .range([height, 0])
        .domain([
          0,
          normal.pdf(normal.mean())
        ]);

      this.container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.x));

      this.container.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(this.y));
    }

    bar(x, name, fragment) {
      const rect = this.container.append('rect')
        .attr('x', this.x(x))
        .attr('class', 'bar')
        .attr('width', 1)
        .attr('height', this.y(0));

      const text = this.container.append('text')
        .attr('x', this.x(x))
        .attr('y', -5)
        .attr('class', 'description')
        .text(name);

      if (fragment !== undefined) {
        rect
          .attr("data-fragment-index", fragment)
          .classed("fragment", true);
        text
          .attr("data-fragment-index", fragment)
          .classed("fragment", true);
      }
    };

    _pdf(start, end) {
      const xstart = this.x(
        Math.max(this.x.domain()[0], this.normal.inv(start))
      );
      const xend = this.x(
        Math.min(this.x.domain()[1], this.normal.inv(end))
      );

      const curve = [];
      for (var xpx = xstart; xpx <= xend; xpx++) {
        var x = this.x.invert(xpx);
        curve.push({
          x: x,
          y: this.normal.pdf(x)
        });
      }

      return curve;
    };

    area(start, end) {
      const self = this;
      const data = this._pdf(start, end);

      const area = d3.area()
          .x(function(d) { return self.x(d.x); })
          .y0(height)
          .y1(function(d) { return self.y(d.y); });

      this.container.append("path")
        .attr("class", "area")
        .attr("d", area(data));

      const xstart = this.x(data[0].x);
      const xend = this.x(data[data.length - 1].x);
      const xmid = (xstart + xend) / 2;

      this.container.append("text")
        .attr("class", "area")
        .attr("x", xmid)
        .attr("y", this.y(5))
        .text(((end - start) * 100).toFixed(0) + ' %');
    };

    line(start, end) {
      const self = this;
      const data = this._pdf(start, end);

      const line = d3.line()
          .x(function(d) { return self.x(d.x); })
          .y(function(d) { return self.y(d.y); });

      this.container.append("path")
        .attr("class", "line")
        .attr("d", line(data));
    }
  }

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

  const stat = summary(observations.slice(0, 30));
  const normal = new StudenttCustom(stat.size(), stat.mean(), stat.sd() / Math.sqrt(stat.size()));

  const svg = d3.select("#ci-d3-calculation").append("svg")
    .attr("class", "d3")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const container = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const plot = new Plot(container, normal);

  plot.area(0.025, 0.975);
  plot.line(0, 1);
  plot.bar(0.72, 'Baseline', 0);
  plot.bar(stat.mean(), 'Estimated');
})();
