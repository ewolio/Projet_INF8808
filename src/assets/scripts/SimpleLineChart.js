"use strict";

/**
* Data with shape:
*   [
*       {
*           name: 'Serie 1',
*           data: [{x: 0, y: .}, {x: 1, y: .}, ...]
*       },
*       {
*           name: 'Serie 2',
*           data: [{x: 0, y: .}, {x: 1, y: .}, ...]
*       }
*   ]
*/

class SimpleLineChart extends ChartArea2D{
    constructor(canva, name, chartType=[]){
        chartType.unshift('SimpleLineChart');
        super(canva, name, chartType);
        var self = this;
        
        // D3 functions components
        this.d3Line = d3.svg.line()
                        .x(d => this.x(this._dataX(d)))
                        .y(d => this.y(this._dataY(d)))
                        .interpolate("cardinal");
                        
        this.chainableFunctionProperty('lineColor', d => d.color!==undefined ? d.color : '#444', 'draw'); 
        this.chainableFunctionProperty('lineWidth', d => d.width!==undefined ? d.width : 0.5, 'draw'); 
        this.chainableFunctionProperty('enable', d=>true, 'draw');
        this.chainableFunctionProperty('htmlTip', d => this.defaultHtmlTip(d), 
                                       function(){self.tip.html(self._htmlTip);});
        this.tip.html(this._htmlTip);
        
        this.hoveredSerie = null;
        this.circleCursorGroup = this.gData.append('g');
        this.circleCursor = this.circleCursorGroup.append('circle').classed('circleCursor', true)
                                                  .attr('visibility', 'hidden')
                                                  .attr('r', 2);
                                                       
        this.tipRootElement = this.circleCursorGroup;
        this.tip.direction('w').offset([-2, -10]);
                                    
    }
    
    drawData(g, data){
        
        var lines = g.selectAll('path.serieLine')
                     .data(data);
                     
        lines.exit().remove(); // Remove old lines
        var newLines = lines.enter().append('path').classed('serieLine', true)
                                    .attr('fill', 'none');
         
        var self = this;
        lines.transition().duration(this._animDuration)
             .attr('d', d => this.d3Line(this._seriesData(d).filter(d=>notNaN(this._dataX(d)) && notNaN(this._dataY(d)))))
             .attr('stroke', this._lineColor)
             .attr('stroke-width', this._lineWidth);
        lines.classed('disabled', d=>!this._enable(d));
        
        for(var c in this._classed){
            var f = this._classed[c];
            lines.classed(c, f);
        };
    }
    
    hoverNearestData(mousePos){
        var paths = this.gData.selectAll('path');
        
        if(mousePos !== null){
            var mouseX = mousePos[0], mouseY = mousePos[1];
            
            
            var self = this;
            var closestPoints = paths.data().filter(this._enable).map(function(d){
                var serieData = self._seriesData(d);
                var dataX = serieData.map(self._dataX);
                var nextXi = D3.bisectLeft(dataX.map(self.x), mouseX);
                var nextX = self.x(dataX[nextXi]), previousX = previousX;
                if(nextXi > 0)
                    previousX = self.x(dataX[nextXi-1]);
                
                var nearestXi = Math.abs(nextX-mouseX) <= Math.abs(previousX-mouseX) ? nextXi : nextXi-1;
                
                var nearestX = dataX[nearestXi];
                var nearestY = self._dataY(serieData[nearestXi]);
                
                return {i: nearestXi, dataX: nearestX, dataY: nearestY, screenX: self.x(nearestX), screenY: self.y(nearestY), serieName: self._seriesName(d)};
            });
            
            var distance = d => (d.screenX-mouseX)**2 + (d.screenY-mouseY)**2;
            
            var p = closestPoints[argmin(closestPoints.map(distance))];
            
            if(distance(p) < 75**2){
                this.circleCursorGroup.attr('transform', 'translate('+p.screenX+', '+p.screenY+')');
                this.vCursor.attr('x1', p.screenX).attr('x2', p.screenX);
                
                if(this.hoveredSerie == null){
                    this.circleCursor.attr('visibility', 'visible');
                }
                else if(this.hoveredSerie != p.serieName){
                    var previousPath = paths.filter(d=>self._seriesName(d)==this.hoveredSerie);
                }
                
                paths.classed('hovered', false);
                var newPath = paths.filter(d=>self._seriesName(d)==p.serieName);
                newPath.classed('hovered', true);
                this.hoveredSerie = p.serieName;
                this.tip.show(p, this.circleCursor.node());
                return;
            }
        }
        
        this.hoveredSerie = null;
        paths.classed('hovered', false);
        this.circleCursor.attr('visibility', 'hidden');
        this.tip.hide();
    }
    
    defaultHtmlTip(data){
        return `
            <h3>  %x </h3>
            <p><b>%n</b>: %y</p>
        `.replace('%n', data.serieName)
        .replace('%x', data.dataX)
        .replace('%y', D3.format('f.1')(data.dataY));
    }
    
}
