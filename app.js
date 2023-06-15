document.addEventListener("DOMContentLoaded", function () {
  fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
      .then(response => response.json())
      .then(data => {
          const dataset = data.monthlyVariance;
          const baseTemp = data.baseTemperature;

          const margin = { top: 100, right: 60, bottom: 150, left: 100 };
          const width = Math.min(window.innerWidth - margin.left - margin.right, 1200);
          const height = Math.min(window.innerHeight - margin.top - margin.bottom, 600);

          const svg = d3.select("#heatmap")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          const xScale = d3.scaleBand()
              .domain(dataset.map(d => d.year))
              .range([0, width]);

          const yScale = d3.scaleBand()
              .domain([...Array(12).keys()].map(d => d + 1))
              .range([0, height]);

          const colors = ["#2c7bb6", "#abd9e9", "#ffffbf", "#fdae61", "#d7191c"];
          const tempScale = d3.scaleQuantize()
              .domain(d3.extent(dataset, d => baseTemp + d.variance))
              .range(colors);

          svg.selectAll(".cell")
              .data(dataset)
              .enter()
              .append("rect")
              .attr("class", "cell")
              .attr("data-month", d => d.month - 1)
              .attr("data-year", d => d.year)
              .attr("data-temp", d => baseTemp + d.variance)
              .attr("x", d => xScale(d.year))
              .attr("y", d => yScale(d.month))
              .attr("width", xScale.bandwidth())
              .attr("height", yScale.bandwidth())
              .attr("fill", d => tempScale(baseTemp + d.variance))
              .on("mouseover", (event, d) => {
                  const tooltip = d3.select("#tooltip");
                  tooltip.attr("data-year", d.year);
                  tooltip.html(`Year: ${d.year}<br>Temperature: ${(baseTemp + d.variance).toFixed(2)}℃`);
                  tooltip.style("left", (event.pageX + 5) + "px");
                  tooltip.style("top", (event.pageY - 28) + "px");
                  tooltip.style("display", "block");
              })
              .on("mouseout", function () {
                  d3.select("#tooltip").style("display", "none");
              });

          const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(year => year % 10 === 0)).tickFormat(d => d);
          const yAxis = d3.axisLeft(yScale).tickFormat(month => {
              const date = new Date(0);
              date.setUTCMonth(month - 1);
              return d3.timeFormat("%B")(date);
          });

          svg.append("g")
              .attr("id", "x-axis")
              .attr("transform", `translate(0, ${height})`)
              .call(xAxis);

          svg.append("g")
              .attr("id", "y-axis")
              .call(yAxis);

          const legend = svg.append("g")
              .attr("id", "legend")
              .attr("transform", `translate(${width / 2 - 50}, ${height + 60})`);

          const legendCellWidth = 30;
          legend.selectAll("rect")
              .data(colors)
              .enter()
              .append("rect")
              .attr("x", (d, i) => i * legendCellWidth)
              .attr("width", legendCellWidth)
              .attr("height", 20)
              .attr("fill", d => d);

          const legendScale = d3.scaleLinear()
              .domain(d3.extent(dataset, d => baseTemp + d.variance))
              .range([0, legendCellWidth * colors.length]);

          const legendAxis = d3.axisBottom(legendScale).tickFormat(d3.format(".1f")).ticks(colors.length);
          
          legend.append("g")
              .attr("transform", "translate(0, 20)")
              .call(legendAxis);
      });
});