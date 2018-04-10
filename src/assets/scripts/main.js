var D3=null;


(function (d3, searchBar) {
  "use strict";

  D3 = d3;
  setupWidgets();
  
  d3.queue()
    .defer(d3.csv, "./data/incident.csv")
    .defer(d3.csv, "./data/population.csv")
    .defer(d3.csv, "./data/countryInfos.csv")
    .defer(d3.csv, "./data/pib.csv")
    .defer(d3.csv, "./data/leg.csv")
    .defer(d3.csv, "./data/tech.csv")
    .awaitAll(function (error, results) {
        /***** Chargement des données *****/
        if (error || results.length !== 6) {
            throw error;
        }
        var roadIncident = results[0], population = results[1], 
            countryInfos = results[2], pib = results[3],
            leg = results[4], tech=results[5];

        /***** Prétraitement des données *****/
        var countries = preproccessCountries(countryInfos);
        var data = preproccess(roadIncident, population, pib, countries);
        
        
        console.log(countries);
        
        // Echelle de couleur
        var continentColors = {
            'Amérique du Sud': '#d73027',
            'Amérique du Nord': '#ff2000',
            'Amérique Centrale': '#ff7f00',
            'Océanie': '#2166ac',
            'Europe Est': '#33a02c',
            'Europe Ouest': '#71c671',
            'Moyen Orient': '#ffff33',
            'Asie': '#ffff33',
            'Afrique': '#000000'
        };
        var continentColor = c => c in continentColors ? continentColors[c] : '#333';
        
        /***** Création des Graphes *****/
    
        /****************************************************************************************************/
        /* GLOBAL MEAN 
        var globalMean = new SimpleLineChart(d3.select('#SVG_globalMean'), 'globalMean');
        globalMean.dataX(d => d.annee).xTitle('Annee')
                    .dataY(d => d!=undefined?d['rel all']:NaN)
                    .yTitle('Taux de Mortalité').yUnit('per 100 000 hab.');
        globalMean.seriesName(d => d.pays);
        globalMean.xAxis.tickFormat(d=>d.toString());
        globalMean.on('dataDrawn', function(e){e.gData.select('.serieLine').classed('meanSerie', d=>d.pays=='MEAN');})
        globalMean.enable(d=>d.pays=='MEAN').classed('selected',d=>d.pays=='MEAN');
        globalMean.htmlTip(d=>'<h3>'+d.dataX+'</h3> <p><b>Mortalité moyenne: </b>'+D3.format('f.1')(d.dataY)+' / 100 000 hab.</p>');
        globalMean.data(data);
        
        
        /****************************************************************************************************/
        /* FRANCE */        
        
        // function pour sélectionner la mortalité par tranche d'age pour un pays
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
            dataOut.country = country;
            dataOut.prefix = prefix;
            dataOut.cumul = cumul;
            return dataOut;
        }
        
        // Lit la mortalité absolue par tranche d'age non cumulée
        var frData = selectCountryData('France', 'abs ', false);
        
        // Fonction qui génère le area chart sans les évenements
        var setupFr = function(svg, name){
            var frBack = new AreaLineChart(d3.select('#SVG_'+svg), name).marginLeft(80);
            frBack.dataX(d => d.annee).xTitle('Annee').domainX([1970, 2007])
                        .yTitle('Nombre de morts').domainY(d=>[0, d[1]+100]);
            frBack.xAxis.tickFormat(d=>d.toString());
            frBack.data(frData);
            
            D3.select('#stackToggle_'+name).classed('stackToggleFr', true)
            .on('change', function(){
                var checked = this.checked;
                if(frBack.data().cumul != checked){
                    frData = selectCountryData('France', 'abs ', checked);
                    frBack.data(frData);
                    frBack.classed('noArea', !checked)
                    D3.selectAll('.stackToggleFr input').each(function(){
                        this.checked = checked; 
                        this.dispatchEvent(new Event('change'));
                    });
                }
            });
            
            return frBack;
        }
        
        // Génère les graphes sur les 3 slides qui se concentre sur la france
        var fr = setupFr('france', 'france');
        var frLeg = setupFr('legislation', 'legislation');
        var frTech = setupFr('techniques', 'techniques');
        
        /*** AVANCÉES LEGISLATION ***/
        var overlayLegislation = new ChronologicalOverlay(frLeg, 'legOverlay');
        overlayLegislation.dataX(d=>d['Année']).dataTitle(d=>d['Titre']).dataInfo(d=>d['Text']).data(leg);
        
        /*** AVANCÉES TECHNIQUES ***/
        var overlayTechnique = new ChronologicalOverlay(frTech, 'legTechnique');
        overlayTechnique.dataX(d=>d['Année']).dataTitle(d=>d['Titre']).dataInfo(d=>d['Text']).data(tech);
        
        
        /****************************************************************************************************/
        /* PIB */
        
        // Crée la "frise chronologique" de sélection de l'année
        var pibContextPlot = new ContextLineChart(d3.select('#SVG_PIB_Context'), 'PIB_Context');
        pibContextPlot.dataX(d=>d.annee).xTitle('Annee').xAxis.tickFormat(d=>d.toString());
        pibContextPlot.dataY(d=>d['rel all']);
        pibContextPlot.seriesName(d=>d.pays)
                      .seriesFilter(d=>d.pays=='MEAN')
                      .lineColor(d=>countries[d.pays]!=undefined?continentColor(countries[d.pays].continent):'#333')
                      .lineWidth(d=>d.pays=='MEAN'?0.5:1.5)
                      .domainY([0,150]).domainX([1970,2005])
                      .animDuration(0)
                      .data(data);
        
        // Crée un scatter plot présentant la mortalité en fonction du PIB.
        var pibPlot = new ScatterPlot(d3.select('#SVG_PIB'), 'PIB');
        pibPlot.dataX(d=>d['rel pib']/1000).xTitle('PIB').xUnit('$kUS/hab.').domainX([0, 60])
               .dataY(d=>d['rel all']).yTitle('Taux de Mortalité').yUnit('/ 100 000 hab.').yTitleShort('Mortalité').domainY([0, 150])
               .dotColor(d => continentColor(countries[d.pays].continent))
               .dataR(d=>d['abs all']);
        pibPlot.seriesName(d=>d.pays);
        
        // Extrait les PIB/mortalité pour tous les pays, pour une année y
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
        
        var year = pibContextPlot.cursorX();
        pibPlot.backgroundLabel(year).data(selectYear(year, data));
        
        // Légende Aire
        circleLegend(d3.select('#PIB_areaLegend'))
            .domain(pibPlot.r.domain())
            .range(pibPlot.r.range())
            .values([0.5, 4, 10])
            .width(70)
            .height(70)
            .textPadding(23)
            .render();
        console.log(pibPlot.r.range())
        
        // Mets à jour le graphe lorsque la position du curseur change
        pibContextPlot.on('cursorXChanged', function(e){
            var x = Math.ceil(e.cursorX-0.1);
            if(x!=year){
                pibPlot.lockDraw()
                    .backgroundLabel(x)
                    .data(selectYear(x, data))
                    .unlockDraw();
                year = x;
            }
        });
        // Arrête l'animation lorsque le cursor atteint la dernière année
        pibContextPlot.on('reachEnd', function(){
            var b = D3.select('#PIB_play i');
            b.classed('fa-pause', false);
            b.classed('fa-play', true);
        });
        // Affiche la courbe d'un pays lorsqu'il est pointer par la souris dans le ScatterPlot
        pibPlot.on('hoveredSerieChanged', function(e){
            if(e!=null)
                pibContextPlot.seriesFilter(d=>(d.pays=='MEAN' || d.pays==e.hoveredSerie));
            else
                pibContextPlot.seriesFilter(d=>d.pays=='MEAN');
        });
        
        // Crée un bouton play/pause (les icones proviennent de Font Awesome)
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
        
        
        // Barre de recherche
        
        var selectPIBSerie = function(s){
            pibPlot.hoveredSerie = s;
        }
        var resetPIBSerie = function(){
            pibPlot.hoveredSerie = null;
        }
        new SearchBar('SEARCHBAR_PIB', selectPIBSerie, resetPIBSerie, data.filter(d=>d.pays!='MEAN').map(d=>d.pays), 'Rechercher un pays');
        
        /****************************************************************************************************/
        /* Global graph */
        var global = new SimpleLineChart(d3.select('#SVG_global'), 'global');
        global.dataX(d => d.annee).xTitle('Annee')
              .dataY(d => d!=undefined?d['rel all']:NaN)
              .yTitle('Taux de Mortalité').yUnit('/ 100 000 hab.')
              .lineColor(d=>countries[d.pays]!=undefined?continentColor(countries[d.pays].continent):'#333');
        global.seriesName(d => d.pays);
        global.xAxis.tickFormat(d=>d.toString());
        global.domainY(d=>[0, d[1]+10])
        global.htmlTip(function(d){
            var t = '<h3>' + d.dataX + '</h3>';
            t += '<p>';
            t += '<b>'+ d.serieName + ': </b>' + d3.format('f.1')(d.dataY) + ' / 100 000 hab.<br /><br />';
            global.data().forEach(function(e){
                if(e.selected && e.pays!=d.serieName){
                    t +=  e.pays + ': ' + d3.format('f.1')(e.data.filter(h=>h.annee==d.dataX)[0]['rel all']) + ' / 100 000 hab.<br />';
                }
            });
            t+= '</p>';
            return t;
        });
        global.tip.direction('n').offset([-10, 0]);
        
        global.data(data.filter(d=>d.pays!='MEAN'));
        
        global.data().forEach(function(d){d.selected=false;});
        
        var updateSelected = function(){
            var selected = [];
            global.data().forEach(function(d){if(d.selected) selected.push(d.pays);});
            global.classed('selected', d=>d.selected);
            
            if(selected.length)
                global.enable = d=>d.selected;
            else
                global.enable = d=>true;
            
            globalContextPlot.seriesFilter(d=>d.pays=='MEAN' || selected.includes(d.pays));
        }
        
        var toggleGlobalSerie = function(s){
            global.data().forEach(function(d){if(d.pays==s) d.selected = !d.selected;});
            updateSelected();
        }
        var selectGlobalSerie = function(s){
            global.data().forEach(function(d){d.selected |= d.pays==s;});
            updateSelected();
        }
        var resetGlobalSerie = function(){
            global.data().forEach(function(d){d.selected = false});
            updateSelected();
        }
        
        global.on('click', function(){ if(global.hoveredSerie()!=null) toggleGlobalSerie(global.hoveredSerie()); });
        
        new SearchBar('SEARCHBAR_global', selectGlobalSerie, function(){}, data.filter(d=>d.pays!='MEAN').map(d=>d.pays), 'Rechercher un pays', resetGlobalSerie);
        
        var globalContextPlot = new ContextLineChart(d3.select('#SVG_global_Context'), 'global_context', true);
        globalContextPlot.dataX(d=>d.annee).xTitle('Annee').xAxis.tickFormat(d=>d.toString());
        globalContextPlot.dataY(d=>d['rel all']).domainY(d=>[0,d[1]]);
        globalContextPlot.seriesName(d=>d.pays)
                      .seriesFilter(d=>d.pays=='MEAN')
                      .lineColor(d=>countries[d.pays]!=undefined?continentColor(countries[d.pays].continent):'#333')
                      .data(data);
        globalContextPlot.on('brushend', function(e){global.domainX(globalContextPlot.focusDomain());});
        
        /****************************************************************************************************/
        /* Lien texte */
        var GRAPHES = {
            'fr': fr,
            'frLeg': frLeg,
            'frTech': frTech,
            'overlayLegislation': overlayLegislation,
            'overlayTechnique': overlayTechnique,
            'PIB': pibPlot,
            'global': global
        }
        
        d3.selectAll('.graphRef').each(function(){
            var link = d3.select(this).attr('data-link').split('.');
            var g = GRAPHES[link[0]];
            console.log(link, g);
            d3.select(this).on('mouseenter', function(){g.hoveredSerie = link[1];})
                           .on('mouseout', function(){g.hoveredSerie = null;});
        });
    });

})(d3, searchBar);
 
