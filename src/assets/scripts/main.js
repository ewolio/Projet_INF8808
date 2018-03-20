(function (d3, searchBar) {
  "use strict";

  var mainPanel = d3.select('#panel')[0][0];
  
  
  // Main graph
  var width = mainPanel.offsetWidth - 20, height = mainPanel.offsetHeight - 20;
  var mainSVG = d3.select('#panel svg');
  var g = mainSVG.append('g');
  
  var y = d3.scale.linear().range([height, 0]);
  var x = d3.scale.linear().range([0, width]);
  var color = d3.scale.category10();
  
  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var yAxis = d3.svg.axis().scale(y).orient('left');
  
  
  
  /***** Chargement des données *****/
  d3.queue()
    .defer(d3.csv, "./data/incident.csv")
    .defer(d3.csv, "./data/population.csv")
    .defer(d3.csv, "./data/countryInfos.csv")
    .awaitAll(function (error, results) {
      if (error || results.length !== 3) {
        throw error;
      }
      var roadIncident = results[0];
      var population = results[1];
      var countryInfos = results[2];

    /***** Prétraitement des données *****/
      var countries = preproccessCountries(countryInfos);
      var data = preproccess(roadIncident, population, countries);
      domainX(x, data);
      domainY(y, data);
      console.log(countries);
      domainColor(color, countries);
      
      
    /***** Création du Graphe *****/
      var gXAxis = g.append('g').classed('axis', true);
      gXAxis.attr('transform', 'translate(0, %h)'.replace('%h', height) )
           .call(xAxis)
              
      var gYAxis = g.append('g').attr('class', 'axis');
      gYAxis.call(yAxis)
         
      var gLines = g.append('g')
                  .attr('id', 'lines')
                  
      var line = d3.svg.line()
                   .x(d => x(d.annee))
                   .y(d => y(d['rel all']))
                   .interpolate("basis");
             
        gLines.selectAll('path')
            .data(data).enter()
            .append('path')
            .attr('d', d => line(d.data))
            .attr('fill', 'none')
            .attr('stroke', d => color(countries[d.pays].continent))
            .attr("stroke-width", 1)
            .attr('opacity', d=>d.pays=='France'?1:0.3)
            .classed('tooltip', true)
            .append('span')
                .classed('tooltiptext', true)
                .html(d=>d.pays);
      
      });

})(d3, searchBar);
 
