
///////////////////////////////////////////////////////////////////////
//
// Module: pack renderer CLASS 
//
// Author: Mike Chantler
//  MoDified by :Isidoros Ioannou
//
// What it does:
//	This JavaScript module implements a simple pack layout in D3.js
//	It adds an svg to the targetDOMelement where it renders the chart
// 
// Date 17/11/206
// 15% student 85% course
///////////////////////////////////////////////////////////////////////

"use strict" //This catches acidental global declarations


function packRenderer(targetDOMelement) { 
	//Here we use a function declaration to imitate a 'class' definition
	//This returns the object below with attached public methods
	var packRendererObject = {};

	
	//=================== PUBLIC METHODS =========================
	
	packRendererObject.loadAndRenderDataset = function (data,topics) {
	//Load d3 format hierarchy 
		dataset=data;
		topiclist = topics;
		render();
		return packRendererObject; //enable chaining
	}


	packRendererObject.loadAndRenderNestDataset = function (data, rootName = "") {
	//Method to load d3.nest format hierarchy directly
		packLayoutGenerator.children(function(d) {return d.values;} )
		dataset = {"key": rootName, "values": data};
		render();
		return packRendererObject; //enable chaining
	}	

	packRendererObject.overideLeafLabel = function (labelFunction) {
	//provides custom labelling for leaf nodes
		leafLabel = labelFunction;
		return packRendererObject; //enable chaining
	}	

	packRendererObject.overideParentLabel = function (labelFunction) {
	//provides custom labelling for parent nodes
		parentLabel = labelFunction;
		return packRendererObject; //enable chaining
	}	

	packRendererObject.overideTooltip = function (tooltipFunction) {
	//provides custom labelling for parent nodes
		tooltip = tooltipFunction;
		return packRendererObject; //enable chaining
	}	

	packRendererObject.overideClickBehaviour = function (tooltipFunction) {
	//provides custom labelling for parent nodes
		clickBehaviour = tooltipFunction;
		return packRendererObject; //enable chaining
	}
	packRendererObject.overideHoverAction=function(Hover){
		circleHover = Hover;
		return packRendererObject;
	}	

	
	//=================== PRIVATE VARIABLES ====================================
	var topiclist=[];
	var dataset = [];
		
	//Layout constants
	var svgWidth = 300; 
	var svgHeight = 1000;
	var margin = {top: 50, right: 10, bottom: 20, left: 10},
	width = svgWidth - margin.right - margin.left,
	height = svgHeight - margin.top - margin.bottom;
	
	
	//==================== 'Constructor' code ====================

	var diameter = 700,
		format = d3.format(",d");

	var packLayoutGenerator = d3.layout.pack()
		.size([diameter - 4, diameter - 4])
		.value(function(d) { return d.n; }) //use 'n' as circle size 'value'
		
	var svg = d3.select(targetDOMelement)
		.append("svg")
		.attr("width", diameter)
		.attr("height", diameter)
		.append("g")
		.attr("transform", "translate(2,2)");

	//=================== PRIVATE FUNCTIONS ====================================
	var leafLabel = function(d,i){
		//return 3 element array - one element for each label
		return ["leaf"+i, "", ""]
	}; 
	
	var parentLabel = function(d,i){return "parent "+i}; //simple default
	
	var tooltip = function(d,i){return "tooltip text for "+i}; //simple default
	
	var circleHover= function(d,i){
		console.log("mouse" , d);
	};
	var clickBehaviour = function (d,i) {console.log("clickBehaviour, d = ", d)};
	
	function render (){	
	//Mainly Bostock Code below

		//Create and transform group to hold circle and text
		var node = svg.datum(dataset).selectAll(".node")
			.data(packLayoutGenerator.nodes)
			.enter()
			.append("g")
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
				.on("click", function(d,i){
						topiclist = [];
						render();
						clickBehaviour(d,i)
				});
				

		node
			.append("circle")
			.attr("r", function(d) { return d.r; });

		node
			.append("title")
			.text(tooltip);

		//Filter out and process top level 0 node
		node
			.filter(function(d) { return d.depth===0; })
			.classed ("node level_0", true)
			.append("text")
				.attr("dy", function(d) {return -(d.r-10); })
				.style("text-anchor", "middle")
				.text(parentLabel);
				
		//Filter out and process level 1 nodes
		node
			.filter(function(d) { return d.depth===1; })
			.classed ("node level_1", true)
			.append("text")
				.attr("dy", function(d) {return -(d.r+5); })
				.style("text-anchor", "middle")
				.text(parentLabel);

		//Filter out and process leaf nodes
		var leaves = node
			.filter(function(d) { return !d.children; })
			.classed ("node leaf", true)
			.on("mouseover",circleHover);
		
			
		leaves
			.append('text')
				.attr('transform', 'translate(0, -10)')
				.text(leafLabel)
				//SVG doesn't wrap text - so call wrapTextSvg 
				//to put text into tspans
				.call(wrapTextSvg, 20);
				
		var leaves_2 = svg.selectAll(".leaf");
		leaves_2.style("fill", "black")
		
		leaves_2.filter(function(d){
				
				return topiclist.indexOf(d.n) >= 0;
		})
		.style("fill", "blue");
	
	}  
	
	//================== IMPORTANT do not delete ==================================
	return packRendererObject; // return the main object to the caller to create an instance of the 'class'
	
} 
