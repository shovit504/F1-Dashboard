async function fetchPitStopData(year, round) {
  const response = await fetch(`https://ergast.com/api/f1/${year}/${round}/pitstops.json`);
  const result = await response.json();
  return result.MRData.RaceTable.Races[0].PitStops;
  
}

async function createBubbleChart(year, round) {
  const pitStopData = await fetchPitStopData(year, round);

  const container = d3.select('#viz2');
  container.select('svg').remove();

  const margin = { top: 60, right: 60, bottom: 60, left: 150 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const maxPitStops = d3.max(pitStopData, d => d.lap);
  const xScale = d3.scaleLinear()
    .domain([0, maxPitStops + 1])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([1, pitStopData.length + 1])
    .range([height, 0]);

  const rScale = d3.scaleSqrt()
    .domain([1, d3.max(pitStopData, d => d.duration)])
    .range([2, 20]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  svg.selectAll('.bubble')
    .data(pitStopData)
    .enter().append('circle')
    .attr('class', 'bubble')
    .attr('cx', d => xScale(d.lap))
    .attr('cy', (d, i) => yScale(i + 1))
    .attr('r', d => rScale(d.duration))
    .style('fill', d => colorScale(d.driverId))
    .style('opacity', 0.7)
    .on('mouseover', function (event, d) {
      d3.select(this).style('opacity', 0.5);
    
      const driver = d.driverId;
      const pitStopsTaken = pitStopData.filter(data => data.driverId === driver).length;
      const lap = d.lap;
      const duration = d.duration;
    
      const tooltipDetails = d3.select('#tooltip-details');
      tooltipDetails.html(`
          <div><strong>Driver:</strong> ${driver}</div>
          <div><strong>Number of pit stops:</strong> ${pitStopsTaken}</div>
          <div><strong>Lap:</strong> ${lap}</div>
          <div><strong>Duration:</strong> ${duration}</div>
      `)
  });
  

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('class', 'label')
    .attr('x', width)
    .attr('y', -6)
    .style('text-anchor', 'end')
    .text('Lap');

    svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale).tickFormat(d => pitStopData[d - 1].driverId))
    .append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Driver');
    
    svg.append('text')
    .attr('class', 'title')
    .attr('x', width / 2)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'F1-Regular')
    .attr('font-size', '12px')
    .text(`Pit Stop Times - ${year} Round ${round}`);

    svg.append('text')
  .attr('class', 'label')
  .attr('x', width -250)
  .attr('y', height + 50)
  .style('text-anchor', 'end')
  .text('Lap');

  svg.append('text')
  .attr('class', 'label')
  .attr('transform', 'rotate(-90)')
  .attr('x', -190)
  .attr('y', -100)
  .style('text-anchor', 'end')
  .text('Driver');
  

    
    svg.append('text')
    .attr('class', 'subtitle')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'F1-Regular')
    .attr('font-size', '12px')
    .text('Duration of pit stop is represented by the size of the circle.');
    
    
    }
    
  createBubbleChart(2020, 5); // Example usage with 2021 season, round 1.



































