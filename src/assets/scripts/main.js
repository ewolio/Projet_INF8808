var D3=null;


(function (d3, searchBar) {
  "use strict";

  D3 = d3;
  
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
      
    /***** Création des Graphes *****/
    var globalMean = new SimpleLineChart(d3.select('#SVG_globalMean'), 'globalMean');
    console.log(globalMean);
    globalMean.dataX(d => d.annee).xTitle('Annee');
    globalMean.dataY(d => d!=undefined?d['rel all']:NaN).yTitle('Taux de Mortalité <small>(pour 100 000 habitant)</small>');
    globalMean.seriesName(d => d.pays)
              .xAxis.tickFormat(d=>d.toString());
              
    globalMean.data(data);
    });

})(d3, searchBar);
 
