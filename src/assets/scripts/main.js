var D3=null;


(function (d3, searchBar) {
  "use strict";

  D3 = d3;
  //D3._onload = [];
  //D3.onload = function(callback){D3._onload.push(callback);};
  
  d3.queue()
    .defer(d3.csv, "./data/incident.csv")
    .defer(d3.csv, "./data/population.csv")
    .defer(d3.csv, "./data/countryInfos.csv")
    .defer(d3.csv, "./data/pib.csv")
    .awaitAll(function (error, results) {
        /***** Chargement des données *****/
        if (error || results.length !== 4) {
            throw error;
        }
        var roadIncident = results[0], population = results[1], 
            countryInfos = results[2], pib = results[3];

        /***** Prétraitement des données *****/
        var countries = preproccessCountries(countryInfos);
        var data = preproccess(roadIncident, population, pib, countries);
        
        /***** Création des Graphes *****/
    
        /* Global Mean */
        var globalMean = new SimpleLineChart(d3.select('#SVG_globalMean'), 'globalMean');
        globalMean.dataX(d => d.annee).xTitle('Annee')
                    .dataY(d => d!=undefined?d['rel all']:NaN)
                    .yTitle('Taux de Mortalité').yUnit('per 100 000 hab.');
        globalMean.seriesName(d => d.pays);
        globalMean.xAxis.tickFormat(d=>d.toString());
        globalMean.on('dataDrawn', function(e){e.gData.select('.chartLine').classed('meanSerie', d=>d.pays=='MEAN');})
        globalMean.data(data);
        
        /* PIB */
        var pibContextPlot = new ContextLineChart(d3.select('#SVG_PIB_Context'), 'PIB');
        pibContextPlot.dataX(d=>d.annee).xTitle('Annee').xAxis.tickFormat(d=>d.toString());
        pibContextPlot.dataY(d=>d['abs all']);
        pibContextPlot.seriesName(d=>d.pays)
                      .seriesFilter(d=>d.pays=='MEAN')
                      .data(data);
        
        var pibPlot = new ScatterPlot(d3.select('#SVG_PIB'), 'PIB');
        pibPlot.dataX(d=>d['rel pib']/1000).xTitle('PIB').xUnit('$kUS/hab.').domainX([0, 60])
               .dataY(d=>d['rel all']).yTitle('Taux de Mortalité').yUnit('/ 100 000 hab.').yTitleShort('Mortalité').domainY([0, 140])
               .dataR(d=>d['abs all']);
        pibPlot.seriesName(d=>d.pays);
        
        var selectYear = function(y, data){
            var result = [];
            data.forEach(function(dPays){
                if(dPays.pays=='MEAN')
                    return;
                var dAnnee = dPays.data.filter(d=>d.annee==y);
                if(dAnnee.length == 1)
                    result.push($.extend(dAnnee[0], {annee: y, pays: dPays.pays, continent: dPays.continent}));
            });
            return result;
        };
        
        var year = pibContextPlot.cursorX;
        console.log(year);
        pibPlot.backgroundLabel(year).data(selectYear(year, data));
        
        pibContextPlot.on('cursorMoved', function(e){
            var x = Math.round(e.x);
            pibPlot.lockDraw()
                   .backgroundLabel(x)
                   .data(selectYear(x, data))
                   .unlockDraw();
        });
    });

})(d3, searchBar);
 
