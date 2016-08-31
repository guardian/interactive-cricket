export default function WicketsTimeline(innings,options) {

	console.log("WicketsTimeline",innings,options)
	//return;
	var self = this;

	var WIDTH=options.width,
		HEIGHT=options.height;
	var margins=options.margins || {
		top:20,
		right:0,
		bottom:0,
		left:10
	}


	var xscale=options.xscale,
		yscale=options.yscale,
		extents=options.extents;

	var all_wickets_selection,
		all_wickets=[];

	var bowlers=d3.nest()
					.key(function(d){
						//console.log(d)
						if(d.dismissal.type=="run-out") {
							return d.dismissal.description.replace("Run Out ","");
						}
						var bowler=d.dismissal.description.split("b ");
						return bowler[bowler.length-1];
					})
					.rollup(function(leaves){
						return leaves.map(function(l){
							//console.log("---->",l,bowlers)
							return {
								player:l.name,
								id:l.id,
								order:l.order,
								when:l.ending_balls,
								description:l.dismissal.description,
								type: l.dismissal.type
							}
							
						})
					})
					.entries(innings.batters.batters.filter(function(d){
						return d.dismissal;
					}))
	////console.log(bowlers)
	//return;

	bowlers.forEach(function(b){
		//console.log(b)
		b.stats=innings.bowlers.bowlers.find(function(l){
			return b.key.toLowerCase() == l.name;
		})
	})

	var wicketsTimeline=d3.select(options.container)
					.append("div")
						.attr("class","wickets-timeline clearfix")
						.style("margin-left",margins.left+"px")

	

	var inningsHTML=wicketsTimeline.append("div")
						.attr("class","timeline clearfix");

	var bowler=inningsHTML.append("div")
					.attr("class","bowlers clearfix")
					.attr("rel",bowlers.length)

	bowler.on("mousemove",function(){
			var x=d3.mouse(this)[0];

			x=Math.min(WIDTH-margins.right,x);

			var wicket=findWicket(Math.round(xscale.invert(x-margins.left)))
			
			//console.log(wicket)

			
			if(wicket) {
				
				self.highlightWicket(wicket);
				//tooltip.show(series,xscale(series.date),0,status);//yscale.range()[0]);
				//highlightSeries(series.date);
			}
			
			

		})
		.on("mouseleave",function(d){
			//self.highlightPartnership();
			//tooltip.hide();
		})

	bowler=bowler.selectAll("div.bowler")
							.data(bowlers)
							.enter()
								.append("div")
								.attr("class","bowler "+options.getTeamInfo(options.innings.values.id).code)
								//.attr("class","bowler "+(options.innings.values.team=="EN"?"AU":"EN"))

	var pic=bowler.append("div")
						.attr("class","pic")

	pic
		.append("h4")
			.text(function(d){

				console.log("BOWLER",d)

				return d.key;
			})

	
	var wickets=bowler.append("div")
		.attr("class","wickets")
		.attr("rel",function(d){
			//console.log(d);
			return d.key;
		});

	var wicket=wickets.selectAll("div.wicket")
			.data(function(d){
				return d.values;
			})
			.enter()
			.append("div")
				.attr("class","wicket")
				.style("left",function(d){
					return xscale(d.when)+"px";
				})
	wicket
		.append("div")
		.attr("class","circle")
	wicket
		.append("div")
		.attr("class","dropline")


	bowler.append("div")
		.attr("class","performance")
		.html(function(d){
			if(typeof d.stats === 'undefined') {
				return "";
			}
			return d.stats.wickets+"-"+d.stats.runs;//+"&nbsp;("+d.stats.overs+(+d.stats.balls>0?"."+(+d.stats.balls):"")+")";
		})

	all_wickets_selection=wicketsTimeline.selectAll("div.wicket");
	all_wickets=all_wickets_selection.data();

	function findWicket(x) {

		var delta=100000;
		var wicket=all_wickets[0];

		//console.log("---------------------");
		for(var i=0;i<all_wickets.length;i++) {
			var d=all_wickets[i],
				diff=Math.abs(x-d.when);
			if(diff<delta) {
				wicket=d;
				delta=diff;
				if(diff<2) {
					break;
				}
			}
		}
		
		
		return wicket;
	}

	this.doStuff=function(partnership) {
		
		//console.log(partnership);
		highlightWickets(partnership);
		//console.log("WICKETS",ws)
		//highlightWicket({

		//})
	}

	function highlightWickets(partnership) {
		if(!partnership) {
			highlightWicket();
			return;
		}
		var ws=all_wickets.filter(function(d){
			return d.id == partnership.id1 || d.id == partnership.id2;
		});
		
		all_wickets_selection
			.classed("hover",function(d){
				return ws.indexOf(d)>-1
			})
		

	}

	this.highlightWicket=function(wicket) {
		highlightWicket(wicket);

		if(options.callback) {
			//console.log("callback",wicket)
			options.callback(wicket);
		}
	}

	function highlightWicket(wicket) {
		//console.log(wicket)
		all_wickets_selection
			.classed("hover",function(d){
				//console.log(d,partnership)
				if(!wicket) {
					return false;
				}

				return d == wicket;
			})
	} 

}