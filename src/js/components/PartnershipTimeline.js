import {
	select
} from 'd3-selection'



import {
	mean as d3_mean
} from 'd3-array'

import {
	strokeShadow
} from '../lib/CSSUtils'

import Tooltip from './Tooltip'

export default function PartnershipTimeline(_innings,options) {

	////console.log("PartnershipTimeline",innings,options)
	var self=this;

	var WIDTH=options.width,
		HEIGHT=options.height;

	var margins=options.margins || {
		top:20,
		right:0,
		bottom:0,
		left:10
	}

	var BAR=25;//32;

	var xscale=options.xscale,
		yscale=options.yscale,
		extents=options.extents;

	

	var runscale=options.runscale;
	runscale.range([0,BAR/2])

	var partnershipTimeline=select(options.container)
					.append("div")
						.attr("class","partnerships-timeline")
						.append("div")
						.attr("class","timeline");

	var innings=partnershipTimeline
						.selectAll("div.innings")
						.data([_innings])
						.enter()
							.append("div")
								.attr("class","innings")
								.attr("rel",function(d){
									return d.inning;
								});

	/*var tooltipPartnership=new Tooltip({
    	container:partnershipTimeline.node(),
    	margins:margins,
    	title:true,
    	indicators:[
    		{
    			id:"partnershipRuns",
    			title:"Runs"
    		},
    		{
    			id:"partnershipBalls",
    			title:"Balls"
    		}
    	]
    });
    var tooltipPlayer=new Tooltip({
    	container:partnershipTimeline.node(),
    	margins:margins,
    	indicators:[
    		{
    			id:"playerRuns",
    			title:"Runs"
    		},
    		{
    			id:"playerBalls",
    			title:"Balls"
    		},
    		{
    			id:"playerFourSix",
    			title:"4s/6s"
    		}
    	]
    })*/

	var profiles=innings.append("div")
					.attr("class","profiles clearfix");
					
	


	var profile=profiles.selectAll("div.profile")
							.data(function(inn){
								return inn.batters.sort(function(a,b){
									return +a.order - +b.order;
								});
							})
							.enter()
								.append("div")
								.attr("class","profile")
								.style("margin-left",function(d){
									return (margins.left+xscale(d.starting))+"px"
								})

	var pic=profile.append("div")
						.attr("class","pic")
						/*.on("mouseenter",function(d){
							
							//console.log(d);

							
							self.highlightProfile({
								player1:d.name,
								id1:d.id,
								player2:"*",
								id2:"*"
							})
							

						})
						.on("mouseleave",function(d){
							self.highlightProfile()
						})*/

	pic.append("h4")
		.text(function(d){
			return d.name;
		})
		.each(function(){
			strokeShadow(this,1.5,"rgba(255,255,255,1)");
		})

	var performance=profile.append("div")
					.attr("class","performance")
					.style("margin-left",function(d){
						return (margins.left+xscale(d.ending_balls - d.starting))+"px"
					})
	var scores=performance.append("div")
					.attr("class","scores");

	scores.append("span")
				.attr("class","runs")
					.text(function(d){
						return d.runs;
					})


	function highlightProfile(partnership) {

		console.log("highlightProfile",partnership)

		profile
			.classed("highlight",false)
		player
			.classed("highlight",false);

		//tooltipPlayer.hide();
		//tooltipPartnership.hide();

		if(!partnership) {
			return;
		}
		profile
			.filter(function(d){
				return (d.id==partnership.id1 || d.id==partnership.id2)
			})
			.classed("highlight",true)

		

		if(partnership.id2) {
			player
				.filter(function(d){
					return (d.id==partnership.id1 || partnership.id2==d.id)
				})
				.classed("highlight",true)

		} else {
			player
				.filter(function(d){
					return (d.id==partnership.id1)
				})
				.classed("highlight",true)	
		}
		
		if(partnership.id2 && partnership.id2!="*") {
			//tooltipPlayer.hide();
			/*tooltipPartnership.show([
					{
						id:"partnershipRuns",
						value:partnership.Runs
					},
					{
						id:"partnershipBalls",
						value: Math.round(partnership.ending_over*6 - partnership.starting_balls)
					}
				],
				xscale(partnership.ending_over*6),
				d3_mean([partnership.order1,partnership.order2])*BAR,
				partnership.player1+", "+partnership.player2
			);*/
		} else {
			//console.log("---->",_innings)
			var batter=_innings.batters.find(function(b){
				//console.log(b.id,partnership.id1,b)
				return b.id == partnership.id1;
			});
			console.log("FOUND",batter)
			
			/*tooltipPartnership.hide();
			tooltipPlayer.show([
					{
						id:"playerRuns",
						value:batter.runs
					},
					{
						id:"playerBalls",
						value: Math.round(batter.balls)
					},
					//{
					//	id:"playerSR",
					//	value: Math.round(batter.balls)
					//},
					{
						id:"playerFourSix",
						value: batter.fours+"/"+batter.sixes
					}
				],
				xscale(batter.ending_balls),
				batter.order*BAR
			);*/
		}

		
	}
	this.highlightProfile=function(partnership) {
		
		highlightProfile(partnership);
		self.highlightPartnership(partnership);
		//if(options.callback) {
		//	options.callback(partnership);
		//}
	}
	

	
	
	var svg=innings.append("svg")
							.attr("width",function(d){
								//return WIDTH-(margins.left+margins.right);
								return xscale(options.max_balls);
								var last_player=options.innings.value.total_balls;
								return xscale(last_player);
							})
							.attr("height",function(d){
								return d.batters.length*BAR;
							});

	/*svg.on("mousemove",function(){
			var x=d3.mouse(this)[0];

			x=Math.min(WIDTH-margins.right,x);

			var partnership=findPartnership(Math.round(xscale.invert(x-margins.left)))
			
			//console.log(partnership)

			
			if(partnership) {
				
				self.highlightPartnership(partnership);
				self.highlightProfile(partnership);
				
				//tooltip.show(series,xscale(series.date),0,status);//yscale.range()[0]);
				//highlightSeries(series.date);
			}
			
			

		})
		.on("mouseleave",function(d){
			self.highlightPartnership();
			self.highlightProfile();
			//tooltip.hide();
		})*/

	let defs=svg.append("defs");
	let pattern=defs.append("pattern")
						.attrs({
							id:"diagonalHatch",
							width:3,
							height:3,
							patternTransform:"rotate(45 0 0)",
							patternUnits:"userSpaceOnUse"
						});
	//console.log("->",defs)

	pattern.append("line")
			.attr("x1",0)
			.attr("y1",0)
			.attr("x2",0)
			.attr("y2",3)
			.styles({
				stroke:"#000",
				"stroke-opacity":1,
				"stroke-width":1
			})
	var all_innings=svg.append("g")
					.attr("class","match partnerships")
					.attr("transform","translate("+margins.left+","+0+")")

	var players=svg.append("g")
					.attr("class","players "+options.getTeamInfo(options.innings.value.id).code)
					.attr("transform","translate("+margins.left+","+0+")");

	var player=players.selectAll("g.player")
					.data(function(inn){
						return inn.batters;
					})
					.enter()
					.append("g")
						.attr("class","player")
						.attr("transform",function(d,i){
							var y=(d.order-1)*BAR;
							return "translate(0,"+y+")";
						});

	player.append("rect")
			.attr("x",function(d){
				return xscale(d.starting);
			})
			.attr("y",BAR/2-0.5)//25/2-1)
			.attr("width",function(d){
				//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>",d)

				return xscale(d.ending_balls-d.starting);
			})
			.attr("height",2);

	/*var cross=player
				.filter(function(d){
					return d.status == "batted";
				})
				.append("g")
					.attr("class","cross")
					.attr("transform",function(d){
						var x=xscale(d.ending_balls),
							y=BAR/2-0.5;
						return "translate("+x+","+y+")";
					});
	cross
		.append("line")
			.attr("x1",function(d){
				return 0;
			})
			.attr("x2",function(d){
				return 0;
			})
			.attr("y1",function(d){
				var y=(d.order-1)*BAR+margins.top;
				return -y;
			})
			.attr("y2",function(d){
				var y=svg.attr("height");
				return y;
			})*/

	
	player
		.filter(function(d){
			return d.status == "batted";
		})
		.append("rect")
		.attr("class","fall-of-wicket")
		.attr("x",function(d){
			return xscale(d.ending_balls);
		})
		.attr("y",Math.ceil(BAR/2)-3)
		.attr("width",2)
		.attr("height",6)
	
	


	

	innings=all_innings.selectAll("g.innings")
				.data([options.innings])
				.enter()
					.append("g")
						.attr("class",function(d){
							//////console.log(d);
							return "innings "+options.getTeamInfo(d.value.id).code;
						})
						.attr("rel",function(d){
							return d.value.starting_balls;
						})
						.attr("transform",function(d){
							var x=xscale(d.value.starting_balls),
								y=0;
							x=0;
							return "translate("+x+","+y+")";
						})


	var partners=innings.selectAll("g.partnership")
				.data(function(d){
					return d.value.innings.map(function(inn){
						inn.prev_runs=d.value.starting_runs;
						return inn;
					})
				})
				.enter()
					.append("g")
						.attr("class","partnership")
						.attr("transform",function(d){
							var x=xscale(d.starting_balls);
							return "translate("+x+",0)";
						})
						

	partners.append("rect")
				.attr("class","partnership-shadow")
				.attr("x",function(d){
					//////console.log("------>",d)
					return 0;
				})
				.attr("y",function(d){
					return (Math.min(d.order1,d.order2)-1)*BAR + BAR/2 +3;
				})
				.attr("width",function(d){
					return Math.max(xscale(d.overs*6),2)
				})
				.attr("height",function(d){
					//return 27;
					return Math.abs(d.order2 - d.order1)*BAR - 4;
				})
				.styles({
					fill:"url(#diagonalHatch)"
				});

	partners.append("rect")
				.attr("class","partnership-shadow-tall")
				.attr("x",function(d){
					return 0;
				})
				.attr("y",function(d){
					return 0;
					return (Math.min(d.order1,d.order2)-1)*BAR + BAR/2;//0;//(d.Wkt)*27 - 27/2 + 6 - 1.5
				})
				.attr("width",function(d){
					return Math.max(xscale(d.overs*6)+1,2)
				})
				.attr("height",function(d){
					return Math.max(d.order2,d.order1)*BAR-BAR/2;
				})

	partners.append("rect")
				.attr("class","partnership-ux")
				.attr("x",function(d){
					return 0;
				})
				.attr("y",function(d){
					return 0;
					return (Math.min(d.order1,d.order2)-1)*BAR + BAR/2;//0;//(d.Wkt)*27 - 27/2 + 6 - 1.5
				})
				.attr("width",function(d){
					return Math.max(xscale(d.overs*6)+1,2)
				})
				.attr("height",function(d){
					return Math.max(d.order2,d.order1)*BAR-BAR/2;
				})

	function findPartnership(x) {
		var partnership=partners.data().find(function(d){
			return x>=d.starting_balls && x<d.ending_over*6; 
		});
		
		
		return partnership;
	}

	this.highlightPartnershipIndex=(index)=>{

		//highlightPartnership(partners.filter((d,i)=>(i===index)))
	}

	this.highlightPartnership=function(partnership) {
		highlightPartnership(partnership);

		if(options.callback) {
			//console.log("callback",partnership)
			options.callback(partnership);
		}
	};
	function highlightPartnership(partnership) {
		partners
			.classed("hover",function(d){
				//console.log(d,partnership)
				if(!partnership) {
					return false;
				}

				if(partnership.player2 == "*") {
					return d.id1 == partnership.id1 || d.id2 == partnership.id1
				}

				return d == partnership;
			})
	} 

	this.doStuff=function(partnership) {
		highlightProfile(partnership);
		highlightPartnership(partnership);
	}




}