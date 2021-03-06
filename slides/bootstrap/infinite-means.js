(function () {
    const d3 = window.require('d3');
    const summary = window.require('summary');
    const Beta = window.require('./beta');
    const manageState = window.require('./manage_state');
    const Plot = window.require('./plot');
    const EmpericalDistribution = window.require('./emperical_distribution');

    var frame = null;
    var state = null;
    var sampler = null;

    const margin = {top: 10, right: 30, bottom: 30, left: 30};
    const width = 700 - margin.left - margin.right;
    const height = 220 - margin.top - margin.bottom;
    const samples = 5;

    class State {
      constructor() {
        this.data_means = [];

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
          this.data_means.push(this.nextMean);

          frame.mean.clearDistributions();
          frame.mean.drawDistribution(
            new EmpericalDistribution(this.data_means, 50, 0, 1),
            { showArea: true }
          );
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
          this.data_means = [];
          this.sample();
        } else if (stateIndex === 1) {
          frame.source.clearObservations();
          frame.mean.clearDistributions();
          this.animatorTimer = setInterval(this.animator.bind(this), 50);
        }
      }
    }

    class Frame {
      constructor(container) {
        this.svg = container.append("svg")
          .attr("class", "d3")
          .attr("width", width + margin.left + margin.right)
          .attr("height", 2 * (height + margin.top + margin.bottom));

        this.source = new Plot(
          this.svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
          {
            width: width,
            height: height,
            xdomain: sampler.domain(),
            ydomain: [0, 1],
            ylabel: "Seeds",
            yticks: false
          }
        );

        this.mean = new Plot(
          this.svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (2 * margin.top + margin.bottom + height) + ")"),
          {
            width: width,
            height: height,
            xdomain: sampler.domain(),
            ydomain: [0, 1],
            ylabel: "Averages",
            yticks: false
          }
        );
      }
    }

    sampler = new Beta(15, 2);
    frame = new Frame(d3.select("#bootstrap-d3-infinite"));
    state = new State(frame);
    manageState(state, document.currentScript.parentNode, 'bootstrap-infinite-logic');

  })();
