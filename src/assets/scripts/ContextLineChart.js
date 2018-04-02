"use strict";

class ContextLineChart extends SimpleLineChart{
    constructor(canva, name, brush=false, chartType=[]){
        chartType.unshift('ContextLineChart');
        super(canva, name, chartType);
        var self = this;
        
        this.marginTop = 2;
        this.marginBottom = 17;
        
        if(brush){
            this.brush = D3.svg.brush().x(this.x)
                               .on('brush', function(){});
        }else{
            this.brush = null;
            this.cursor = this.gData.append('line').classed('cursor', true)
                                    .attr('y1', 0).attr('y2', this.height+5);
        }
        
        this.on('click', function(e){
            var x = self.vCursor.attr('x1');
            self.cursor.attr('x1', x).attr('x2', x);
            self.emit('cursorMoved', [{x: self.cursorX}]);
        });
        
        this.on('dataDrawn', function(){ self.cursor.attr('y2', self.height+5); });
    }
    
    get cursorX(){
        return this.x.invert(this.vCursor.attr('x1'));
    }
    
}

