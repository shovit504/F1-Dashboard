(async function() {
    const driverChampionshipData = await fetchDriverChampionshipData();
    const constructorChampionshipData = await fetchConstructorChampionshipData();
    const data = [...driverChampionshipData, ...constructorChampionshipData].sort((a, b) => b.wins - a.wins);

    const width = 800;
    const height = 600;
    const margin = {top: 10, right: 20, bottom: 10, left: 20};

    const treemapLayout = d3.treemap()
        .size([width, height])
        .paddingOuter(2)
        .paddingTop(0)
        .paddingBottom(50)
        .round(true);

    const root = d3.hierarchy({children: data})
        .sum(d => d.wins)
        .sort((a, b) => b.value - a.value);

    treemapLayout(root);

    const container = d3.select('#viz3')
        .style('position', 'relative'); // Add this line to set container's position to relative
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const tooltip = container.append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('opacity', 0)
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '5px');

    const nodes = svg.selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    nodes.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => d.data.type === 'driver' ? '#1f77b4' : '#ff7f0e')
        .attr('stroke', '#000')
        .on('mouseover', (event, d) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`${d.data.name}<br/>Wins: ${d.data.wins}`)
                .style('left', (event.layerX + 10) + 'px') // Update this line to use event.layerX instead of event.pageX
                .style('top', (event.layerY - 28) + 'px'); // Update this line to use event.layerY instead of event.pageY
        })
        .on('mouseout', (event, d) => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    nodes.append('text')
        .attr('x', 5)
        .attr('y', 20)
        .text(d => d.data.name)
        .attr('font-size', 12)
        .attr('fill', '#fff');

        async function fetchDriverChampionshipData() {
            const response = await fetch('https://ergast.com/api/f1/driverStandings/1.json?limit=1000');
            const result = await response.json();
            const standings = result.MRData.StandingsTable.StandingsLists;
        
            const driverWins = new Map();
            standings.forEach(d => {
                const driverName = `${d.DriverStandings[0].Driver.givenName} ${d.DriverStandings[0].Driver.familyName}`;
                driverWins.set(driverName, (driverWins.get(driverName) || 0) + 1);
            });
        
            return Array.from(driverWins.entries()).map(([name, wins]) => ({
                name,
                wins,
                type: 'driver'
            }));
        }
        
        async function fetchConstructorChampionshipData() {
            const response = await fetch('https://ergast.com/api/f1/constructorStandings/1.json?limit=1000');
            const result = await response.json();
            const standings = result.MRData.StandingsTable.StandingsLists;
        
            const constructorWins = new Map();
            standings.forEach(d => {
                const constructorName = d.ConstructorStandings[0].Constructor.name;
                constructorWins.set(constructorName, (constructorWins.get(constructorName) || 0) + 1);
            });
        
            return Array.from(constructorWins.entries()).map(([name, wins]) => ({
                name,
                wins,
                type: 'constructor'
            }));
        }
        
})();

