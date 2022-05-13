(function () {
    const d3 = window.require('d3');
    const manageState = window.require('./manage_state');
    const Plot = window.require('./plot');
    const EmpericalDistribution = window.require('./emperical_distribution');

    var frame = null;
    var state = null;

    const margin = {top: 10, right: 30, bottom: 30, left: 30};
    const width = 700 - margin.left - margin.right;
    const height = 140 - margin.top - margin.bottom;

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
        for (var i = 0; i < observations.length; i++) {
          var value = observations[Math.floor(Math.random() * observations.length)];
          this.nextMean += value;
          this.nextSamples.push(value);
        }
        this.nextMean = this.nextMean / observations.length;
      }

      animator() {
        frame.samples.drawObservation(this.nextSamples.pop());

        if (this.nextSamples.length === 0) {
          this.data_means.push(this.nextMean);

          frame.mean.clearDistributions();
          frame.mean.drawDistribution(
            new EmpericalDistribution(this.data_means, 50, 0, 1),
            { showArea: true }
          );
          frame.samples.clearObservations();
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
          frame.samples.clearObservations();
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
          .attr("height", 3 * (height + margin.top + margin.bottom));

        this.source = new Plot(
          this.svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
          {
            width: width,
            height: height,
            xdomain: [0, 1],
            ydomain: [0, 1],
            ylabel: "Seeds",
            yticks: false
          }
        );
        for (var i = 0; i < observations.length; i++) {
            this.source.drawObservation(observations[i]);
        }

        this.samples = new Plot(
            this.svg
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + (height + margin.bottom + 2 * margin.top) + ")"),
            {
              width: width,
              height: height,
              xdomain: [0, 1],
              ydomain: [0, 1],
              ylabel: "Samples",
              yticks: false
            }
        );

        this.mean = new Plot(
          this.svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + (2*height + 2*margin.bottom + 3 * margin.top) + ")"),
          {
            width: width,
            height: height,
            xdomain: [0, 1],
            ydomain: [0, 1],
            ylabel: "Averages",
            yticks: false
          }
        );
      }
    }

    frame = new Frame(d3.select("#bootstrap-d3-algorithm"));
    state = new State(frame);
    manageState(state, document.currentScript.parentNode, 'bootstrap-algorithm-logic');

  })();
