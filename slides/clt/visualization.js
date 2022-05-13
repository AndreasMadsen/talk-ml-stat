(function () {
  const d3 = window.require('d3');
  const jStat = window.require('jstat');
  const manageState = window.require('./manage_state');

  var frame = null;
  var state = null;
  var sampler = null;

  const margin = {top: 10, right: 30, bottom: 30, left: 30};
  const width = 700 - margin.left - margin.right;
  const height = 440 - 2 * margin.top - 2 * margin.bottom;
  const bins = 200;
  const samples = 20;

  class State {
    constructor() {
      this.nextSamples = [];
      this.nextMean = null;

      this.animatorTimer = null;

      this.sample();
    }

    sample() {
      this.nextSamples = [];
      this.nextMean = 0;
      for (var i = 0; i < samples; i++) {
        var value = sampler.sample();
        this.nextMean += value;
        this.nextSamples.push(value);
      }
      this.nextMean = this.nextMean / samples;
    }

    animator() {
      frame.source.drawObservation(this.nextSamples.pop());

      if (this.nextSamples.length === 0) {
        frame.mean.drawObservation(this.nextMean);
        frame.source.clearObservations();
        this.sample();
      }
    }

    pause() {
      clearInterval(this.animatorTimer);
    }

    resume() {
      this.set(getFragmentIndex());
    }

    set(stateIndex) {
      clearInterval(this.animatorTimer);

      if (stateIndex === 0) {
        frame.source.clearObservations();
        frame.mean.clearObservations();
        frame.mean.clearNormalDistribution();
        this.sample();
      } else if (stateIndex === 1) {
        this.animatorTimer = setInterval(this.animator.bind(this), 200);
        frame.mean.clearNormalDistribution();
      } else if (stateIndex === 2) {
        this.animatorTimer = setInterval(this.animator.bind(this), 10);
        frame.mean.clearNormalDistribution();
      } else if (stateIndex === 3) {
        this.animatorTimer = setInterval(this.animator.bind(this), 10);
        frame.mean.clearNormalDistribution();
        frame.mean.drawNormalDistribution(sampler.mean(), sampler.variance() / samples);
      }
    }
  }

  class Frame {
    constructor(container) {
      const d3 = window.require('d3');

      this.svg = d3.select("#clt-d3-visualization").append("svg")
        .attr("class", "d3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + 2 * margin.top + 2 * margin.bottom);

      this.source = new Plot(
        this.svg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
        sampler.domain(),
        "Seeds",
        height / 2
      );

      this.mean = new Plot(
        this.svg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + (2 * margin.top + margin.bottom + height / 2) + ")"),
        sampler.domain(),
        "Averages",
        height / 2
      );
    }
  }

  class Plot {
    constructor(container, domain, label, height) {
      this.container = container;
      this.height = height;

      this.x = d3.scaleLinear()
        .range([0, width])
        .domain(domain);

      this.y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 1]);

      this.container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.x));

      this.container.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(this.y).tickValues([]));

      this.container.append("text")
        .attr("class", "label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(label);

      this.obs = this.container.append("g")
        .attr("class", "observations");

      this.bins = [];
      for (var i = 0; i <= bins; i++) {
        this.bins.push(this.x.invert(i * (width / bins)));
      }
    }

    binIndex (obs) {
      // who said binary search
      for (var i = 0; i < this.bins.length; i++) {
        if (obs <= this.bins[i + 1]) return i;
      }
      return null;
    }

    clearObservations () {
      this.obs.selectAll('rect')
        .remove();
    }

    drawObservation (obs) {
      const index = this.binIndex(obs);
      if (index === null) return; // out of axis domain

      this.obs.append('rect')
        .attr("class", "bin")
        .attr("x", this.binIndex(obs) * width / bins)
        .attr("width", width / bins)
        .attr("height", this.height);
    }

    clearNormalDistribution () {
      this.container.selectAll('path.distribution')
        .remove();
    }

    drawNormalDistribution (mean, variance) {
      const self = this;
      const drawer = d3.line()
        .x(function(d) { return self.x(d.x); })
        .y(function(d) { return self.y(d.y); });

      const normalCurve = [];
      for (var xpx = 0; xpx <= width; xpx++) {
        var x = this.x.invert(xpx);
        normalCurve.push({
          'x': x,
          'y': Math.exp(- (x - mean) * (x - mean) / (2 * variance))
        });
      }

      this.container.append("path")
        .attr("class", "distribution")
        .attr("d", drawer(normalCurve));
    }
  }

  class BetaSampler {
    constructor(alpha, beta) {
      this.alpha = alpha;
      this.beta = beta;
    }

    sample() {
      return jStat.beta.sample( this.alpha, this.beta );
    }

    mean() {
      return this.alpha / (this.alpha + this.beta);
    }

    variance() {
      return (this.alpha * this.beta) / (Math.pow(this.alpha + this.beta, 2) * (this.alpha + this.beta + 1));
    }

    domain() {
      return [0, 1];
    }
  }

  sampler = new BetaSampler(8, 2);
  frame = new Frame(d3.select("#clt-d3-visualization"));
  state = new State(frame);
  manageState(state, document.currentScript.parentNode, 'clt-visualization-logic');
})();
