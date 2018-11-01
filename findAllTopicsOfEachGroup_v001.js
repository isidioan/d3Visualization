
///////////////////////////////////////////////////////////////////////
//
// Module: findAllTopicsOfEachGroup 
//
// Author: Mike Chantler
//
// What it does:
//	This JavaScript module uses the linkage table to determine the leaf nodes 
//  of all groups listed in groups.
//
//  The leaf nodes are returned in a flattened hierarchy suitable for 
//  rendering using a d3 pack v3
//
//
// Version history
//	v001	27/08/2016	mjc	Created.
//
///////////////////////////////////////////////////////////////////////

"use strict" //This catches acidental global declarations


function findAllTopicsOfEachGroupAndCreateHierarchy (groups, linkageTable,topicModelData){
	//Use the linkagetable to find all the leaf nodes (i.e. the topics) of each 
	//group in groups and return result as flattened hierarchy
	var hierarchy = {"name":"topic clusters", children:[] };	
	groups.forEach(findTopics);

	function findTopics (node){
		//console.log("Parent: "+node)
		var hChild = {"name":"cluster "+node, "number": Number(node), children:[]}
		var leaves = [];
		if (node >=0) {
			getLeafNodes([node+nLeaves], linkageTable, nLeaves, leaves);
			console.log("--topics="+leaves)			
		}
		else {
			//Have singleton topic, so just list the single topic itself
			leaves = [Number(node + nLeaves)]
			hChild.name = "Singleton: " + hChild.name;
		}
		
		hChild.children  = leaves.map(function(leaf){
			var topicNumber = Number(leaf);
			var tWords = topicModelData.topics[topicNumber]
			var weight = 0;
			tWords.forEach(function(word){weight+=word.weight})
			return {
				"name": "Topic " + leaf, 
				"n": topicNumber,
				"size": weight,
				"words": tWords.map(function(t){return t.label})
			}
		})
		hierarchy.children.push(hChild);
	};
	
	return hierarchy	
}


	
	

//=========================== HELPER FUNCTIONS =============================

	
function getLeafNodes(groups, linkageTable, nLeaves, leaves){
	//Finds all leaf nodes given an array of parent nodes in groups
	//The leaf nodes are returns as 'leaves' (an array of leaf nodes)
	//nLeaves is the totoal number of leaves in the linkage table

	groups.forEach(function(node){
		
		var lIndex = Number(node)-Number(nLeaves);
		
		if(lIndex>=0){
			//console.log("lIndex = ", lIndex)
			var child1 = linkageTable[lIndex].cluster1;		
			if (child1 >= nLeaves) getLeafNodes([child1], linkageTable, nLeaves, leaves);
			else leaves.push(child1);
			
			var child2 = linkageTable[lIndex].cluster2;		
			if (child2 >= nLeaves) getLeafNodes([child2], linkageTable, nLeaves, leaves);
			else leaves.push(child2);
		}
	})
}
