jQuery(document).ready(function($){
    
    // INIT SCROLLING
    var sections = $('.slide'),
        currentSection = 0,
        animLock=false;
    
    initSections();
        
    captureScrolling();
    
    function initSections(){
        // CHECK ADDRESS FOR CURRENT SECTION
        var a = window.location.href;
        if(a.includes('#')){
            currentSection = parseInt(a.substring(a.indexOf('#')+1));
            if(currentSection < 0 || currentSection >= sections.length)
                currentSection = 0;
        }
        
        sections.css("top", '100%').hide();
        
        var firstSection = sections.eq(currentSection);
        firstSection.css("top", 0);
        firstSection.show();
        
        // CREATE SELECTOR
        sections.each(function(i, section){
            section = $(section);
            
            
            var s = $(document.createElement('div')).addClass('tooltip').appendTo($('#slideSelector'));
            s.click(function(){setSection(i);});
            
            var title = section.attr('title');
            if(title[0] == '#'){
                s.addClass('headerSelector');
                title = title.substring(1);
            }
            $(document.createElement('span')).html(title).addClass('tooltiptext').appendTo(s);
        });
        $('#slideSelector div').eq(currentSection).addClass('currentSelector');
    }
    
    function setSection(i){
        if(i < 0 || i >= sections.length || i==currentSection || animLock)
            return
        $('#slideSelector div').removeClass('currentSelector');
        $('#slideSelector div').eq(i).addClass('currentSelector');
        
        var a = window.location.href;
        if(a.includes('#'))
            a = a.substring(0, a.indexOf('#'));
        window.location.href = a+'#'+i;
        
        animateSection(i);
    }
    
    async function animateSection(nextI){
        animLock = true;
        
        var DURATION = 500,
            EASING = 'swing';
        
        var prevI = currentSection,
            prevS = sections.eq(prevI),
            nextS = sections.eq(nextI);
        
        var fade=true;
        if(prevI < nextI){
            for(var i=prevI+1; i<=nextI; i++){
                if(sections.eq(i).attr('transition')!='fade'){
                    fade=false;
                    break;
                }
            }
        }else{
            for(var i=prevI; i>nextI; i--)
                if(sections.eq(i).attr('transition')!='fade'){
                    fade=false;
                    break;
                }
        }
        
        if(fade){
            nextS.css('top', '0');
            nextS.css('opacity', '0');
            nextS.css('z-index', 1);
            nextS.show();
            
            nextS.animate({opacity: 1}, DURATION, EASING);
            
            await sleep(2*DURATION);
            prevS.hide();
            nextS.css('z-index', 0);
        }else{
        nextS.css('top', prevI<nextI?'100%':'-100%');
        nextS.show();
        
        if(prevI < nextI){
            prevS.animate({top:'-100%'}, DURATION, EASING);
            nextS.animate({top:0}, DURATION, EASING);
        }else{
            prevS.animate({top:'100%'}, DURATION, EASING);
            nextS.animate({top:0}, DURATION, EASING);
        }
        
        await sleep(1.2*DURATION);
        prevS.hide();
        }
        
        animLock = false;
        currentSection = nextI;
    }
    
    function prevSection(){ setSection(currentSection-1); }
    function nextSection(){ setSection(currentSection+1); }
    
    function captureScrolling(){
        // Scroll
        var delta = 0;
        var SCROLL_THRESHOLD = 15;
        
        $(window).on('DOMMouseScroll mousewheel', function(event) {
            // on mouse scroll - check if animate section
            event.preventDefault();
            if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) { 
                delta--;
                if( Math.abs(delta) >= SCROLL_THRESHOLD){
                    prevSection();
                    delta = 0;
                }
            } else {
                delta++;
                if(delta >= SCROLL_THRESHOLD){ 
                    nextSection();
                    delta = 0;
                }
            }
            return false;
        });
    }
});
