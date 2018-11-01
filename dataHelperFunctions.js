///////////////////////////////////////////////////////////////////////
//
// Module: dataHelperFunctions.js 
//
// Author: Isidoros Ioannou
//
//  Referencies: Mike Chantler
// What it does:
//	Collected bunch of methods that join some of the tables in the
//  grants and topics datasets together etc
//
// Comment:
//	These methods should really be fully integrated with the data 
//  objects to make it a 'propper' class with goof info hiding
//  
//   Date: 17/11/2016
// 
//  60% student 40% course
///////////////////////////////////////////////////////////////////////

"use strict" //This catches acidental global declarations

//To access helper functions declare instance of the 'class':
//
// 		var myHelpers = grantAndTopicDataHelperFunctions()
//
//Then call methods on this obj:
//
//		myHelpers.helpers.insertPIpersonsIntoGrantsTable(grantsData)
//

function grantAndTopicDataHelperFunctions(){

	var helpers = {};

	helpers.insertOrganisationsIntoGrantsTable = function (grantsData){
		function getOrgByID(ID){
			var organisation=grantsData.organisations.find(function(org){
				return org.OrgID === ID
			})
			return organisation
		}		

		grantsData.grants.forEach(function(grant){
			grant.organisation = getOrgByID(grant.OrgID)
		})	

	}

	helpers.insertPIpersonsIntoGrantsTable = function (grantsData){
	
		function getPersonByID(ID){
			var person=grantsData.persons.find(function(person){
				return person.ID === ID
			})
			return person;
		}		

		grantsData.grants.forEach(function(grant){
			grant.PI = getPersonByID(grant.PIID)
		})	

	}

	helpers.insertGrantListsIntoPersonsTable = function (grantData){
	
		persons=grantData.persons;
		grants=grantData.grants;		
		persons.forEach(function(person){
			person.grants=grants.filter(function(grant){
				
				function personIsInvestigator(investigator){
					return investigator.ID === person.ID
				}	
				return (grant.Investigators.some(personIsInvestigator));
			})
			person.nGrants = person.grants.length;	
		}) 
		console.log(persons)	
	}

	helpers.insertYearPropertyIntoGrants=function(grantsData){

			grantsData.grants.forEach(function(grant){

				var parts=grant.StartDate.split("/");
				grant.Year=parts[2];
			})


	}


	helpers.getGrantObjsByID = function (arrayOfIDs, grantsData){
		//Given an array of grant object 'ID' 
		//returns array of those grant objects
		var grants = grantsData.grants;
		function grantInIdList(grant){
			//console.log(grant)
			return arrayOfIDs.some(function(id){
				return grant.ID === id
			})
		}
		return grants.filter(grantInIdList);
	}

	helpers.getGrantObjsForATopic = function  (topicNumber, grantsData, topicData ){
		//Given a topic's number, return an array of the topic's grant objects
		console.log("grantIds" + grantIds);
		var grantIds = helpers.getGrantsIdsForATopic(topicNumber, topicData);
		return helpers.getGrantObjsByID(grantIds, grantsData);
	}
		
	helpers.getGrantsIdsForATopic = function (topicNumber, topicData){
		var grantIdList = topicData.topicsDocsDistrib[topicNumber]
			.map(function(topicDist){
						return topicDist.docID 
				})
		return grantIdList;	
	}

	helpers.wordcloud = function (topicNumber, topicData){
		return topicData.topics[topicNumber].map(function(word){return word.label})
	}

	helpers.getTopicsforGrants=function(topicData,OrgID){
		var c=0;
		var topicsList=[];
		for (var j=0 ; j< 30; j++ )
		for(var i=0; i < topicData.topicsDocsDistrib[j].length; i++){
	
			if (topicData.topicsDocsDistrib[j][i].docID == OrgID){
					topicsList[c]=j;
					c++;
			}
		}

		return topicsList;
		
	}

	helpers.getResearchAreasFromGrants=function(grantData){
		
		var grants = grantData.grants;

		var researchAreas = d3.nest().key(function(d){
									return d.ResearchArea;})
									.rollup(function(values){
										return {sum: d3.sum(values,function(d){
											return d.Value;
										})
									,grants: values};})
									.entries(grants)
									.map(function(d){
										return {ResearchArea : d.key , Values: d.values };});
		return researchAreas;

	}

	helpers.getTopicsByGrantsIds = function (grants, topicModelData) {
	   
	    var topicsList=[];
	    grants.forEach(function(grant){
	    topicModelData.topicsDocsDistrib.forEach(function(topics, i) {
	        topics.forEach(function(topicgrant) {
	            
	            if ((grant.ID.indexOf(topicgrant.docID) > -1) && (topicsList.indexOf(i) === -1)) {
	                topicsList.push(i);
	            }
	                
	        });
	    });
	});
	    return topicsList;
	
	}

	helpers.relatedGrantsofCountry=function(grantsData,name){

		var grantObj=grantsData.grants.filter(function(gr){

			return gr.organisation.Country === name;		
			})
		return grantObj;
	}

	helpers.getResearchAreaPerCountry=function(grantsData,name){
		var R = helpers.getResearchAreasFromGrants(grantsData);

		var resArea = R.filter(function(d){
			return d.Values.grants.some(function(t){
				return t.organisation.Country === name;
			});
		});

		return resArea;
	}

	helpers.getSumOfGrantsPerResearchArea=function(grants){

		 var hierarchy = d3.nest().key(function(d){
									return d.Year;})
									.rollup(function(values){
										return {sum: d3.sum(values,function(d){
											return d.Value;
										})
									,grants: values};})
									.entries(grants)
									.map(function(d){
										return {Year : d.key , Values: d.values };});
			return hierarchy;
	}

	helpers.getResearchAreasFromTree=function(depth,key,grantsData){
		var researchAreas=[];
		var R = helpers.getResearchAreasFromGrants(grantsData);
		if(depth==1){
			researchAreas = R.filter(function(d){
			return d.Values.grants.some(function(t){
				return t.organisation.Country === key;
			});
		});
		}
		else if (depth==2){
			researchAreas = R.filter(function(d){
			return d.Values.grants.some(function(t){
				return t.organisation.Region === key;
			});
		});
		}
		else if (depth ==3){
			researchAreas = R.filter(function(d){
			return d.Values.grants.some(function(t){
				return t.organisation.City === key;
			});
		});
		}
		else {
			researchAreas = R.filter(function(d){
			return d.Values.grants.some(function(t){
				return t.organisation.Name === key;
			});
		});
		}
		return researchAreas;
	}

	helpers.getSumOfGrantsFromTree=function(depth,key,grantsdata){
		var grants=[];
		if(depth==1){
			grants = grantsdata.grants.filter(function(d){
			return d.organisation.Country===key;	
		});
		}
		else if (depth==2){
			grants = grantsdata.grants.filter(function(d){
			return d.organisation.Region===key;
		});
		}
		else if (depth ==3){
			grants = grantsdata.grants.filter(function(d){
			return d.organisation.City===key;
		});
		}
		else {
			grants = grantsdata.grants.filter(function(d){
			return d.organisation.Name===key;
		});
		}
		
		var hierarchy = helpers.getSumOfGrantsPerResearchArea(grants);
			return hierarchy;
	}
	

helpers.createTreeHierarchy=function(organisations){
	var hierarchy={"key": "Organisations", "children":[] };
	
	organisations.forEach(function(org){

		var countries = hierarchy.children.find(function(country){
			
			return country.key===org.Country;
		});
		
			if(!countries)
			{	
				countries={ "key": org.Country , "children":[]}
				
				hierarchy.children.push(countries);
			}
			var regions = countries.children.find(function(region){
				return region.key===org.Region;
			});
				if(!regions)
				{	
					regions = {"key":org.Region, "children" : [] }
					countries.children.push(regions);
				}
				var cities = regions.children.find(function(city){
					return city.key===org.City;
				});
					if(!cities){
							
						cities = { "key":org.City , "children":[]}
						regions.children.push(cities);
					}
					org.key=org.Name;
					cities.children.push(org);
					
					});
				return hierarchy;	
			}


	
	return helpers;

}



















