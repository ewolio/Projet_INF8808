jQuery(document).ready(function($){
    
    // INIT SCROLLING
    var sections = $('.slide'),
        currentSection = -1,
        animLock=false;
    
    var w = $(window).width(),
        h = $(window).height();
        
    initSections();
        
    captureScrolling();
    
    function initSections(){
        sections.css('width', toPx(w));
        sections.css('height', toPx(h));
        sections.css('position', 'absolute');
        sections.css("top", toPx(h));
        sections.hide();
        
        var firstSection = sections.first();
        firstSection.css("top", toPx(0));
        firstSection.show();
        
        currentSection = 0;
        
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
        $('#slideSelector div').eq(0).addClass('currentSelector');
    }
    
    function setSection(i){
        if(i < 0 || i >= sections.length || i==currentSection || animLock)
            return
        $('#slideSelector div').removeClass('currentSelector');
        $('#slideSelector div').eq(i).addClass('currentSelector');
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
            nextS.css('z-index', 10);
            nextS.show();
            
            nextS.animate({opacity: 1}, DURATION, EASING);
            
            await sleep(2*DURATION);
            prevS.hide();
            nextS.css('z-index', 1);
        }else{
        nextS.css('top', prevI<nextI?toPx(+h):toPx(-h));
        nextS.show();
        
        if(prevI < nextI){
            prevS.animate({top:-h}, DURATION, EASING);
            nextS.animate({top:0}, DURATION, EASING);
        }else{
            prevS.animate({top:+h}, DURATION, EASING);
            nextS.animate({top:0}, DURATION, EASING);
        }
        
        await sleep(2*DURATION);
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
