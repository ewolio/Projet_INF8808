/**
 * Fichier principal permettant de gérer la carte. Ce fichier utilise les autres fichiers
 * que vous devez compléter.
 *
 * /!\ Aucune modification n'est nécessaire dans ce fichier!
 */
(function (d3, searchBar) {
  "use strict";


  /***** Chargement des données *****/
  d3.queue()
    .defer(d3.json, "./data/incident.csv")
    .defer(d3.json, "./data/population.csv")
    .defer(d3.json, "./data/countryInfos.csv")
    .awaitAll(function (error, results) {
      if (error || results.length !== 1) {
        throw error;
      }
      var roadIncident = results[0];
      var population = results[1];
      var countryInfos = results[2];

      /***** Prétraitement des données *****/
      var data = preproc(roadIncident, population);
      
      });

})(d3, searchBar);
 
