class SearchBar{
    constructor(selector, validate, reset, values, placeholder='', resetAll=null){
        var self=this;
        if(selector[0]!='#')
            selector = '#'+selector;
        D3.select(selector).append('input').attr('title', 'search-input').attr('type', 'text').attr('placeholder', placeholder);
        D3.select(selector).append('button').classed('searchButton', true).attr('title', 'Rechercher')
                               .append('img').attr('alt', 'Rechercher').attr('src', './assets/img/search.svg');
        if(resetAll)
            D3.select(selector).append('button').classed('resetButton', true).attr('title', 'Réinitialise')
                               .append('img').attr('alt', 'Réinitialise').attr('src', './assets/img/reset.svg');

        this.validate = validate;
        this.reset = reset;
        this.values = values;
        this.resetAll = resetAll;
                               
        new autoComplete({
            selector: selector+" input",
            minChars: 1,
            source: function(term, suggest) {
            term = term.toLowerCase();
            var matches = [];
            values.forEach(function(v) {
                if (~v.toLowerCase().indexOf(term)) {
                    matches.push(v);
                }
            });
            suggest(matches);
            },
            renderItem: function(item, search) {
                search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
                return "<div class='autocomplete-suggestion' data-val='"
                    + item + "'>" + item.replace(re, "<b>$1</b>") + "</div>";
            },
            onSelect: function(e, term, item) {
                validate(item.getAttribute("data-val"));
            }
        });

        // Ajout d'évènements sur la barre de recherche et le bouton.
        this.searchBarInput = D3.select(selector).select("input");
        this.searchBarInput.on("keydown", function () {
            if (D3.event.key === "Enter") {
                self.validateInput();
            } else {
                reset();
                self.searchBarInput.classed("error", false);
            }
        });
        D3.select(selector+" .searchButton")
            .on("click", function(){self.validateInput});
        if(resetAll)
            D3.select(selector+" .resetButton")
                .on("click", function(){self.resetAll()});
    }

      /**
       * Valide la valeur entrée dans la barre et réalise une recherche.
       */
      validateInput() {
        function normalize(str) {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        var value = this.searchBarInput.node().value.toLowerCase();
        if (!value) {
          return;
        }
        var currentValue = normalize(value);
        const countryFound = this.values.find(function(v) {
          return normalize(v.toLowerCase()) === currentValue;
        });
        if (countryFound) {
          this.validate(countryFound);
        } else {
          this.reset();
          self.searchBarInput.classed("error", true);
        }
      }
}

/**********************************************************************************************/

var setupWidgets = function(){
    // Populate Toggle Switch
    var switches = D3.selectAll('.ToggleSwitch');
    var inputs = switches.append('input');
    inputs.attr('type','checkbox').on('change', function(e, i){
        var s = switches[0][i], input = inputs[0][i];
        if(s.checked != input.checked){
            s.checked = input.checked;
            s.dispatchEvent(new Event('change'));
        }
    });
    switches.append('span');
    switches.each(function(){this.checked=false;})
    
}
