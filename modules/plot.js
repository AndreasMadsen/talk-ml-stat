const d3 = require('d3/dist/d3.js');

class Plot {
    constructor(container, {bins, width, height, xdomain, ydomain, ylabel, yticks}={}) {
      this.bins = bins || 200;
      this.container = container;
      this.height = height;
      this.width = width;
      this.xdomain = xdomain;
      this.bin_width_px = this.width / this.bins;
      this.bin_width_scale = (xdomain[1] - xdomain[0]) / this.bins;

      this.x = d3.scaleLinear()
        .range([0, width])
        .domain(xdomain);

      this.y = d3.scaleLinear()
        .range([height, 0])
        .domain(ydomain);

      this.container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(this.x));

      this.container.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(this.y).tickValues(yticks === false ? [] : null));

      if (ylabel) {
        this.container.append("text")
          .attr("class", "label")
          .attr("text-anchor", "end")
          .attr("y", 6)
          .attr("dy", ".75em")
          .attr("transform", "rotate(-90)")
          .text(ylabel);
      }

      this.obs = this.container.append("g")
        .attr("class", "observations");

      this.dist = this.container.append("g")
        .attr("class", "distributions");
    }

    binIndex(x) {
      const idx = Math.floor((x - this.xdomain[0]) / this.bin_width_scale);
      if (idx < 0 || idx >= this.bins) {
        return null
      }
      return idx;
    }

    clearObservations() {
      this.obs.selectAll('rect')
        .remove();
    }

    drawObservation(obs, { classname }={}) {
      const index = this.binIndex(obs);
      if (index === null) return; // out of axis domain

      this.obs.append('rect')
        .attr("class", "bin" + (classname ? ' ' + classname : ''))
        .attr("x", index * this.bin_width_px)
        .attr("width", this.bin_width_px)
        .attr("height", this.height);
    }

    clearDistributions() {
      this.dist.selectAll('path')
        .remove();
    }

    _pdf(distribution, start, end) {
      const xstart = this.x(
        Math.max(this.x.domain()[0], distribution.inv(start))
      );
      const xend = this.x(
        Math.min(this.x.domain()[1], distribution.inv(end))
      );

      const curve = [];
      for (var xpx = xstart; xpx <= xend; xpx++) {
        var x = this.x.invert(xpx);
        curve.push({
          x: x,
          y: distribution.pdf(x)
        });
      }

      return curve;
    };

    drawDistribution(distribution, {classname, showArea, showLine, annotate, areaStart, areaEnd} = {}) {
      if (showLine === undefined) showLine = true;
      if (!areaStart) areaStart = 0.025;
      if (!areaEnd) areaEnd = 0.975;

      const area = d3.area()
            .x((d) => this.x(d.x))
            .y0(this.height)
            .y1((d) => this.y(d.y));
      const line = d3.line()
          .x((d) => this.x(d.x))
          .y((d) => this.y(d.y));

      if (showArea) {
        this.dist.append("path")
          .attr("class", "area" + (classname ? ' ' + classname : ''))
          .attr("d", area(this._pdf(distribution, areaStart, areaEnd)));
      }
      if (showLine) {
        this.dist.append("path")
          .attr("class", "line" + (classname ? ' ' + classname : ''))
          .attr("d", line(this._pdf(distribution, 0, 1)));
      }

      if (annotate) {
        const xstart = Math.max(this.x.domain()[0], distribution.inv(areaStart));
        const xend = Math.min(this.x.domain()[1], distribution.inv(areaEnd));
        const xmid = (xstart + xend) / 2;

        this.container.append("text")
          .attr("class", "text description")
          .attr("x", this.x(xmid))
          .attr("y", this.y( this.y.domain()[0] + (this.y.domain()[1] - this.y.domain()[0]) * 0.3 ))
          .text(annotate);
      }
    }

    annotationLine(x, name, {fragment}={}) {
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
    }
}

module.exports = Plot;
