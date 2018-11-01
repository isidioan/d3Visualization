
///////////////////////////////////////////////////////////////////////
//
// Module: barchart CLASS 
//
// Author: Isidoros Ioannou
// 
// Referencies: Mike Chantler
// What it does:
//	This JavaScript module implements a simple barchart in D3.js
//	It adds an svg to the targetDOMelement where it renders the chart
//  The dataset is expected to be an array of objects. Each object 
//	comprising a 'key' and 'value' attributes.
// 50%vstudent 50% course
// 
//	
//
///////////////////////////////////////////////////////////////////////

"use strict" //This catches acidental global declarations


function barchart(targetDOMelement) { 

	var barchartObject = {}; //The main object to be returned to the caller
	
	//=================== PUBLIC FUNCTIONS =========================
	//
	// Here we attach functions (methods) to the return obj 
	// so that they can be used by the caller
	//
	
	barchartObject.render = function (d) {
		render();
		return barchartObject; //allows chaining
	}
	
	barchartObject.loadDataset = function (d) {
		dataset=d;
		return barchartObject; //allows chaining
	}

	barchartObject.loadAndRenderDataset = function (d) {
		dataset=d;
		render();
		return barchartObject; //allows chaining
	}
	
	barchartObject.colour = function (c) {
		//Colour base of bars
		barColour=c;
		return barchartObject; //allows chaining
	}	
	
	barchartObject.width = function (width) {
		svgWidth += width;
		svg.attr("width", svgWidth);
		return barchartObject; //allows chaining
	}	
	
	barchartObject.barClickCalback = function (callback) {
		//enable user to specify callback called for bar click event
		barClick=callback;
		return barchartObject; //allows chaining
	}
	barchartObject.render=function(){
		render();
		return barchartObject;
	}

	barchartObject.overideKey=function(over){
		keySetter=over;
		return barchartObject;

	}
	barchartObject.overideScale=function(over){
		scaleSetter = over;
		return barchartObject;
	}
	barchartObject.Values=function(value){
		Values=value;
		return barchartObject;
	}
	barchartObject.overideTooltip=function(ride){
		mouseover=ride;
		return barchartObject;
	}
	barchartObject.notOveride=function(noride){
		mouseout=noride;
		return barchartObject;
	}
	
	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas
	var svgWidth = 700,
		svgHeight = 750,
		botMargin = 350,
		maxBarHeight = svgHeight - botMargin,
		marginRight = 5,
		marginLeft=40,
		width= svgWidth-marginLeft;
	var dataset = [];
	var Values=[];
	var barColour ;
	
	var xScale = d3.scale.ordinal();
	var yScale = d3.scale.linear();
	
	//Declare and append SVG element
	var svg = d3.select(targetDOMelement)
				.append("svg")
				.attr("width", svgWidth)
				.attr("height", svgHeight)
				.append("g")
				.attr("transform","translate( "+ marginLeft+" ,5)");			
	

	var opacityScale = d3.scale.linear(); //(for bar fill opacity);
	
	var yAxisG = svg.append("g")
				.classed("y axis",true);
				
	
	var yAxis=d3.svg.axis();

	

	//=================== PRIVATE FUNCTIONS ====================================

	var barClick = function (d,i){
		console.log ("Fill= ", this.style.fill)
	}

	var keySetter = function(d){
		console.log("No key");
	}
	var scaleSetter=function(d){
		console.log("No scales");

	}
	var mouseover=function(d){
		console.log("mouseover");
	}
	var mouseout=function(d){
		console.log("mouseout");
	}

	function render () {
		updateScales();
		updateAxis();
		GUP_bars();
		GUP_labels();
	}
	
	function updateAxis(){

		yAxis.scale(yScale)
			 .orient("left")
			 .ticks(6,"s");
			 

		yAxisG.call(yAxis);
	}
	
	function updateScales()
	{
		var maxValue=d3.max(dataset, function(d) { return Number(scaleSetter(d));});
		xScale
			.domain(d3.range(dataset.length))
			.rangeRoundBands([0, width], 0.05);
		yScale
			.domain([0, maxValue])
			.range([maxBarHeight,0]);
		opacityScale
			.domain([0, maxValue])
			.range([0.2,1]);
		
	};
	
	function GUP_bars(){
		 //Bind data
		var selection = svg
			.selectAll("rect")	
			.data(dataset, keySetter);		
		//Update1 
		selection
			.style("fill", barColour)
			.style("fill-opacity", function (d) { return opacityScale(parseInt(scaleSetter(d)));});		
		//Enter
		selection.enter()
			.append("rect")
			.append("svg:title");
			
		
		//Update 2
		selection
			.style("fill", barColour)
		    .style("fill-opacity", function (d) { return opacityScale(parseInt(scaleSetter(d)));})
		   .transition()
		   .delay(function(d, i) {
			   return i / dataset.length * 2000;
		   })
		   .duration(1000)
			   .attr("x", function(d, i) {
					return xScale(i);
			   });
			   selection.attr("y", function (d) {return yScale(parseInt(scaleSetter(d)));})
			   .attr("width", xScale.rangeBand())
			   .attr("height", function (d) {return maxBarHeight-yScale(parseInt(scaleSetter(d)));});
			   

		selection.on("click", barClick)
				.on("mouseover",mouseover)
			    .on("mouseout",mouseout);
			  	
		   
		selection.each(function(d, i) {
            d3.select(this).select("title")
            	.text(function(){ return keySetter(d)+ ", £" + (scaleSetter(d)/1000000).toFixed(2) + "M, "});	
		})
		//Exit
		selection
		   .exit()			
		   .transition().duration(200)
		   .attr("y", svgHeight)
		   .remove() 
	};

	function GUP_labels(){
	
		//Data bind
		var selection = svg
			.selectAll("text.barlabels")
			.data(dataset, keySetter);
		//Enter 
		selection.enter()
			.append("text")
			.classed("barlabels", true)
			.style("writing-mode", "tb");
			//Update 2
		selection
			.transition()
			.delay(function(d, i) {
			   return i / dataset.length * 2000;
			})
			.duration(1000)
			.attr("x", function(d, i) {
				return xScale(i) + xScale.rangeBand() / 2;
			})
			.text(keySetter)
			.attr("y", function(d) {
				return maxBarHeight + 6;
			});
		 //Exit
		selection.exit().remove() 
	}	

	
	
	
	//================== IMPORTANT do not delete ==================================
	return barchartObject; // return the main object to the caller to create an instance of the 'class'
	
} //End of barchart() declaration