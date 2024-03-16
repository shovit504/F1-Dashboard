(async function () {
  // Add the select input element for years
  const select = d3.select("#viz5")
    .append("select")
    .attr("id", "year-selector")
    .on("change", updateData);

  // Add options for the years
  for (let i = 1950; i <= new Date().getFullYear(); i++) {
    select.append("option").text(i);
  }

  // Set dimensions and margins of the graph
  const width = 800;
  const height = 600;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  // Create the SVG
  const container = d3.select('#viz5');
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Create a projection
  const projection = d3.geoEquirectangular()
    .scale(width / (2 * Math.PI))
    .translate([width / 2, height / 2]);

  // Create a path generator
  const path = d3.geoPath().projection(projection);

  // Get the GeoJSON data for the world map
  const worldGeoJsonUrl = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
  const worldGeoResponse = await fetch(worldGeoJsonUrl);
  const worldGeoData = await worldGeoResponse.json();

  // Draw the world map
  svg.selectAll("path")
    .data(worldGeoData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "white")
    .attr("stroke-width", "1")
    .attr("fill", "#c4c4c4");

  async function updateData() {
    // Get the selected year
    const season = d3.select("#year-selector").node().value;

    // Fetch the data for the selected year
    const ergastApiUrl = `http://ergast.com/api/f1/${season}.json`;
    const response = await fetch(ergastApiUrl);
    const data = await response.json();
    const races = data.MRData.RaceTable.Races;

    // Update the race bubbles
    const circles = svg.selectAll("circle").data(races);
    circles.enter()
      .append("circle")
      .attr("r", 0)
      .merge(circles)
      .attr("cx", d => projection([d.Circuit.Location.long, d.Circuit.Location.lat])[0])
      .attr("cy", d => projection([d.Circuit.Location.long, d.Circuit.Location.lat])[1])
      .attr("fill", "red")
      .attr("opacity", 0.8)
      .on("mouseover", (event, d) => showTooltip(d, event))
      .on("mouseout", (event, d) => hideTooltip(d, event))
      .transition()
      .duration(1000)
      .attr("r", 5);

    circles.exit()
      .transition()
      .duration(1000)
      .attr("r", 0)
      .remove();
  }

  // Initialize the data
  updateData();

  // Add the tooltip div
  const tooltip = container
  .append("div")
  .attr("class", "tooltip2")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("background", "white")
  .style("padding", "5px")
  .style("border-radius", "5px")
  .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.1)")
  .style("visibility", "hidden");
  
  // Show the tooltip
  function showTooltip(d, event) {
  d3.select(event.currentTarget).attr("r", 8);
  tooltip.html(`<strong>Circuit:</strong> ${d.Circuit.circuitName}<br><strong>Grand Prix:</strong> ${d.raceName}<br><strong>Country:</strong> ${d.Circuit.Location.country}`)

  .style("visibility", "visible")
  .style("top", (event.pageY - 10) + "px")
  .style("left", (event.pageX + 10) + "px");
  }
  
  // Hide the tooltip
  function hideTooltip(d, event) {
  d3.select(event.currentTarget).attr("r", 5);
  tooltip.style("visibility", "hidden");
  }
  
  // Move the tooltip with the mouse
  svg.on("mousemove", (event) => {
  const [x, y] = d3.pointer(event);
  tooltip.style("top", (y - 10) + "px")
  .style("left", (x + 10) + "px");
  });
  
  })();
