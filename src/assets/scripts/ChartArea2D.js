"use strict";

class ChartArea2D{
    constructor(canva, name, chartType=[]){
        chartType.unshift('ChartArea2D');
        
        this.canva = canva;
        this.name = name;
        
        
        // Graph svg components
        this.gRoot = this.canva.append('g').attr('id', name+'_'+chartType[0]);
        
        this.gXAxis = this.gRoot.append('g').attr('id', name+'_XAxis')
                                            .classed('axis', true)
                                            .classed('xaxis', true);
        this.gYAxis = this.gRoot.append('g').attr('id', name+'_YAxis')
                                            .classed('axis', true)
                                            .classed('yaxis', true);
        this.gData = this.gRoot.append('g').attr('id', name+'_ChartData');
        
        // Axis
        this.y = D3.scale.linear();
        this.x = D3.scale.linear();
        
        this.xAxis = D3.svg.axis().scale(this.x).orient('bottom');
        this.yAxis = D3.svg.axis().scale(this.y).orient('left');
        
        this._xTitle = '';
        this._yTitle = '';
        
        // Data readers
        this._xCoord = d=>d.x;1
        this._yCoord = d=>d.y;
        this._seriesData = d=>d.data;
        this._seriesName = d=>d.name;
        
        // ChartArea attributes
        this._data = null;
        this.domainX = [0,0];
        this.domainY = [0,0];
        this._margins = [70,20,20,50];  // [left, top, right, bottom]
        this._canvaShape = [0,0];   // [width, height]  (auto updated)
        
        // Events handler
        this._drawLockCount = 0;
        this._drawRequested = 0;
        
        var self = this;
        this.canva[0][0].ownerDocument.defaultView.onresize = function(){self.canvaResized();};
        
        this.canvaResized();
    }
    
    canvaResized(){
        this.lockDraw();
        var r = this.canva[0][0].getBoundingClientRect();
        this._canvaShape =  [r.right-r.left, r.bottom-r.top];
        
        var margin = this.margins;
        
        this.x.range([0, this.width]);
        this.y.range([this.height, 0]);
        
        this.gXAxis.attr('transform', 'translate(0, '+this.height+')');
        this.gRoot.attr('transform', 'translate('+margin.left+', '+margin.top+')');
        
        this.releaseDraw(true);
    }
    
    draw(){
        // Draw 2DChartArea
        this.gXAxis.call(this.xAxis);
        this.gYAxis.call(this.yAxis);
        
        this.gXAxis.select('.axisTitle').remove();
        this.gXAxis.append('g').classed('axisTitle', true)
                   .attr('transform', 'translate('+this.width/2+',45)')
                   .append('text')
                   .html(this.xTitle);
        
        this.gYAxis.select('.axisTitle').remove();
        this.gYAxis.append('g').classed('axisTitle', true)
                   .attr('transform', 'translate(-45, '+(this.height/2)+')rotate(-90)')
                   .append('text')
                   .html(this.yTitle);
        
        // Draw data
        this.drawData(this.gData, this.data);
    }
    
    set data(newData){
        this.lockDraw();
        
        this._data = newData;
        this.updateDomains();
        
        // Legend
        // TODO
        this.releaseDraw(true);
    }
    get data(){ return this._data; }
    
    set xCoord(x){
        this._xCoord = x;
        this.requestDraw();
    }
    get xCoord(){ return this._xCoord; }
    
    set yCoord(y){
        this._yCoord = y;
        this.requestDraw();
    }
    get yCoord(){ return this._yCoord; }
    
    set seriesData(s){
        this._seriesData = s;
        this.requestDraw();
    }
    get seriesData(){ return this._seriesData; }
    
    set seriesName(n){
        this._seriesName = n;
        this.requestDraw();
    }
    get seriesName(){ return this._seriesName; }

    set xTitle(name){
        this._xTitle = name;
        this.requestDraw();
    }
    get xTitle(){return this._xTitle;}
    
    set yTitle(name){
        this._yTitle = name;
        this.requestDraw();
    }
    get yTitle(){return this._yTitle;}
    
    set marginLeft(m){ this._margins[0] = 0; requestDraw();}
    get marginLeft(){return this._margins[0];}
    
    set marginTop(m){ this._margins[1] = 0; requestDraw();}
    get marginTop(){return this._margins[1];}
    
    set marginRight(m){ this._margins[2] = 0; requestDraw();}
    get marginRight(){return this._margins[2];}
    
    set marginBottom(m){ this._margins[3] = 0; requestDraw();}
    get marginBottom(){return this._margins[3];}

    set margins(m){
        if(m instanceof Array){
            if(m.length == 4){
                this._margins = m;
                requestDraw();
            }
        }else if(m instanceof Object){
            m.left!==undefined && (this._margins[0] = m.left);
            m.right!==undefined && (this._margins[2] = m.right);
            m.top!==undefined && (this._margins[1] = m.top);
            m.bottom!==undefined && (this._margins[3] = m.bottom);
            requestDraw();
        }
    }
    get margins(){
        return {left: this._margins[0],
                top: this._margins[1],
                right: this._margins[2],
                bottom: this._margins[3]
        };
    }
    
    get width(){
        return this._canvaShape[0] - this._margins[0] - this._margins[2];
    }
    
    get height(){
        return this._canvaShape[1] - this._margins[1] - this._margins[3];
    }
    
    updateDomains(){
        this.lockDraw();
        this.domainX = [D3.min(this.data, serie => D3.min(this.seriesData(serie), d => this.xCoord(d))),
                        D3.max(this.data, serie => D3.max(this.seriesData(serie), d => this.xCoord(d)))];
                        
        this.domainY = [D3.min(this.data, serie => D3.min(this.seriesData(serie), d => this.yCoord(d))),
                        D3.max(this.data, serie => D3.max(this.seriesData(serie), d => this.yCoord(d)))];
        this.x.domain(this.domainX);
        this.y.domain(this.domainY);
        
        this.releaseDraw(true);
    }
    
    lockDraw(){
        this._drawLockCount += 1;
    }
    requestDraw(){
        if(!this._drawLockCount){
            if(this.data != null)
                this.draw();
        }else
            this._drawRequested = true;
    }
    releaseDraw(draw=false){
        if(this._drawLockCount > 0)
            this._drawLockCount -= 1;
        if(draw)
            this._drawRequested = true;
        if (this._drawLockCount== 0 && this._drawRequested){            
            if(this.data != null)
                this.draw();
            this._drawRequested = false;
        }
    }
}
 
