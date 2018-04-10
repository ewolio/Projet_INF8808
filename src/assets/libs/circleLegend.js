// Source: https://bl.ocks.org/eesur/7b63401950344f2dca1025d09cc7386d

function circleLegend(selection) {

    let instance = {}

    // set some defaults 
    const api = {
        domain: [0, 100], // the values min and max
        range: [0, 80], // the circle area/size mapping
        values: [8, 34, 89], // values for circles
        width: 500,
        height: 500,
        suffix:'', // ability to pass in a suffix
        circleColor: '#888',
        textPadding: 40,
        textColor: '#454545'
    }
    
    const sqrtScale = D3.scale.sqrt()
        .domain(api.domain)
        .range(api.range)

    instance.render = function () {

        const s = selection.append('g')
            .attr('class', 'legend-wrap')
            // push down to radius of largest circle
            .attr('transform', 'translate(0,' + sqrtScale(D3.max(api.values)) + ')')

        // append the values for circles
        s.append('g')
            .attr('class', 'values-wrap')
            .selectAll('circle')
            .data(api.values)
            .enter().append('circle')
            .attr('class', d => 'values values-' + d)
            .attr('r', d => sqrtScale(d))
            .attr('cx', api.width/2)
            .attr('cy', d => api.height/2 - sqrtScale(d))
            .style('fill', 'none') 
            .style('stroke', api.circleColor) 
            .style('opacity', 0.5) 

        // append some lines based on values
        s.append('g')
            .attr('class', 'values-line-wrap')
            .selectAll('.values-labels')
            .data(api.values)
            .enter().append('line')
            .attr('x1', d => api.width/2 + sqrtScale(d))
            .attr('x2', api.width/2 + sqrtScale(api.values[api.values.length-1]) + 10)
            .attr('y1', d => api.height/2 - sqrtScale(d))
            .attr('y2', d => api.height/2 - sqrtScale(d))
            .style('stroke', api.textColor)
            .style('stroke-dasharray', ('2,2'))

        // append some labels from values
        s.append('g')
            .attr('class', 'values-labels-wrap')
            .selectAll('.values-labels')
            .data(api.values)
            .enter().append('text')
            .attr('x', api.width/2 + sqrtScale(api.values[api.values.length-1]) + api.textPadding)
            .attr('y', d => (api.height/2 - sqrtScale(d)) + 5)
            .attr('shape-rendering', 'crispEdges')
            .style('text-anchor', 'end')
            .style('fill', api.textColor)
            .text(d => d + api.suffix)

        return instance
    }

    for (let key in api) {
        instance[key] = getSet(key, instance).bind(api)
    }

    return instance

    // https://gist.github.com/gneatgeek/5892586
    function getSet(option, component) {
        return function (_) {
            if (! arguments.length) {
                return this[option];
            }
        this[option] = _;
        return component;
      }
    }
    
} 
