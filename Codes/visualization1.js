
function createBarChart(data) {
  // Remove existing chart
  d3.select("#bar-chart").selectAll("*").remove();

  const margin = { top: 20, right: 20, bottom: 110, left: 50 };
  const width = 850 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("#bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define x and y scales
  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  // Set x and y domains
  x.domain(data.map(d => d.driver));
  y.domain([0, d3.max(data, d => +d.points)]);

  // Add x-axis
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Adjust x-axis label font size and padding
  xAxis.style("font-size", "12px").attr("y", 10).attr("x", -5);

  // Add x-axis title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Drivers");

  // Add y-axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add y-axis title
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Points");

  // Add bars and attach event handlers
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.driver))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.points))
    .attr("height", d => height - y(d.points))
    .style("fill", "red")
    .on("mouseover", (event, d) => showTooltip(d))
  .on("mousemove", (event, d) => moveTooltip(event))
  .on("mouseout", (event, d) => hideTooltip());
} // This curly brace should be here

function showTooltip(d) {
  const tooltip = d3.select("#tooltip1");
  tooltip
    .html(
      `<strong>Driver:</strong> ${d.driver}<br>
      <strong>Points:</strong> ${d.points}<br>
      <strong>Constructor:</strong> ${d.constructor}`
    )
    .classed("hidden", false);
}

function hideTooltip() {
  const tooltip = d3.select("#tooltip1");
  tooltip.classed("hidden", true);
}

function moveTooltip(event) {
  const tooltip = d3.select("#tooltip1");
  tooltip
    .style("left", `${d3.event.pageX + 10}px`)
    .style("top", `${d3.event.pageY - 30}px`);
}



    // Call the createBarChart function with initial data
    fetchAndUpdateData();
