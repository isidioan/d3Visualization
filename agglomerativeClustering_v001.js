/*-------------------------------------------------------------------- 
  
   Module: agglomerativeClustering.js 
  
   Author: Mike Chantler
  
   What it does:
  	Performs agglomerative clustering
	Input: similarity matrix
	Output: linkage table
	
	Side effects: destroys similarity matrix
  
 
   Version history
  	v001	20/10/2016	mjc	Created.

  
----------------------------------------------------------------------*/ 

function agglomerativeClustering(){

	var clusterObject = {}; //'Instance' Obj to be returned to caller 
	
	//================== Public methods ==========================
	clusterObject.makeLinkageTable = function(sMatrixArg){
		
		var sMatrix = cloneSimData(sMatrixArg);
		var nNodes = sMatrix.length;	
		augmentedSimMatrix = {"sMatrix": sMatrix, "lastRow": nNodes-1, "nNodes": nNodes};
		
		while (augmentedSimMatrix.nNodes > 1){
			var maxS = maxSim(augmentedSimMatrix.sMatrix);
			linkageTable.push({"cluster1":maxS.col, "cluster2":maxS.row, "similarity":maxS.maximum});
			addNewNodeAsNewColRow(augmentedSimMatrix, maxS);
			deleteRowsAndCols(augmentedSimMatrix, maxS);
		}	
		return linkageTable;
	}


	//================== Private variables ==========================	
	
	var linkageTable = [];
	var augmentedSimMatrix = {};
	
	
	//================== Private methods ==========================
	function cloneSimData(similarities){
		// Function to clone 2D similarity matrix 
		// as clustering will destroy it.

		var clone = [];
		
		similarities.forEach(processRow);
		function processRow(row,i){
			clone[i] = []
			row.forEach(function(sim,j){
				clone[i][j] = sim;
				if (i===j) clone[i][j] = 0; //zero if similarity of node to itself	
			})
		}
		var lastRow = similarities.length-1;
		
		return clone;
	}
	
	
	
	function addNewNodeAsNewColRow(augmentedSimMatrix, _max){
		//Function to add a new cluster to the matrix by
		//adding a new row and column for the node
		var dist = Math.min;
		
		var mRow = _max.row,
			mCol = _max.col,
			max = _max.maximum,
			sMatrix = augmentedSimMatrix.sMatrix,
			newRowCol = Number(augmentedSimMatrix.lastRow)+1;

		//Add new column for new node
		for (var rowIndex in sMatrix){
			var r=Number(rowIndex);
			var sim1 = Number(sMatrix[rowIndex][mCol]);
			var sim2 = Number(sMatrix[rowIndex][mRow]);		
			if (sim1 && sim2){
				sMatrix[rowIndex][newRowCol] = dist(sim1,sim2);
			}
		}	
		
		//Add new row for new node
		sMatrix[newRowCol] = []  //Add the new row onto end of sMatrix
		//Populate new row sim values
		for (var colIndex = 0; colIndex<newRowCol; colIndex++){
			var sim1 = Number(sMatrix[mCol][colIndex]);
			var sim2 = Number(sMatrix[mRow][colIndex]);		
			if (sim1 && sim2){
				sMatrix[newRowCol][colIndex] = dist(sim1,sim2);
			}
		}
		
		//Update lastRow to include the new row
		augmentedSimMatrix.lastRow = newRowCol;	
	}

	function deleteRowsAndCols(augmentedSimMatrix, _max){
		//Function to delete old rows and columns that have been
		//used to form the new node

		var mRow = _max.row,
			mCol = _max.col,
			sMatrix = augmentedSimMatrix.sMatrix,
			newRowCol = Number(augmentedSimMatrix.lastRow)+1;
		
		//Delete rows
		delete sMatrix[mRow];
		delete sMatrix[mCol];	
		
		
		//Delete colums
		for (var rowIndex in sMatrix){
			delete sMatrix[rowIndex][mRow];
			delete sMatrix[rowIndex][mCol];	
		}
		
		augmentedSimMatrix.nNodes = Number(augmentedSimMatrix.nNodes)-1;

	}

	function maxSim(sMatrix){
		//Function to find maximum value in similarity matrix
		var mRow, mCol, max = 0;

		for (var rowIndex in sMatrix){
			var rowData = sMatrix[rowIndex];
			for (var colIndex in rowData){
				var sim = sMatrix[rowIndex][colIndex]
				if (sim > max){
					max = sim; 
					mRow = rowIndex;
					mCol = colIndex;				
				}
			}
		}
		return {"row":mRow, "col":mCol, "maximum": max};
	}



	
	return clusterObject;

}
