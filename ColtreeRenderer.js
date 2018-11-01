
///////////////////////////////////////////////////////////////////////
//
// Module: tree renderer CLASS 
//
// Author: Isidoros Ioannou (Mike Chantler,Mike Bostock contributed)
//
// What it does:
//	This JavaScript module implements a simple tree layout in D3.js
//	It adds an svg to the targetDOMelement where it renders the chart
//  50% student 50 %course
//  Date 17/11/2016
///////////////////////////////////////////////////////////////////////

"use strict" //This catches acidental global declarations


function treeRenderer(targetDOMelement) { 
	
	

	//Delare the main object that will be returned to caller
	var treeRendererObject = {};

	
	//=================== PUBLIC FUNCTIONS =========================
	//
	// Here we attach functions (methods) to the return obj 
	// so that they can be used by the caller
	//
	treeRendererObject.close=function(un){
		renderTree();
		expand(un);
		return treeRendererObject;
	}
	treeRendererObject.loadAndRenderDataset = function (d) {
	
		dataset=d;
		renderTree();
		return treeRendererObject;
	}
	treeRendererObject.loadAndRenderNestDataset = function (data, rootName = "") {
		myTreeGenerator.children(function(d) {return d.values;} )
		 dataset = {"key": rootName, "values": data};
		
		return treeRendererObject;
	}
	treeRendererObject.render = function(){
		renderTree();
		return treeRendererObject;
	}	
	treeRendererObject.addSecondClickCalback=function(callback){
		secondClick=callback;
		
     return treeRendererObject;	
}
	
	//=================== PRIVATE VARIABLES ====================================
		
	//Layout constants

	
	//Width and height of svg canvas
	var svgWidth = 960; 
	var svgHeight = 900;
	var margin = {top: 20, right: 120, bottom: 40, left: 120},
	width = svgWidth - margin.right - margin.left,
	height = svgHeight - margin.top - margin.bottom;	
	
	var dataset = [];
	var myNodeLayout;
	var myLinks;
	var i =0;
	var duration= 750;
	var activeNode;
	var expand=null;
	//==================== Constructor code ====================

	//Declare and append SVG and containing grp 
	var layoutGroup = d3.select(targetDOMelement)
				.append("svg")
				.attr("width", svgWidth)
				.attr("height", svgHeight)
				.append("g")
				.attr("transform", "translate("+ margin.left +"," + margin.top +")");

	var myTreeGenerator = d3.layout.tree().size([height, width]);
	//Get and setup the tree layout generator 
	//Note that we have to add a children accessor function
	//so that we can use the 'values' attribute for the 'children' arrays
	
	
    
	//get and setup the diagonal path shape generator which will draw the links
	var myDiagGenerator = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });

			
		
	//=================== PRIVATE FUNCTIONS ====================================	
		
var secondClick = function(d){
	console.log("clicked on node" +dataset.key);
}

