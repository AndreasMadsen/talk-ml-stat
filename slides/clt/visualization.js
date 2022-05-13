(function () {
  const d3 = window.require('d3');
  const jStat = window.require('jstat');
  const distributions = window.require('distributions');
  const manageState = window.require('./manage_state');
  const Plot = window.require('./plot');

  var frame = null;
  var state = null;
  var sampler = null;

  const margin = {top: 10, right: 30, bottom: 30, left: 30};
  const width = 700 - margin.left - margin.right;
  const height = 440 - 2 * margin.top - 2 * margin.bottom;
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

    set(stateIndex) {
      clearInterval(this.animatorTimer);

      if (stateIndex === 0) {
        frame.source.clearObservations();
        frame.mean.clearObservations();
        frame.mean.clearDistributions();
        this.sample();
      } else if (stateIndex === 1) {
        this.animatorTimer = setInterval(this.animator.bind(this), 200);
        frame.mean.clearDistributions();
      } else if (stateIndex === 2) {
        this.animatorTimer = setInterval(this.animator.bind(this), 20);
        frame.mean.clearDistributions();
      } else if (stateIndex === 3) {
        this.animatorTimer = setInterval(this.animator.bind(this), 20);
        frame.mean.clearDistributions();
        frame.mean.drawDistribution(
          distributions.Normal(sampler.mean(), Math.sqrt(sampler.variance() / samples))
        );
      }
    }
  }

  class Frame {
    constructor(container) {
      this.svg = container.append("svg")
        .attr("class", "d3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + 2 * margin.top + 2 * margin.bottom);

      this.source = new Plot(
        this.svg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
        {
          width: width,
          height: height / 2,
          xdomain: sampler.domain(),
          ydomain: [0, 1],
          ylabel: "Seeds",
          yticks: false
        }
      );

      this.mean = new Plot(
        this.svg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + (2 * margin.top + margin.bottom + height / 2) + ")"),
        {
          width: width,
          height: height / 2,
          xdomain: sampler.domain(),
          ydomain: [0, distributions.Normal(sampler.mean(), Math.sqrt(sampler.variance() / samples)).pdf(sampler.mean())],
          ylabel: "Averages",
          yticks: false
        }
      );
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
