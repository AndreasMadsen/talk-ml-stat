(function () {
  const distributions = window.require('distributions');
  const d3 = window.require('d3');
  const Plot = window.require('./plot');

  const mean = 0.8;
  const sd = Math.sqrt(0.0007272727272727272);

  const margin = {top: 50, right: 30, bottom: 30, left: 30};
  const width = 900 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const normal = distributions.Normal(mean, sd);

  const svg = d3.select("#clt-d3-density").append("svg")
    .attr("class", "d3")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const container = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const plot = new Plot(container, {
    width: width,
    height: height,
    xdomain: [
      Math.max(0, normal.mean() - 3 * Math.sqrt(normal.variance())),
      normal.mean() + 3 * Math.sqrt(normal.variance())
    ],
    ydomain: [0, normal.pdf(normal.mean())]
  });
  plot.drawDistribution(normal);
  plot.drawDistribution(normal, {showLine: false, showArea: true, areaStart: 0, areaEnd: 0.05, annotate: '5%'});
  plot.drawDistribution(normal, {showLine: false, showArea: true, areaStart: 0.2, areaEnd: 0.6, annotate: '40%'});
  plot.drawDistribution(normal, {showLine: false, showArea: true, areaStart: 0.99, areaEnd: 1, annotate: '1%'});
})();
