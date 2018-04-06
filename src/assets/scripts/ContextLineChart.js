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
            this.chainableProperty('cursorX', this._dataDomainX[0], 'draw');
            
            var updateCursorPos = function(){self.cursorX = self.x.invert(D3.mouse(this)[0]);};
            this.gRoot.call(D3.behavior.drag().on('drag', updateCursorPos).on('dragstart', updateCursorPos))
            this.on('click', updateCursorPos);
            this.on('dataDrawn', function(){
                var x = self.x(self.cursorX());
                self.cursor.attr('y2', self.height+5).attr('x1',x).attr('x2',x); 
              }).on('domainChange', function(e){
                if(self.cursorX()<e.domainX[0])
                    self.cursorX = e.domainX[0];
                else if(self.cursorX()>e.domainX[1])
                    self.cursorX = e.domainX[1];
            });
        }
        this.chainableProperty('speed', 1);
                
        this._playing = false;
        setInterval(function(){self.tick()}, 50);
    }
    
    play(speed=null){
        if(speed != null)
            this.speed = speed;
        if(!this._playing && this.cursorX() == this._dataDomainX[1])
            this.cursorX = this._dataDomainX[0];
        
        this._playing = true;
    }
    
    pause(){
        this._playing = false;
    }
    
    tick(){
        if(!this._playing)
            return;
        var nextX = this.cursorX() + this._speed/20;
        if(nextX > this._dataDomainX[1]){
            nextX = this._dataDomainX[1];
            this.pause();
            this.emit('reachEnd');
        }
        this.cursorX = nextX;
    }
}