function renderTree(){
	
setChildrenClass(dataset, "classNoHighlight");


function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }


		dataset.x0 = svgHeight/2;
		dataset.y0=0;
		
		dataset.children.forEach(collapse);
		render(dataset);

		d3.select(self.frameElement).style("height", "800px");

	function click(d) {
  		
  		if (d.children) {
    	d._children = d.children;
    	d.children = null;
  		} else {
    	d.children = d._children;
    	d._children = null;
  	}
  		render(d);
	}
	//Makes the highlight attribute of the universities to false so the orange stroke is removed
	function removeHighlight(){
		dataset.children.forEach(function(country){
			country._children.forEach(function(region){
				region._children.forEach(function(city){
					city._children.forEach(function(uni){
						uni.highlight=false;
					});
				});
			});
		});


	}
	
	//Receives organisations and expands the tree from extrenal event.Catches 
	//the country node and makes the children until the university nodes visible
	//Appends true to highlight universities 
	expand=function(uni){

			removeHighlight();

		uni.forEach(function(un){

	
		var country=dataset.children.find(function(t){
				
			return	un.Country === t.key;
		
		}) ;
		country.children=country._children;

		var region =country.children.find(function(o){
			return un.Region===o.key;
		});
		region.children=region._children;

		var city=region.children.find(function(a){
			return un.City===a.key;
		});

		city.children=city._children;

		var temp=city.children.find(function(b){
			console.log(b)
			return b.Name===un.Name;
		});
		temp.highlight=true;
		
		render(country);

			
		});	
 
  }
  //Updates and renders nodes and links of tree layout
	function render (source) {
		//GENERATE TREE LAYOUT
		//Get tree data structure with x/y positions of all nodes 
		myNodeLayout = myTreeGenerator.nodes(dataset).reverse();
		//Normalize y positions fixed-height (depth) layout
		 myNodeLayout.forEach(function(d) { d.y = d.depth * 100; });
		//Get links, a link = (parent node, child node)
		  myLinks = myTreeGenerator.links(myNodeLayout);	
		//DATA JOIN
		var node = layoutGroup.selectAll("g.classNode")
			.data(myNodeLayout,function(d){ return d.id || (d.id=++i) ;});							
		//ENTER  
		var nodeEnter = node.enter().append("g")
			.classed("classNode classNoHighlight", true)
			.attr("transform", function(d) { 
				return "translate(" + source.y0 + "," + source.x0 + ")" 
			})
			.on("click",function(d){
						click(d);
						secondClick(d);
			});
		//Append nodes
		nodeEnter.append("circle")
			.on("mouseover",function(d){
				highlightPaths(d);
			})
			
			.on("mouseout",function(d){
				noHighlightPaths(d);
			})
			
			.attr("r", 1e-6)
			.style("fill", function(d){ return d._children ? "blue" : "white" ;});
		
		nodeEnter.append("title").text(function(d){
			return d.key;
		});

		nodeEnter.append("text")
			.attr("x", function(d){ return d.children || d._children ?-10 : 10 ;})
			.attr("dy", ".35em")
			.attr("text-anchor", function(d){ return d.children || d._children ? "end" : "start";})
			
			.text(function(d) {return  d.key;})
			.style("fill-opacity", 1e-6);						
		//UPDATE + ENTER	
		// CREATE TRANSITION
		var nodeUpdate = node.transition()
      						.duration(duration)
      						.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

		node.classed("classNoHighlight" , function(d){
			return d.csvHighlightClass=="classNoHighlight";
		})
		node.classed("classHighlight" , function(d){
			return d.csvHighlightClass=="classHighlight";
			});
      	// UPDATE NODES COLOUR AND TEXT
      	nodeUpdate.select("circle")
      				.attr("r", 4.5)
      				.style("fill", function(d) { return d._children ? "blue" : "white"; })
					.style("stroke",function(d){ return d.highlight ? "orange" : "steelblue";});

					
		nodeUpdate.select("text")
      			  .style("fill-opacity", 1);
		//EXIT
	var nodeExit = node.exit().transition()
      				.duration(duration)
      				.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      				.remove();
		
		nodeExit.select("circle")
      			.attr("r", 1e-6);

  		nodeExit.select("text")
      			.style("fill-opacity", 1e-6);
	
		// DATA JOIN
		var link = layoutGroup.selectAll("path.classLink")
			.data(myLinks, function(d){ return d.target.id;});		
		// ENTER
		link.enter().insert("path", "g")
			.classed("classLink classNoHighlight", true)
			.attr("d", function(d) {
    	var o = {x: source.x0, y: source.y0};
        	return myDiagGenerator({source: o, target: o});
      		});			
		// UPDATE 
		link.classed("classHighlight" , function(d){
			return d.source.csvHighlightClass=="classHighlight";
		})
		link.classed("classNoHighlight" , function(d){
			return d.source.csvHighlightClass=="classNoHighlight";
		});
		link.transition()
      		.duration(duration)
      		.attr("d", myDiagGenerator);
		// EXIT 
		link.exit().transition()
      		.duration(duration)
      		.attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        		return myDiagGenerator({source: o, target: o});
      			})
      		.remove();

      	myNodeLayout.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
	}
	

	

	var highlightPaths=function(d){
		
			setChildrenClass(d,"classHighlight")
	
	
		render(d);	

	}

	var noHighlightPaths=function(d){
	
	setChildrenClass(d, "classNoHighlight");

		render(d);
	
	}

}

	function setChildrenClass (parent, newClass){

	parent.csvHighlightClass=newClass;
	
	if (parent.children){

		for(var i = 0; i < parent.children.length; i++)
		{
			setChildrenClass(parent.children[i], newClass);
		}

	}
}
	
	//================== IMPORTANT do not delete ==================================
	return treeRendererObject; // return the main object to the caller to create an instance of the 'class'
	
} 