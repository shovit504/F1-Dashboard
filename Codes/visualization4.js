async function fetchRaceData(year) {
  const response = await fetch(`https://ergast.com/api/f1/${year}.json`);
  const result = await response.json();
  return result.MRData.RaceTable.Races;
}

// Replace this function with a real API call or your own weather data
async function fetchWeatherData(race) {
  // Simulate random weather conditions for the example
  const weatherConditions = ['Sunny', 'Cloudy', 'Rain', 'Windy'];
  return weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
}

async function createWeatherImpactTracker(year) {
  const raceData = await fetchRaceData(year);

  for (let race of raceData) {
    race.weather = await fetchWeatherData(race);
  }

  const weatherConditions = ['Sunny', 'Cloudy', 'Rain', 'Windy'];

  const container = d3.select('#viz4');
  container.select('svg').remove();

  const margin = { top: 20, right: 100, bottom: 30, left: 200};
  const width = 830- margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "1px solid black")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("pointer-events", "none");


  const x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1);

  const y = d3.scaleBand()
    .rangeRound([height, 0])
    .padding(0.1);

  const color = d3.scaleOrdinal()
    .domain(weatherConditions)
    .range(['#fdae61', '#abd9e9', '#2c7bb6', '#d7191c']);

  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  x.domain(raceData.map(d => d.round));
  y.domain(raceData.map(d => d.Circuit.circuitName));

  svg.selectAll('.heat-rect')
  .data(raceData)
  .enter().append('rect')
  .attr('class', 'heat-rect')
  .attr('x', d => x(d.round))
  .attr('y', d => y(d.Circuit.circuitName))
  .attr('width', x.bandwidth())
  .attr('height', y.bandwidth())
  .style('fill', d => color(d.weather))
  .on("mouseenter", (event, d) => {
    tooltip.transition()
      .duration(200)
      .style("opacity", 1);
    tooltip.html(`<span style="color:red;">${d.Circuit.circuitName}</span><br/><span style="color:${color(d.weather)};">${d.weather}</span>`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  })
  .on("mousemove", (event, d) => {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  })
  .on("mouseleave", (event, d) => {
    tooltip.transition()
      .duration(200)
      .style("opacity", 0);
  });

  svg.append("text")
  .attr("class", "x-axis-label")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom)
  .text("Round");

  svg.append("text")
  .attr("class", "y-axis-label")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -margin.left + 20)
  .text("Circuit Name");


  svg.selectAll('.heat-rect')
    .data(raceData)
    .enter().append('rect')
    .attr('class', 'heat-rect')
    .attr('x', d => x(d.round))
    .attr('y', d => y(d.Circuit.circuitName))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .style('fill', d => color(d.weather));

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

    svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y))
    .selectAll('text')
    .attr('font-family', 'F1-Regular')
    .attr('dx', '-0.5em')
    .attr('dy', '-0.5em')
    .attr('transform')
    .style('text-anchor', 'end');



}

function createWeatherYearDropdown() {
  const yearDropdown = d3.select("#weather-year-dropdown");
  const years = d3.range(1950, 2024);

  yearDropdown.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  yearDropdown.on("change", updateWeatherImpactTracker);
}

async function updateWeatherImpactTracker() {
  const selectedYear = document.getElementById("weather-year-dropdown").value;
  await createWeatherImpactTracker(selectedYear);
}

createWeatherImpactTracker(2022); // Replace 2021 with the desired year
createWeatherYearDropdown();