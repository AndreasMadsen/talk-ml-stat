(function () {
  const StudenttCustom = window.require('./student_t_custom');
  const manageState = window.require('./manage_state')
  const summary = window.require('summary');
  const ttest = window.require('ttest');
  const d3 = window.require('d3');
  const Plot = window.require('./plot');

  var state = null;

  // rbeta(100, 8, 2)
  const obsA = [
    0.707, 0.889, 0.824, 0.881, 0.8, 0.948, 0.969, 0.815, 0.904, 0.706,
    0.845, 0.955, 0.868, 0.84, 0.89, 0.938, 0.966, 0.916, 0.684, 0.813,
    0.765, 0.865, 0.983, 0.813, 0.728, 0.783, 0.89, 0.888, 0.972, 0.693,
    0.879, 0.616, 0.872, 0.943, 0.808, 0.886, 0.955, 0.956, 0.66, 0.711,
    0.68, 0.963, 0.86, 0.932, 0.635, 0.836, 0.696, 0.828, 0.689, 0.84,
    0.766, 0.83, 0.853, 0.896, 0.853, 0.698, 0.686, 0.929, 0.82, 0.777,
    0.777, 0.903, 0.761, 0.898, 0.762, 0.908, 0.547, 0.574, 0.895, 0.867,
    0.898, 0.641, 0.882, 0.932, 0.83, 0.764, 0.801, 0.869, 0.851, 0.896,
    0.693, 0.879, 0.728, 0.703, 0.782, 0.86, 0.917, 0.544, 0.67, 0.856,
    0.877, 0.53, 0.891, 0.821, 0.642, 0.99, 0.961, 0.97, 0.694, 0.823
  ];

  // rbeta(100, 6, 2)
  const obsB = [
    0.844, 0.904, 0.716, 0.88, 0.78, 0.67, 0.749, 0.839, 0.771, 0.903,
    0.873, 0.607, 0.716, 0.925, 0.645, 0.531, 0.892, 0.75, 0.76, 0.84,
    0.719, 0.798, 0.872, 0.556, 0.716, 0.631, 0.779, 0.813, 0.723, 0.836,
    0.695, 0.658, 0.628, 0.786, 0.861, 0.617, 0.782, 0.75, 0.763, 0.815,
    0.692, 0.91, 0.454, 0.693, 0.578, 0.404, 0.767, 0.834, 0.904, 0.815, 0.734, 0.961, 0.912, 0.87, 0.807, 0.803, 0.688, 0.786, 0.541, 0.737, 0.673, 0.988, 0.889, 0.625, 0.668, 0.739, 0.612, 0.874, 0.474, 0.738, 0.706, 0.9, 0.946, 0.867, 0.944, 0.942, 0.683, 0.576, 0.95, 0.734, 0.668, 0.81, 0.849, 0.921, 0.478, 0.963, 0.727, 0.856, 0.813, 0.944, 0.609, 0.829, 0.885, 0.838, 0.485, 0.766, 0.857, 0.669, 0.683, 0.702
  ];

  const margin = {top: 10, right: 30, bottom: 30, left: 30};
  const width = 700 - margin.left - margin.right;
  const height = 220 - margin.top - margin.bottom;

  class State {
    constructor() {
      const mean = 0.8;
      const sd = Math.sqrt(0.01454545);
      const xdomain = [0, 1];
      const ydomain = [
        0, new StudenttCustom(100, mean, sd / 10).pdf(mean) * 1.2
      ];

      const svg = d3.select("#welch-d3-interval").append("svg")
        .attr("class", "d3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 2 * (height + margin.top + margin.bottom));

      const observationsContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      const meanContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.bottom + 2 * margin.top) + ")");

      this.obs = new Plot(observationsContainer, {
        width: width,
        height: height,
        xdomain: xdomain,
        ydomain: ydomain,
        yticks: false
      });
      this.mean = new Plot(meanContainer, {
        width: width,
        height: height,
        xdomain: xdomain,
        ydomain: ydomain
      });

      this.animatorTimer = null;
      this.observationsDrawn = 0;
    }

    pause() {
      clearInterval(this.animatorTimer);
    };

    observations(count) {
      this.observationsDrawn = count;

      this.obs.clearObservations()
      for (let i = 0; i < count; i++) {
        this.obs.drawObservation(obsA[i], {classname: 'sourceA'});
        this.obs.drawObservation(obsB[i], {classname: 'sourceB'});
      }

      const statA = summary(obsA.slice(0, count));
      const statB = summary(obsB.slice(0, count));

      this.mean.clearObservations();
      this.mean.clearDistributions();
      this.mean.drawObservation(statA.mean(), {classname: 'sourceA'});
      this.mean.drawObservation(statB.mean(), {classname: 'sourceB'});

      this.mean.drawDistribution(
        new StudenttCustom(statA.size() - 1, statA.mean(), statA.sd() / Math.sqrt(statA.size())),
        {classname: 'sourceA', showArea: true}
      );
      this.mean.drawDistribution(
        new StudenttCustom(statB.size() - 1, statB.mean(), statB.sd() / Math.sqrt(statB.size())),
        {classname: 'sourceB', showArea: true}
      );

      const t = ttest(statA, statB);
      if (t.valid()) {
        document.getElementById('welch-significant-status').innerHTML = 'Not signficant';
      } else {
        document.getElementById('welch-significant-status').innerHTML = 'Signficant';
      }

    };

    animator(goal) {
      if (this.observationsDrawn === goal) {
        clearInterval(this.animatorTimer);
      }

      const sign = Math.sign(goal - this.observationsDrawn);

      state.observations(this.observationsDrawn + sign);
    };

    set(stateIndex) {
      clearInterval(this.animatorTimer);

      if (stateIndex === 0) {
        this.animatorTimer = setInterval(this.animator.bind(this, 100), 20);
      } else if (stateIndex === 1) {
        this.animatorTimer = setInterval(this.animator.bind(this, 19), 20);
      } else if (stateIndex === 2) {
        this.animatorTimer = setInterval(this.animator.bind(this, 9), 20);
      }
    }
  }

  state = new State();
  state.observations(100);
  manageState(state, document.currentScript.parentNode, 'welch-interval-logic');
})();
