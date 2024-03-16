async function fetchData(startYear, endYear) {
    const data = [];
    
    for (let year = startYear; year <= endYear; year++) {
      const response = await fetch(`https://ergast.com/api/f1/${year}/driverStandings.json`);
      const result = await response.json();
  
      result.MRData.StandingsTable.StandingsLists[0].DriverStandings.forEach(driverStanding => {
        data.push({
          year,
          position: driverStanding.position,
          points: driverStanding.points,
          driver: driverStanding.Driver.givenName + ' ' + driverStanding.Driver.familyName
        });
      });
    }
  
    return data;
  }

  function createYearDropdown() {
    const yearDropdown = d3.select("#year-dropdown");
    const years = d3.range(1950, 2024);
  
    yearDropdown.selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);
  
    yearDropdown.on("change", fetchAndUpdateData);
  }
  
  createYearDropdown();
  

  async function fetchAndUpdateData() {
    const selectedYear = document.getElementById("year-dropdown").value;
    const url = `https://ergast.com/api/f1/${selectedYear}/driverStandings.json`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      const standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
  
      const formattedData = standings.map((standing) => ({
        driver: `${standing.Driver.givenName} ${standing.Driver.familyName}`,
        points: +standing.points,
        constructor: standing.Constructors[0].name,
      }));
  
      createBarChart(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  
  fetchAndUpdateData();
  
  

