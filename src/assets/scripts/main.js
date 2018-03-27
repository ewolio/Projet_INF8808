var D3=null;


(function (d3, searchBar) {
  "use strict";

  D3 = d3;
  
  var mainPanel = d3.select('#panel')[0][0];
  
  
  // Main graph
  var width = mainPanel.offsetWidth - 20, height = mainPanel.offsetHeight - 20;
  var mainSVG = d3.select('#panel svg');
  
  
  d3.queue()
    .defer(d3.csv, "./data/incident.csv")
    .defer(d3.csv, "./data/population.csv")
    .defer(d3.csv, "./data/countryInfos.csv")
    .awaitAll(function (error, results) {
      if (error || results.length !== 3) {
  
  /***** Chargement des données *****/
        throw error;
      }
      var roadIncident = results[0];
      var population = results[1];
      var countryInfos = results[2];

    /***** Prétraitement des données *****/
      var countries = preproccessCountries(countryInfos);
      var data = preproccess(roadIncident, population, countries);
      
    /***** Création du Graphe *****/
    var graph = new SimpleLineChart(mainSVG, 'main');
    graph.xCoord = d => d.annee, graph.xTitle = 'Annee';
    graph.yCoord = d => d['rel all'], graph.yTitle = 'Taux de Mortalité <small>(pour 100 000 habitant)</small>';
    graph.data = data;
      
    });

})(d3, searchBar);
 
