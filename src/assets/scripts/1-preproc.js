"use strict";
 
/**
 * 
 * @param countryInfos   Données non prétraitées issues de countryInfos.csv.
 * @return Dictionnaire de descriptions des pays:
 *              {
 *                  'France':{continent: 'Europe', code: 'FRA'},
 *                  'Egypt': ...
 *              }
 *                  
 */
var preproccessCountries = function(countryInfos){
    var countries = {};
    countryInfos.forEach(function(d){
        countries[d['pays']] = {continent: d['Continent'], code: d['code']}
    });
    
    return countries;
}

/**
 * 
 * @param roadIncident   Données non prétraitées issues de incident.csv.
 * @param roadIncident   Données non prétraitées issues de population.csv.
 * @return Dictionnaire de données par pays au format:
 *              [
 *                  {'pays': 'France',
 *                   'data': [   
 *                      {'annee': 1970, 'popu all': , 'popu female': , 'popu F 00-14': , 'rate all': , ...},
 *                      {'annee': 1971: ...}]
 *                   },
 *                  {'pays': 'Egypt', 
 *                      ...
 *                  }
 *              ]
 *                  
 */
var preproccess = function(roadIncident, population, PIB, countries){
    var dict = {MEAN:{}};
    var items = ['all', 'F', 'M', 'F 00-14', 'M 00-14', 'F 15-29', 'M 15-29', 'F 30-44', 'M 30-44', 'F 45-59', 'M 45-59', 'F 60+', 'M 60+', '00-14', '15-29', '30-44', '45-59', '60+'];
    
    Object.keys(countries).forEach(function(country){
        var d = {};
        for(var i=1970; i<=2008; i++){
            var a = {};
            items.forEach(function(item){
                a['rel '+item] = NaN;
                a['abs '+item] = NaN;
            });
            d[i.toString()] = a;
        }
        dict[country] = d;
    });
    
    roadIncident.forEach(function(incident){
        var year = incident['annee'], country = incident['pays'];
        
        // Store data
        var d = {};
        items.forEach(function(item){d['rel '+item] = parseFloat(incident[item]);});
        dict[country][year] = d;
    });
    population.forEach(function(pop){
        var year = pop['annee'], country = pop['pays'];
        if(country in dict && year in dict[country]){
            var d = dict[country][year];
            var m={};
            if(!(year in dict['MEAN'])){
                items.forEach(function(item){m['rel '+item] = NaN; m['abs '+item] = 0; m['pop '+item] = 0;});
                dict['MEAN'][year] = m;
            }else
                m = dict['MEAN'][year];
            
            items.forEach(function(item){
                var abs = Math.round(d['rel '+item]*parseInt(pop[item])/100000);
                if(!isNaN(abs)){
                    d['abs '+item] = abs;
                    d['pop '+item] = parseInt(pop[item]);
                    m['abs '+item] += abs;
                    m['pop '+item] += parseInt(pop[item]);
                }
            });
        }
    });
    for(var year in dict['MEAN']){
        var m = dict['MEAN'][year];
        items.forEach(function(item){m['rel '+item] = m['abs '+item]/m['pop '+item]*100000});
    }
    
    
    
    PIB.forEach(function(pib){
        var year = pib['annee'], country = pib['pays'];
        if(country in dict && year in dict[country]){
            var d = dict[country][year];
            d['abs pib'] = parseFloat(pib['PIB']);
            d['rel pib'] = d['abs pib'] / d['pop all'];
        }
    });
    var data = [];
    for(var country in dict){
        var d_country = [];
        for(var year in dict[country]){
            var d = {annee: parseInt(year)}
            var country_year_data = dict[country][year];
            for(var item in country_year_data)
                d[item] = country_year_data[item];
            if(Object.keys(d).length>1)
                d_country.push(d)
        }
        data.push({pays: country, data: d_country});
    }
    
    console.log(data);
    
    return data;
}
