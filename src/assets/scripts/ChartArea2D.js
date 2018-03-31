"use strict";

class ChartArea2D extends D3CustomChart{
    constructor(canva, name, chartType=[]){
        chartType.unshift('ChartArea2D');
        super(canva, name, chartType);
        
        // Graph svg components
        this.gXAxis = this.gRoot.append('g').attr('id', name+'_XAxis')
                                            .classed('axis', true)
                                            .classed('xaxis', true);
        this.gYAxis = this.gRoot.append('g').attr('id', name+'_YAxis')
                                            .classed('axis', true)
                                            .classed('yaxis', true);
        this.gData = this.gRoot.append('g').attr('id', name+'_ChartData')
                                           .classed('chartData', true);
        
        this.tip = d3.tip().attr('class', 'd3-tip');
        this.tipRootElement = this.gData;
        
        this.initChart();
        
        // Axis
        this.y = D3.scale.linear();
        this.x = D3.scale.linear();
        
        this.xAxis = D3.svg.axis().scale(this.x).orient('bottom');
        this.yAxis = D3.svg.axis().scale(this.y).orient('left');
        
        // ChartArea properties
        this.chainableFunctionProperty('dataX', d=>d.x, 'dataChanged');
        this.chainableFunctionProperty('dataY', d=>d.y, 'dataChanged');
        this.chainableFunctionProperty('seriesData', d=>d.data, 'dataChanged');
        this.chainableFunctionProperty('seriesName', d=>d.name, 'draw');
        this.chainableFunctionProperty('seriesFilter', d=>true, 'draw');
        
        this.chainableProperty('xTitle', '', 'draw');
        this.chainableProperty('yTitle', '', 'draw');
        
        // ChartArea cache
        this._domainX = [0,0];
        this._domainY = [0,0];
    }
    
    initChart(){
        this.gXAxis.append('g').classed('axisTitle', true)
                   .append('text');
        this.gYAxis.append('g').classed('axisTitle', true)
                   .append('text');
        
        // Background
        this.gData.append('rect').classed('areaBackground', true);
                   
        // Cursors
        this.gData.append('line').classed('vCursor', true).classed('lineCursor', true)
                                 .attr('visibility', 'hidden');
        this.gData.append('line').classed('hCursor', true).classed('lineCursor', true)
                                 .attr('visibility', 'hidden');
    }
    
    drawChart(gRoot, data){
        
        // Draw 2DChartArea
        this.x.range([0, this.width]);
        this.gXAxis.attr('transform', 'translate(0, '+this.height+')');
        this.gXAxis.call(this.xAxis);
        
        this.y.range([this.height, 0]);
        this.gYAxis.call(this.yAxis);
        
        this.gXAxis.select('.axisTitle')
                   .attr('transform', 'translate('+this.width/2+',45)')
                   .select('text')
                   .html(this._xTitle);
        
        this.gYAxis.select('.axisTitle')
                   .attr('transform', 'translate(-45, '+(this.height/2)+')rotate(-90)')
                   .select('text')
                   .html(this._yTitle);
        
        // Draw data
        var areaBackground = this.gData.selectAll('.areaBackground');
        areaBackground.attr('width', this.width).attr('height', this.height);
        this.drawData(this.gData, data);
        
        // Draw cursors
        var vCursor = this.gData.selectAll('.vCursor');
        var hCursor = this.gData.selectAll('.hCursor');
        
        vCursor.attr('y1', 0)
        vCursor.attr('y2', this.height)
        
        hCursor.attr('x1', 0)
        hCursor.attr('x2', this.width)
        
        var self = this;
        
        this.gData.on('mouseover', function(){
            vCursor.attr('visibility', 'visible');
            hCursor.attr('visibility', 'visible');
            self.mousePosChanged(D3.mouse(this));
        }).on('mousemove', function(){
            self.mousePosChanged(D3.mouse(this));
        }).on('mouseout', function(){
            vCursor.attr('visibility', 'hidden');
            hCursor.attr('visibility', 'hidden');
            self.hoverNearestData(null);
        });
        
        this.tipRootElement.call(this.tip);
    }
    
    mousePosChanged(mousePos){
        var vCursor = this.gData.selectAll('.vCursor');
        var hCursor = this.gData.selectAll('.hCursor');
        
        vCursor.attr('x1', mousePos[0]).attr('x2', mousePos[0]);
        hCursor.attr('y1', mousePos[1]).attr('y2', mousePos[1]);
        
        this.hoverNearestData(mousePos);
    }
    
    hoverNearestData(mousePos){}
    
    dataChanged(){
        this.lockDraw();
        
        var data = this._data.filter(d => this._seriesFilter(d));
        
        this.domainX = [D3.min(data, serie => D3.min(this._seriesData(serie), d => this._dataX(d))),
                        D3.max(data, serie => D3.max(this._seriesData(serie), d => this._dataX(d)))];
                        
        this.domainY = [D3.min(data, serie => D3.min(this._seriesData(serie), d => this._dataY(d))),
                        D3.max(data, serie => D3.max(this._seriesData(serie), d => this._dataY(d)))];
        this.x.domain(this.domainX);
        this.y.domain(this.domainY);
        
        this.unlockDraw(true);
    }
    
    get vCursor(){return this.gData.selectAll('.vCursor');}
    get hCursor(){return this.gData.selectAll('.hCursor');}
}
 
