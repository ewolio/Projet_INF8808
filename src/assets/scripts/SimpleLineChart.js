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
    constructor(canva, name){
        super(canva, name);
        
        // D3 functions components
        this.d3Line = d3.svg.line()
                        .x(d => this.x(this.xCoord(d)))
                        .y(d => this.y(this.yCoord(d)))
                        .interpolate("basis");
                        
        this._lineColor = d => d.color!==undefined ? d.color : '#444'; 
        this._lineWidth = d => d.width!==undefined ? d.width : 0.5; 
    }
    
    drawData(g){
        var lines = g.selectAll('path')
                     .data(this.data);
                     
        lines.exit().remove(); // Remove old lines
        var newLines = lines.enter().append('path')
                                    .attr('fill', 'none');
                     
        lines.attr('d', d => this.d3Line(this.seriesData(d)))
             .attr('stroke', this.lineColor)
             .attr('stroke-width', this.lineWidth);
    }
    
    set lineColor(c){
        this.lockDraw();
        if(isfunction(c))
            this._lineColor = c;
        else
            this._lineColor = d => c;
        this.releaseDraw(draw=true);
    }
    get lineColor(){
        return this._lineColor;
    }

    set lineWidth(w){
        this.lockDraw();
        if(isfunction(w))
            this._lineWidth = w;
        else
            this._lineWidth = d => w;
        this._lineWidth = w;
        this.releaseDraw(draw=true);
    }
    get lineWidth(){
        return this._lineWidth;
    }
}
