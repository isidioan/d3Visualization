///////////////////////////////////////////////////////////////////////
//
// Module: Map CLASS 
//
//  Author :Isidoros Ioannou
//  
//  Referencies:Mike Chantler
//
// What it does:
//  This JavaScript module implements a map in D3.js
//  It adds an svg to the targetDOMelement where it renders the map
// Date 17/11/2016
// 40% student 60% course
/////////////////////////////////////////////////////////////////////////
"use strict" //This catches acidental global declarations

function map(targetDOMelement){

	var mapObject={};
	//=================== PUBLIC FUNCTIONS =========================
	//
	// Here we attach functions (methods) to the return obj 
	// so that they can be used by the caller
	//
	mapObject.loadAndRenderCircles=function(Uni){
    myPlaces=Uni;
    renderCircles();
    
    return mapObject;
  }
  mapObject.renderMap=function(){
    render();
    renderCircles();
    return mapObject;
  }

  mapObject.loadCircles=function(Uni){
		myPlaces=Uni;
		return mapObject;
	}

	mapObject.loadAndRenderDataset = function (ukMapData) {
		dataset=ukMapData;
		render();
		return mapObject; //allows chaining
	}

	mapObject.mapClickCalback = function (callback) {
		myCallBack=callback;
		return mapObject; //allows chaining
	}
  mapObject.nameAccessor = function(name){
    setName=name;
    return mapObject;
  }
  mapObject.circleWidth=function(c){
    circleW=c;
    return mapObject;
  }
  mapObject.setCoord=function(c){
    setCoordinates=c;
    return mapObject;
  }

	//=================== PRIVATE VARIABLES ====================================
	//Width and height of svg canvas

	var width = 550,
    height = 700;
    var dataset = {};
    var myPlaces=[];
    var rmin=4;
    var rmax=10;
      

	//Declare and append SVG element
    var svg = d3.select(targetDOMelement)
    			.append("svg")
   				.attr("width", width)
    			.attr("height", height);

    //define projection of spherical coordinates to the Cartesian plane
	var projection = d3.geo.albers()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(700 * 5)
    .translate([width / 2, height / 2]);

	//Define path generator (takes projected 2D geometry and formats for SVG)
	var pathGen = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

  var rScale= d3.scale.linear().range([rmin,rmax]);

    //Extract * convert ENG,IRL,NIR,SCT,WLS TopoJSON data into to GeoJSON
 

//=================== PRIVATE FUNCTIONS ====================================

var myCallBack= function(d,i){
            // console.log(d.organisation.Name);
          }
var myHoverIn= function(d){
  d3.select(this).transition().duration(500).attr("r",12);

  d3.select(this).select("title").text(function(){
    return d.organisation.Name +"," + d.Value+"£,"+ d.ID+","+d.Title; 

  }); 

  } 
var myHoverOut=function(d){

     d3.select(this).transition().duration(500).attr("r", function(d) {return rScale(Number(d.Value));});
    }
var setName = function(d){
  console.log("No name");
}
var circleW = function(d){
  console.log("No circles");
}
var setCoordinates=function(d){
  console.log("No coor");
}
  


function render(){
  var subunits = topojson.feature(dataset, dataset.objects.subunits);
  //Ditto for places (cities)
  var places = topojson.feature(dataset, dataset.objects.places);
  

 //Draw the five unit outlines (ENG, IRL, NIR, SCT, WLS)
  svg.selectAll(".subunit")
      .data(subunits.features)
    .enter().append("path")
      .attr("class" , function(d) {
        return "subunit "+d.id;
      }) 
      .attr("d", pathGen)
      .on("click",myCallBack)
      .on("mouseover", function(d){
      
        d3.select(this).classed("subunit " + d.id,false);
        d3.select(this).classed("hovermap " + d.id,true);

      })
      .on("mouseout", function(d){
         d3.select(this).classed("hovermap "+d.id,false);
        d3.select(this).classed("subunit " + d.id , true);
       
      });
  //Add city 'dots' as a single path
 /* svg.append("path")
      .datum(places)
      .attr("d", pathGen)
      .attr("class", "place");
      */

 //Add city labels
  svg.selectAll(".place-label")
      .data(places.features)
    .enter().append("text")
      .classed("place-label",true)
      .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
      .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
      .attr("dy", ".35em")
      .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; })
      .text(function(d) { 
		return d.properties.name; })
	 
	     .on("mouseover" , function(d){
        d3.select(this).classed("place-label",false);
       })
       .on("mouseout" , function(d){
        d3.select(this).classed("place-label",true);
      });
       
      }

      function renderCircles(){
      
        {
        		
     		rScale.domain(d3.extent(myPlaces,function(d){ return Number(d.Value);}));
      
  			var circles =svg.selectAll("circle")
          	.data(myPlaces)
          
         circles.enter()
          .append("circle")
          .classed("map-circles",true)
          .append("title");
         

   circles.attr("transform", function(d) { return "translate(" + projection([d.organisation.Longitude,d.organisation.Latitude]) + ")"; })
          .attr("r", function(d){ return rScale(Number(d.Value));})
          .style("fill","blue")
          .style("stroke", "blue")
          .on("mouseover",myHoverIn)
          .on("mouseout", myHoverOut);
        
  circles.exit().remove();
      }



}


return mapObject;
}//End of map() declaration
