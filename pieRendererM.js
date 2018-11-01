
///////////////////////////////////////////////////////////////////////
//
// Module: pieRenderer CLASS 
//
// Author: Isidoros Ioannou
//
// Referencies: Mike Chantler
//
// What it does:
//	This JavaScript module implements a simple pie chart in D3.js
//	It adds an svg to the targetDOMelement where it renders the chart
//
// 40% student 60% course
//	
//
//
///////////////////////////////////////////////////////////////////////

"use strict" //This catches acidental global declarations

function piechart(targetDOMelement) { 
	//Here we use a function declaration to imitate a 'class' definition
	

	//Delare the main object that will be returned to caller
	var piechartObject = {};
	
	//=================== PUBLIC FUNCTIONS =========================
	
	piechartObject.loadAndRenderDataset = function (ds) {
		dataset=ds;
		
		render();
		return piechartObject; //to enable chaining
	}
	piechartObject.width = function (svgWidth) {
		width = svgWidth;
		resize();
		render();
		return piechartObject; //to enable chaining
	}
	piechartObject.height = function (svgHeight) {
		height = svgHeight;
		resize();
		render();
		return piechartObject; //to enable chaining
	}	
	piechartObject.overideLabels = function (over) {
		
		labelSetter=over;
		return piechartObject;

	}
	piechartObject.overideArcs=function(arcs){
		
		arcSetter=arcs;
		return piechartObject;
	}
	
	piechartObject.removeCalback=function(callout){
		pieOut=callout;
		return piechartObject;
	}
	piechartObject.callBackOver = function(callOver) {
		
		pieOver = callOver;
		return piechartObject;
	}
	piechartObject.callBackClick = function(callClick) {
		pieClick = callClick;
		return piechartObject;
	}
	//=================== PRIVATE VARIABLES ====================================
	var width = 500;
	var height = 500;
	var dataset = [];	
	var outerRadius;
	var innerRadius;
	var arcShapeGenerator = d3.svg.arc();
	var pieLayoutGenerator = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return Number(arcSetter(d)); 
		}); 

	var color = d3.scale
		.ordinal()
		.range(['#756bb1','#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5']);

	//Create SVG and group
	var svg = d3
		.select(targetDOMelement)
		.append("svg");
		
	var grp = svg	
		.append("g");
	
	var arcLayoutData;
	
	var pieOut=function(d,i){
		console.log("mouseout");
	}
	var pieOver = function (d,i){
		//Set to print out bar info on console by default
		console.log ("mouseover callback on pies");
	}
	var pieClick = function (d,i){
		//Set to print out bar info on console by default
		console.log ("click callback on pies");
	}
	var labelSetter = function(d){
		console.log("No key");
	}
	var arcSetter=function(d){
		//return d.Values.sum;
		console.log("No arcs");
	}
	//=================== PRIVATE FUNCTIONS ====================================
	
	

	function resize(){
		outerRadius = width/2-50;
		innerRadius = 0;	
		
		arcShapeGenerator
			.innerRadius(innerRadius)
			.outerRadius(outerRadius);		
		svg
			.attr("width", width)
			.attr("height", height);			
		grp 
			.attr("transform", "translate(" + (outerRadius +10) + "," + (outerRadius+20) + ")");
			
	render();
}
	function render(){
		arcLayoutData=pieLayoutGenerator(dataset);
		GUP_Arcs(arcLayoutData, grp);
		GUP_Labels(arcLayoutData, grp);
	}

	function GUP_Arcs (layoutData, _grp){
		//BIND
		
		var arcs = _grp.selectAll("path")
			.data(layoutData);
		
		//ENTER: Add paths for new arcs
		var arcsEnter = arcs
			.enter()
			.append("path")
			.on("mouseover", function(d, i){
					
					pieOver(d, i);
			})
			.on("mouseout",function(d,i){
				pieOut(d, i);
			});
			
		arcsEnter.append("title")
			.text(function(d){
				var text = d.data.Values.grants.map(function(d){return d.ID}).join(", ");
				
				return"Value :" + d.data.Values.sum + "£, Grants" + text; 
				});
		//UPDATE 2
		//Define shape and colour
		arcs
			.attr("fill", function(d, i) {
					//console.log(this)
					var fill = this.getAttribute("fill")
					return color(i);
				})
			.on("click", pieClick)
		arcs
			.transition()
			.delay(function(d,i){
				return i / dataset.length *2000;
			})
			.duration(1000)
			.attr("d", arcShapeGenerator)
		arcs.select("title").text(function(d){
				var text = d.data.Values.grants.map(function(d){return d.ID}).join(", ");
				
				return "Value :" + d.data.Values.sum + "£, Grants" + text; 
			});
		//	
		//EXIT: Remove old arcs
		arcs
			.exit()
			.transition()
			.duration(500)
			.remove();
	}	
		
	function GUP_Labels (layoutData, _grp){		
		//BIND
		var labels = _grp.selectAll("text")
			.data(layoutData);
		
		//ENTER
		//Add text elements for new labels
		labels
			.enter()
			.append("text")
			.attr("class", "pielabels");
		//UPDATE2
		//Define content and location 

		labels
			.transition()
			.delay(function(d, i) {
			   return i / dataset.length * 2000;
			})
			.duration(1000)
			.attr("transform", function(d) {
				
				var c = arcShapeGenerator.centroid(d);
				c[0]= c[0] *1.5;
				c[1]= c[1] * 1.5;
				return "translate(" + c  + ")rotate(" + angle(d)+")";
			})
			.attr("dy",  ".35em")
			.attr("text-anchor", "middle")
			.text(function(d) { 
				
				return labelSetter(d.data);
			} );		
		
		//EXIT: Remove old labels
		labels.exit().remove();					
	}

	function angle(d) {
      var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
      return a > 90 ? a - 180 : a;
    }
    function mouseover(){
    console.log(this);
    	d3.select(this)
    
    	.transition()
    	.duration(600)
    	.attr("d",arcShapeGeneratorFinal);
    }
    function mouseout() {
	  d3.select(this).transition()
	      .duration(600)  	
	      .attr("d", arcShapeGenerator);
	}
	

	
	
	resize();	
		
	//================== IMPORTANT do not delete ==================================
	return piechartObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of piechart() declaration