import {
	select
} from 'd3-selection'

import {
	line
} from 'd3-shape'

import {
	strokeShadow
} from '../lib/CSSUtils';

export default function PartnershipsChart(innings,options) {

	console.log("PartnershipsChart",innings,options)
	
	var self = this;

	var margins=options.margins || {
		top:20,
		right:0,
		bottom:0,
		left:10
	}

	var xscale=options.xscale,
		yscale=options.yscale,
		extents=options.extents;
	
	var HEIGHT=options.height;

	var WIDTH = xscale(innings.value.innings[innings.value.innings.length-1].ending_over*6);

	WIDTH=xscale(innings.value.balls);

	//WIDTH=xscale(options.max_balls);

	//console.log("WIDTH",WIDTH,innings.value.innings[innings.value.innings.length-1])

	select(options.container)
		.style("width",(WIDTH)+"px")
		

	////console.log(":::::",238,xscale(238))
	//console.log("--->",innings.value.innings[innings.value.innings.length-1].ending_over*6,"=",WIDTH)

	let partnership_background=select(options.container)
									.append("div")
									.attr("class","partnerships-chart-bg");

	let partnership_chart=select(options.container)
							.append("div")
							.attr("class","partnerships-chart");

	var inningsTitle=select(options.container)
						.append("div")
						.attr("class","innings-title")
	inningsTitle
		.append("h2")
		.text(function(){
			////console.log(innings);
			//console.log("TEAM_ID",options.team_id)
			return options.getTeamInfo(options.team_id).name;//options.teams[innings.value.team];
		})
	
	inningsTitle
		.append("h4")
		.text(function(){
			var wickets=innings.value.wickets;
			//console.log("<><><><><><><><><>",innings.value)
			if(!innings.value.Over) {
				return "yet to bat";
			}
			return innings.value.total_runs+(wickets<10?(" - "+wickets):" all out");
		})

	inningsTitle
		.append("h3")
		.text(function(){
			var inns=innings.key<3?1:2;
			return inns+(inns===1?"st":"nd")+" Innings";
		})


	

	var inningsOvers=partnership_chart
						.append("div")
						.attr("class","innings-over")
						.classed("with-over",1)//innings.key==="1")
						// .style("left",function() {
						// 	return (xscale(innings.value.innings[innings.value.innings.length-1].ending_over*6)) +"px";
						// })
						.text(function(){
							if(!innings.value.Over) {
								return "";
							}
							return innings.value.Over + (innings.key==="1"?" overs":" overs")
						})
						.each(function(){
		    				strokeShadow(this,1.5,"rgba(255,255,255,1)");
		    			})
	var inningsRuns=partnership_chart
						.append("div")
						.attr("class","innings-runs")
						// .style("left",() => {
						// 	return (xscale(innings.value.innings[innings.value.innings.length-1].ending_over*6)) +"px";
						// })
						.style("top",function() {
							return (yscale(innings.value.total_runs + innings.value.starting_runs)-25+options.margins.top) +"px";
						})
						.text(function(){
							if(!innings.value.total_runs) {
								return "";
							}
							return (innings.value.total_runs + innings.value.starting_runs) + (innings.key==="1"?" runs":" runs")
						})
						.each(function(){
		    				strokeShadow(this,2,"rgba(255,255,255,0.5)");
		    			})

	/*var inningsRunsSmaller=select(options.container)
						.append("div")
						.attr("class","innings-runs smaller")
						.style("left",function() {
							return (xscale(innings.value.innings[innings.value.innings.length-1].ending_over*6) + 5) +"px";
						})
						.style("top",function() {
							return (yscale(innings.value.total_runs + innings.value.starting_runs) + 28) +"px";
						})
						.text(function(){
							if(+innings.key<=2) {
								return "";
							}
							return (innings.value.total_runs)
						})*/

	
					//.attr("width",WIDTH)
	var svg=partnership_chart
				.style("width",function(d){
					return Math.ceil(WIDTH)+"px";
				})
				.style("height",(HEIGHT)+"px")
				.append("svg")

	if(options.index>0) {
		let prev_svg=document.querySelector(`div[data-index='${options.index-1}'] .partnerships-chart > svg`);
		let clone=prev_svg.cloneNode(true);
		let width=prev_svg.getBoundingClientRect().width;
		let svg_clone=select(partnership_chart.node().appendChild(clone))
							.attr("class","clone")
							.style("left",(-width)+"px")
							.style("width",(width)+"px")

	}
	

	var all_innings=svg.append("g")
					.attr("class","match")
					.attr("transform","translate("+margins.left+","+margins.top+")")

	if(innings.key!="1") {
		svg.append("line")
				.attr("class","left-border")
				.attr("x1",0)
				.attr("y1",0)
				.attr("x2",0)
				.attr("y2",HEIGHT)
	}

	

	let __innings=all_innings.selectAll("g.innings")
				.data([innings])
				.enter()
					.append("g")
						.attr("class",function(d){
							return "innings "+options.getTeamInfo(options.team_id).code;
						})
						.attr("rel",function(d){
							return d.value.starting_balls;
						})
						.attr("transform",function(d){
							//console.log(d)

							var x=0,//xscale(d.value.starting_balls),
								y=-(yscale.range()[0]-yscale(d.value.starting_runs));
							////console.log("------>",d.value,yscale(d.value.starting_runs))
							return "translate("+x+","+y+")";
						})

	svg.append("line")
				.attr("class","bottom-border")
				.attr("x1",0)
				.attr("y1",HEIGHT-0.5)
				.attr("x2",WIDTH)
				.attr("y2",HEIGHT-0.5)

	let partners=__innings.selectAll("g.partnership")
				.data(function(d){
					return d.value.innings.map(function(inn){
						inn.prev_runs=d.value.starting_runs;
						return inn;
					})
				})
				/*.data(function(d){
					return d.value.innings
				})*/
				.enter()
					.append("g")
						.attr("class","partnership")
						.attr("rel",function(d){
							return d.overs+" "+d.player1+" + "+d.player2;
						})
						.attr("transform",function(d){
							var x=xscale(d.starting_balls)
							
							
							//////console.log("e",d.Inns,d.Wkt,d.e_overs,d.starting_balls+d.overs*6,xscale(d.overs*6))
							return "translate("+x+",0)";
						});

	var target_runs=all_innings.append("g")
					.attr("class","target-runs");

	if(options.target) {
		target_runs.append("line")
				.attr("x1",xscale(0))
				.attr("y1",yscale(innings.value.other.runs))
				.attr("x2",xscale(options.max_balls))
				.attr("y2",yscale(innings.value.other.runs))
	}
					
	
	var area = line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); });
	partners.append("path")
				.attr("class","rr")
				.attr("d",function(d){
					var delta=(d.ending_over*6-d.starting_over*6)
					var points=[
						{
							x:0,
							y:0
						},
						{
							x:0,
							y:d.starting_runs
						},
						{
							x:delta,
							y:d.starting_runs+d.Runs
						},
						{
							x:delta,
							y:0-d.prev_runs
						},
						{
							x:0,
							y:0-d.prev_runs
						}
					];
					
					return area(points);
				});

	partners.append("line")
				.attr("class","rr")
				.attr("x1",function(d){
					return 0;
				})
				.attr("y1",function(d){
					return yscale(d.starting_runs)-1
				})
				.attr("x2",function(d){
					//////console.log(d.Wkt,"from",d.starting_balls,d.starting_runs,"to",d.starting_balls+d.overs*6,d.starting_runs+d.Runs)
					////console.log("######################",d)
					return xscale(d.ending_over*6-d.starting_over*6)
				})
				.attr("y2",function(d){
					return yscale(d.starting_runs+d.Runs)-1
				})


	partners.append("line")
				.attr("class","dropline")
				.classed("hidden",function(d,i){
						return i>0;
					})
					.attr("x1",function(d){
						return xscale(0)
					})
					.attr("y1",function(d){
						return yscale(d.starting_runs)
					})
					.attr("x2",function(d){
						return xscale(0)
					})
					.attr("y2",function(d){
						return yscale(0)+(yscale.range()[0])
					})
	
	partners.append("line")
				.attr("class","dropline")
				.attr("x1",function(d){
					return xscale(d.overs*6);
					return xscale(d.ending_over*6-d.starting_over*6);//xscale(d.overs*6)
				})
				.attr("y1",function(d){
					return yscale(0)+(yscale.range()[0]-yscale(d.prev_runs))
				})
				.attr("x2",function(d){
					return xscale(d.overs*6);
					return xscale(d.ending_over*6-d.starting_over*6);//xscale(d.overs*6)
				})
				.attr("y2",function(d){
					return yscale(d.starting_runs+d.Runs)
				})

	

	/*svg.on("mousemove",function(){
			var x=d3.mouse(this)[0];

			x=Math.min(WIDTH-margins.right,x);

			var partnership=findPartnership(Math.round(xscale.invert(x-margins.left)))
			
			////console.log(partnership)

			
			if(partnership) {
				
				self.highlightPartnership(partnership);
				//tooltip.show(series,xscale(series.date),0,status);//yscale.range()[0]);
				//highlightSeries(series.date);
			}
			
			

		})
		.on("mouseleave",function(d){
			self.highlightPartnership();
			//tooltip.hide();
		})*/

	function findPartnership(x) {
		var partnership=partners.data().find(function(d){
			return x>=d.starting_balls && x<d.ending_over*6; 
		});
		
		
		return partnership;
	}
	function highlightPartnership(partnership,star) {
		////console.log("highlightPartnership",partnership)
		partners
			.classed("highlight",function(d){
				if(!partnership) {
					return false;
				}
				////console.log(partnership,d)
				if(star) {
					return d.id1 == partnership.id1 || d.id2 == partnership.id1;
				}
				return d == partnership;
			})
	}
	function highlightMultiplePartnerships(partnership) {

	}
	this.highlightPartnership=function(partnership) {
		highlightPartnership(partnership);

		if(options.callback) {

			options.callback(partnership);
		}
	};
	


	this.doStuff=function(partnership) {
		if(!partnership) {
			highlightPartnership();
			return;
		}
		if(partnership.player2 == "*") {
			highlightMultiplePartnerships(partners.data().filter(function(d){
				return d.id1 == partnership.id1 && d.id2 == partnership.id2;
			}));
			
		} else {
			highlightPartnership(partners.data().find(function(d){
				return d.id1 == partnership.id1 && d.id2 == partnership.id2;
			}));	
		}
		
	};

};

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
