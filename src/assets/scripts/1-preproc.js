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
var preproccess = function(roadIncident, population, countries){
    var dict = {};
    for(var country in countries)
        dict[country] = {};
    
    var items = ['all', 'F', 'M', 'F 00-14', 'M 00-14', 'F 15-29', 'M 15-29', 'F 30-44', 'M 30-44', 'F 45-59', 'M 45-59', 'F 60+', 'M 60+', '00-14', '15-29', '30-44', '45-59', '60+'];
    
    
    roadIncident.forEach(function(incident){
        var year = incident['annee'], country = incident['pays'];
        dict[country][year] = {};
        
        // Store data
        var d = dict[country][year];
        items.forEach(function(item){d['rel '+item] = parseFloat(incident[item]);});
        items.forEach(function(item){d['abs '+item] = NaN;});
    });
    
    population.forEach(function(pop){
        var year = pop['annee'], country = pop['pays'];
        if(country in dict && year in dict[country]){
            var d = dict[country][year];
            items.forEach(function(item){d['abs '+item] = Math.round(d['rel '+item]*pop[item]/1000000);});
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
            d_country.push(d)
        }
        data.push({pays: country, data: d_country});
    }
    
    return data;
}
