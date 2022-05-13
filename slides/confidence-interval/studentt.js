(function () {
  const distributions = window.require('distributions');
  const StudenttCustom = window.require('./student_t_custom');
  const manageState = window.require('./manage_state');
  const d3 = window.require('d3');
  const Plot = window.require('./plot');

  var state = null;

  const margin = {top: 10, right: 30, bottom: 30, left: 30};
  const width = 600 - margin.left - margin.right;
  const height = 220 - margin.top - margin.bottom;

  // Sampled from `rbeta(100, 8, 2)`
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
  const mean = 0.8;
  const sd = Math.sqrt(0.01454545);

  class State {
    constructor() {
      this.observationsDrawn = 0;
      this.animatorTimer = null;

      const xdomain = [0, 1];
      const ydomain = [0, (new StudenttCustom(100, mean, sd / 10)).pdf(mean)];

      const svg = d3.select("#ci-d3-studentt").append("svg")
        .attr("class", "d3")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 2 * (height + margin.top + margin.bottom));

      const normalContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      const studenttContainer = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.bottom + 2 * margin.top) + ")");

      this.normal = new Plot(normalContainer, {
        width: width,
        height: height,
        xdomain: xdomain,
        ydomain: ydomain
      });
      this.studentt = new Plot(studenttContainer, {
        width: width,
        height: height,
        xdomain: xdomain,
        ydomain: ydomain
      });
    }

    pause() {
      clearInterval(this.animatorTimer);
    }

    drawObservations(count) {
      const summary = window.require('summary');
      this.observationsDrawn = count;

      const obs = [];
      this.normal.clearObservations();
      for (var i = 0; i < count; i++) {
        obs.push(observations[i]);
        this.normal.drawObservation(observations[i]);
      }

      return summary(obs);
    }

    animator() {
      if (this.observationsDrawn === observations.length) {
        return clearInterval(this.animatorTimer);
      }

      const stat = this.drawObservations(this.observationsDrawn + 1);
      const se = stat.sd() / Math.sqrt(stat.size());

      this.studentt.clearDistributions();
      this.studentt.clearObservations();
      this.studentt.drawObservation(stat.mean());
      this.studentt.drawDistribution(distributions.Normal(stat.mean(), se)), {classname: 'opacity', showArea: true};
      this.studentt.drawDistribution(new StudenttCustom(stat.size() - 1, stat.mean(), se));
    }

    set(stateIndex) {
      clearInterval(this.animatorTimer);

      if (stateIndex === 0) {
        const stat = this.drawObservations(5);
        this.normal.clearDistributions();

        this.studentt.clearDistributions();
        this.studentt.clearObservations();
      } else if (stateIndex === 1) {
        const stat = this.drawObservations(5);
        const se = stat.sd() / Math.sqrt(stat.size());
        this.normal.clearDistributions();

        this.studentt.clearDistributions();
        this.studentt.clearObservations();
        this.studentt.drawObservation(stat.mean());
        this.studentt.drawDistribution(distributions.Normal(stat.mean(), se));
      } else if (stateIndex === 2) {
        const stat = this.drawObservations(5);
        const se = stat.sd() / Math.sqrt(stat.size());
        this.normal.clearDistributions();
        this.normal.drawDistribution(distributions.Normal(mean, sd));

        this.studentt.clearDistributions();
        this.studentt.clearObservations();
        this.studentt.drawObservation(stat.mean());
        this.studentt.drawDistribution(distributions.Normal(stat.mean(), se), {classname: 'opacity'});
        this.studentt.drawDistribution(new StudenttCustom(stat.size() - 1, stat.mean(), se));
      } else if (stateIndex === 3) {
        this.animatorTimer = setInterval(this.animator.bind(this), 50);
      }
    }
  }

  state = new State();
  manageState(state, document.currentScript.parentNode, 'ci-studentt-logic');
})();
