
///////////////////////////////////////////////////////////////////////
//
// Module: pack renderer CLASS 
//
// Author: Mike Bostock’s Block 7555321
//
// What it does:
//	This JavaScript module word wraps text into multiline display using tspan elements 
//
//
///////////////////////////////////////////////////////////////////////

var wrapTextSvg = function(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1, // ems
            y = text.attr('y') || 0,
            dy = parseFloat(text.attr('dy')) || 0,
            tspan = text.text(null)
                .append('tspan')
                .attr('x', 0)
                .attr('y', y)
                .attr('dy', dy + 'em');
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan')
                    .attr('x', 0)
                    .attr('y', y)
                    .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                    .text(word);
            }
        }
        var ln = -lineNumber/2-0.5;
        text.selectAll('tspan').each(function(){
            d3.select(this)
                .attr('dy', ++ln * lineHeight + dy + 'em')
        });
    });
}

//Useage:
function exampleUse(){
	let text = d3
		.select('body')
		.append('svg')
			.append('text')
				.attr('transform', 'translate(100, 50')
				.text('My very long text here')
					.call(wrapTextSvg, 200);
}
