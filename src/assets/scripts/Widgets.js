class SearchBar{
    constructor(selector, validate, reset, values, placeholder=''){
        var self=this;
        if(selector[0]!='#')
            selector = '#'+selector;
        D3.select(selector).append('input').attr('title', 'search-input').attr('type', 'text').attr('placeholder', placeholder);
        D3.select(selector).append('button').attr('title', 'Rechercher')
                               .append('img').attr('alt', 'Rechercher').attr('src', './assets/img/search.svg');

        this.validate = validate;
        this.reset = reset;
                               
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
        this.searchBarInput = D3.select(selector+" input");
        this.searchBarInput.on("keydown", function () {
            if (D3.event.key === "Enter") {
                self.validateInput();
            } else {
                reset();
                self.searchBarInput.classed("error", false);
            }
        });
        D3.select(selector+" button")
            .on("click", function(){self.validateInput});
    }

      /**
       * Valide la valeur entrée dans la barre et réalise une recherche.
       */
      validateInput() {
        function normalize(str) {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        var value = self.searchBarInput.node().value.toLowerCase();
        if (!value) {
          return;
        }
        var currentValue = normalize(value);
        const countryFound = data.find(function(zone) {
          return normalize(zone.toLowerCase()) === currentValue;
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
