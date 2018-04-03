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
        globalMean.on('dataDrawn', function(e){e.gData.select('.serieLine').classed('meanSerie', d=>d.pays=='MEAN');})
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
        pibPlot.backgroundLabel(year).data(selectYear(year, data));
        
        pibContextPlot.on('cursorMoved', function(e){
            var x = Math.round(e.x);
            if(x!=year){
                pibPlot.lockDraw()
                    .backgroundLabel(x)
                    .data(selectYear(x, data))
                    .unlockDraw();
                year = x;
            }
        });
        pibContextPlot.on('reachEnd', function(){
            var b = D3.select('#PIB_play i');
            b.classed('fa-pause', false);
            b.classed('fa-play', true);
        });
        
        D3.select('#PIB_play').on('click', function(){
            var b = D3.select('#PIB_play i');
            if(b.classed('fa-play')){
                b.classed('fa-play', false);
                b.classed('fa-pause', true);
                pibContextPlot.play();
            }else{
                b.classed('fa-pause', false);
                b.classed('fa-play', true);
                pibContextPlot.pause();
            }
        });
        
        /* Focus France Mean */        
        var selectCountryData = function(country, prefix, cumul=true){
            var items = ['00-14', '15-29', '30-44', '45-59', '60+'];
            var dataOut = [];
            var cData = data.filter(d=>d.pays==country)[0].data;
            for(var i=0; i<items.length; i++){
                var item = items[i];
                var itemR = [];
                cData.forEach(function(d, anneeIt){
                    if(d.annee>2007)
                        return;
                    var r = {annee: d.annee};
                    r['y'] = notNaN(d[prefix+item])?d[prefix+item]:0;
                    if(cumul && i>0)
                        r['y'] += dataOut[i-1].data[anneeIt].y;
                    itemR.push(r);
                });
                dataOut.push({name: item, data: itemR});
            }
            return dataOut;
        }
        
        var frData = selectCountryData('France', 'abs ', true);
        console.log(frData);
        
        var setupFr = function(svg, name){
            var frBack = new AreaLineChart(d3.select(svg), name);
            frBack.dataX(d => d.annee).xTitle('Annee').domainX([1970, 2007])
                        .yTitle('Nombre de morts');
            frBack.xAxis.tickFormat(d=>d.toString());
            frBack.data(frData);
        }
        
        setupFr('#SVG_france', 'france');
        setupFr('#SVG_legislation', 'legislation');
        setupFr('#SVG_techniques', 'techniques');
        
        
        /* Global graph */
        var global = new SimpleLineChart(d3.select('#SVG_global'), 'global');
        global.dataX(d => d.annee).xTitle('Annee')
                    .dataY(d => d!=undefined?d['rel all']:NaN)
                    .yTitle('Taux de Mortalité').yUnit('per 100 000 hab.');
        global.seriesName(d => d.pays);
        global.xAxis.tickFormat(d=>d.toString());
        global.data(data.filter(d=>d.pays!='MEAN'));
        
        var selectGlobalSerie = function(s){
            global.enable = d=>d.pays==s;
        }
        var resetSelection = function(){
            global.enable = d=>true;
        }
        
        
        // AUTO COMPLETION -> A DEPLACER!!!!!
         new autoComplete({
        selector: "#SEARCHBAR_global input",
        minChars: 1,
        source: function(term, suggest) {
          term = term.toLowerCase();
          var matches = [];
          data.forEach(function(d) {
            if (~d.pays.toLowerCase().indexOf(term)) {
              matches.push(d);
            }
          });
          suggest(matches);
        },
        renderItem: function(item, search) {
          search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
          return "<div class='autocomplete-suggestion' data-val='"
            + item.pays + "'>" + item.pays.replace(re, "<b>$1</b>") + "</div>";
        },
        onSelect: function(e, term, item) {
          selectGlobalSerie(item.getAttribute("data-val"));
        }
      });

      // Ajout d'évènements sur la barre de recherche et le bouton.
      var searchBarInput = d3.select("#SEARCHBAR_global input");
      searchBarInput.on("keydown", function () {
        if (d3.event.key === "Enter") {
          validateInput();
        } else {
          resetSelection();
          searchBarInput.classed("error", false);
        }
      });
      d3.select("#SEARCHBAR_global button")
        .on("click", validateInput);

      /**
       * Valide la valeur entrée dans la barre et réalise une recherche.
       */
      function validateInput() {
        function normalize(str) {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        var value = searchBarInput.node().value.toLowerCase();
        if (!value) {
          return;
        }
        var currentValue = normalize(value);
        const countryFound = data.find(function(zone) {
          return normalize(zone.pays.toLowerCase()) === currentValue;
        });
        if (countryFound) {
          selectGlobalSerie(countryFound.pays);
        } else {
          resetSelection();
          searchBarInput.classed("error", true);
        }
      }
    });

})(d3, searchBar);
 
