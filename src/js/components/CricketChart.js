import SmallChart from './SmallChart'
import PartnershipsChart from './PartnershipsChart'
import PartnershipTimeline from './PartnershipTimeline'
import WicketsTimeline from './WicketsTimeline'
import matchHTML from '../text/matches.html!text'

import {
	getBalls
} from '../lib/support'

import {
	select
} from 'd3-selection'

import {
	nest as d3_nest
} from 'd3-collection'

import {
	extent as d3_extent,
	sum as d3_sum,
	max as d3_max
} from 'd3-array'

import {
	scaleLinear
} from 'd3-scale'

import {
	timeFormat
} from 'd3-time-format'

import scroller from "../lib/scroller.js"

export default function CricketChart(data,options) {

	console.log("CricketChart",data)

	let getTeamInfo = () => {};

	let __scroller=new scroller();

	this.extents;
	this.startFrom=0;
	this.match={};
	let match;
	this.data=data;
	
	this.options=options;

	let innings;

	let matchAnalysis;
	let smallchart;
	let partnerships=[];
	let partnerships_timelines=[];

	
	let _updateData = (data) => {

		let prev_balls=0,
			prev_team_id,
			prev_played_balls=0,
			prev_played_runs=0,
			prev_runs={};

		prev_runs[this.data.info[0].id]=0;
		prev_runs[this.data.info[1].id]=0;

		this.getTeamInfo = (teamID) => {
			////console.log("getTeamClass",teamID)
			return data.teams[teamID];

		}
		var self=this;
		this.match.innings=d3_nest()
				.key((d) => (+d.Inns))
				.rollup(function(leaves){

					

					let stuff= {
						leaves:leaves,
						id:leaves[0].id,
						team:leaves[0].team,
						overs:d3_extent(leaves,(d)=>{
							return d.overs;
						}),
						Over:data.innings[+leaves[0].Inns-1].overs,
						balls:getBalls(data.innings[+leaves[0].Inns-1].overs),
						prev_inning_team_id:prev_team_id,
						prev_inning_played_balls:prev_played_balls,
						starting_balls:prev_balls,
						starting_runs:prev_runs[leaves[0].id],
						runs:d3_extent(leaves,(d)=>{
							return +d.Runs;
						}),
						total_runs:d3_sum(leaves,(d)=>{
							return +d.Runs;
						}),
						total_balls:getBalls(data.innings[+leaves[0].Inns-1].overs),
						innings:(((leaves) => {
							let starting_over=0,
								starting_runs=0;
							
							return leaves.map((d,i) => {

								let order1=self.data.innings[+leaves[0].Inns-1].batters.find((p)=>{
									return p.id == d.id1;
								})
								
								d.order1=order1.order;

								let order2=self.data.innings[+leaves[0].Inns-1].batters.find((p)=>{
									//////console.log(p.name,d.player2)
									return p.id == d.id2;
								})

								d.order2=order2.order;

								d.starting_over=starting_over;
								d.starting_balls=getBalls(starting_over);//*6;
								starting_over+=d.overs;

								d.starting_runs=starting_runs;
								starting_runs+=d.Runs;

								return d;
							})
						})(leaves))
					};
					prev_team_id=leaves[0].id;
					prev_balls+=stuff.total_balls;
					prev_played_balls=stuff.total_balls;
					prev_played_runs=stuff.total_runs;
					prev_runs[leaves[0].id]+=stuff.total_runs;
					//////console.log("prev_balls",prev_balls)
					return stuff;
				})
				.entries(this.data.partnerships)


		console.log(this.match.innings)
		
		this.match.innings.forEach((d,i) => {
			let info=self.data.innings[i];
			//console.log(d,info)
			d.value.wickets=info.wickets;

			
				d.value.other={
					runs:d3_sum(self.match.innings
									.filter((innings)=>(+d.key > +innings.key) && (d.value.id!==innings.value.id)),
								(innings)=>{
									return innings.value.total_runs
					})//,
					//balls:self.match.innings[i-1].value.total_balls
				}	
			
			

		})

		/*if(this.match.innings.length<2) {
			//console.log("-------->",this.match)
			this.match.innings.push({
				key:"2",
				values:{
					wickets:[],
					runs:[],
					innings:[{
						ending_over:options.max_overs
					}],
					id:data.info.find((d)=>{
						return d.id!==data.innings[0].id
					}).id
				}
			});
		}*/

		this.match.overall={
			total_runs:d3_sum(this.match.innings.filter(d=>d.value.total_runs),(d) => {
				return d.value.total_runs;
			}),
			total_balls:d3_sum(this.match.innings.filter(d=>d.value.balls),(d) => {
				return d.value.balls;
			}),
			runs:d3_max(this.match.innings.filter(d=>d.value.balls).map((d) => {
				return d.value.total_runs+d.value.starting_runs;
			}))
		}

		this.match.score=d3_nest()
				.key(function(d){
					return d.id;
				})
				.rollup(function(leaves){
					return {
						runs:d3_sum(leaves,(d) => (d.runs)),
						balls:d3_sum(leaves,(d) => (d.balls))
					}
				})
				.entries(this.data.innings);

		this.match.batters=this.data.innings.map((inn,index) => {
			return {
				inning:index+1,
				batters:inn.batters
			};
		});
		this.match.bowlers=this.data.innings.map((inn,index) => {
			return {
				inning:index+1,
				bowlers:inn.bowlers
			}
		})



		console.log("MATCH",this.match)

		match=this.match;
		
		this.data.innings.forEach((inn) => {

			inn.batters.forEach((batsman) => {
				//////console.log(batsman.name,batsman.inFor);

				

				let wicket=inn.fallenWickets.find((w,i) => {
					return w.id == batsman.id || i==inn.fallenWickets.length-1;
				});
				batsman.ending_balls=wicket?wicket.balls:null;
				if(batsman.status=="batting") {
					batsman.ending_balls=inn.balls;
				}

				if(!batsman.inFor) {
					batsman.starting_balls=0;	
				} else {
					//////console.log(batsman.name,batsman.inFor)
					wicket=inn.fallenWickets.find((w,i) => {
						return w.id == batsman.inFor || i==inn.fallenWickets.length-1;
					});

					//////console.log(wicket)
					batsman.starting_balls=wicket.balls;

				}
				
			})
		})

	}

	

	let _buildChart = () => {
		let self=this;
		let LEFT_PADDING=0,
			RIGHT_PADDING=50,
			SMALL_SIZE=false;
		let container=select(this.options.container)
						.append("div")
						.attr("id","matches")
						.html(matchHTML);

		matchAnalysis=container.select(".match-analysis");

		let box=container.node().getBoundingClientRect();
		let WIDTH=box.width-(LEFT_PADDING+RIGHT_PADDING);//*this.data.innings.length-30*this.data.innings.length;

		console.log("WIDTH",WIDTH)

		//WIDTH=box.width;

		let HEIGHT=200;

		//let WIDTH=(800-80*3) / 4 * this.data.innings.length,
		//HEIGHT=170;

		//WIDTH=(310-65*this.data.innings.length-30*this.data.innings.length);///3 * this.data.innings.length;
		
		let margins={
			top:40,
			right:0,
			bottom:0,
			left:0
		}
		//console.log("///////////",WIDTH,this.match.overall.total_balls)
		let xscale=scaleLinear().range([0,WIDTH-(margins.left+margins.right)]).domain([0,this.match.overall.total_balls]),
			yscale=scaleLinear().range([HEIGHT-(margins.top+margins.bottom),0]).domain([0,d3_max([options.min_runs,d3_max(this.match.score,(d) => (d.value.runs))])]);

		if(box.width<460) {
			SMALL_SIZE=true;
			//xscale.domain([0,d3_max(this.match.score,d=>{return d.value.balls})])
			xscale.domain([0,d3_max(this.match.innings,d=>{return d.value.balls})])
		}

		let runscale=scaleLinear().domain([0,this.match.overall.runs]);



		//console.log(WIDTH,"=======>",this.match.overall.total_balls)

		xscale.range([0,WIDTH])
		
		container
				.select("div.info")
				.html(`${data.stage}<br/>${data.round?data.round+"<br/>":""}${timeFormat("%d %B %Y, %H:%M%p")(new Date(data.dateTime))}<br/>${data.venue}`)

		let summary=container.select("div.match-summary")

		summary.select("h1")
					.html(`<b class="${self.getTeamInfo(data.info[0].id).code}">${data.info[0].name}</b> <span>vs</span> <b class="${self.getTeamInfo(data.info[1].id).code}">${data.info[1].name}</b>`)
		if(data.result) {
			if(data.result.type=='draw') {
				summary.select("h2").html("Match drawn");
			} else {
				summary.select("h2")
							.html(`${data.result.winner.name} won by ${data.result.margin} ${data.result.type}`)	
			}
			
		}
		
		summary.select("div.small-chart")
				.datum(this.match)
				.each(function(d){
					smallchart=new SmallChart(d,{
						container:this,
						getTeamInfo:self.getTeamInfo
					})
				})

		//return;

		let prev_team;
		innings=container
			.select(".partnerships")
				.style("margin-left",LEFT_PADDING+"px")
				.selectAll("div.chart")
					/*.data(SMALL_SIZE?this.match.innings.sort((a,b)=>{
						let first=this.match.innings[0];
						if(a.value.team==b.value.team) {
							return (+a.key) - (+b.key)
						}
						if(a.value.team==first.value.team) {
							return -1;
						} else {
							return 1;
						}
					}):this.match.innings)*/
					.data(this.match.innings)
					.enter()
					.append("div")
						.attr("class","inning chart inns"+this.data.innings.length)
						.classed("clear-left",d=>{
							if(!SMALL_SIZE) return false;
							let is_different=(prev_team && prev_team!=d.value.team);
							prev_team=d.value.team;
							return is_different;
						})
						.attr("rel",(d) => (d.key))
						.attr("data-index",(d,i)=>i)
						.each(function(d,i) {

							var partnershipChart;
							var partnershipTimeline;
							var wicketsTimeline;
							
							////console.log("DATA FOR CHART",data.info[i%2])

							partnershipChart=new PartnershipsChart(d,{
								container:this,
								team_id:d.value.id,
								index:i,
								inning: +d.key,
								extents:self.extents,
								max_balls:options.max_balls,
								xscale:xscale,
								yscale:yscale,
								margins:margins,
								target:true,//i>0?(self.match.innings[i-1].value.total_runs+1):null,
								height:HEIGHT,
								getTeamInfo:self.getTeamInfo,
								callback:(players) => {
									partnershipTimeline.doStuff(players);
									//wicketsTimeline.doStuff(players);
								}
							});
							partnerships.push(partnershipChart);
							//return;
							partnershipTimeline=new PartnershipTimeline(self.match.batters[+d.key-1],{
								innings:d,
								container:this,
								inning: +d.key,
								width:WIDTH,
								extents:self.extents,
								max_balls:options.max_balls,
								xscale:xscale,
								yscale:yscale,
								runscale:runscale,
								margins:margins,
								getTeamInfo:self.getTeamInfo,
								callback:function(players){
									partnershipChart.doStuff(players);
									//wicketsTimeline.doStuff(players);
								}
							});
							partnerships_timelines.push(partnershipChart);
							return;
							wicketsTimeline=new WicketsTimeline({bowlers:self.match.bowlers[i],batters:self.match.batters[i]},{
								innings:d,
								container:this,
								inning: +d.key,
								width:WIDTH,
								extents:self.extents,
								max_balls:options.max_balls,
								xscale:xscale,
								yscale:yscale,
								margins:margins,
								getTeamInfo:self.getTeamInfo,
								callback:function(wicket){
									
									partnershipTimeline.highlightProfile({
										id1:wicket.id,
										player1:wicket.player
									});
								}
							});
						})
		
		let lineOfTime = container
							.select("div.line-of-time");
		lineOfTime
				.selectAll("div.inning")
				.data(innings.nodes().map((node,i)=>{
					
					let box=node.getBoundingClientRect();
					console.log(node,box)
					return {
						index:i,
						h:box.height
					}
				}).concat([{index:5,h:box.height*0.5+50}]))
				.enter()
				.append("div")
					.attr("class","inning")
					.attr("rel",d=>d.index)
					.style("height",d=>(d.h*2)+"px")
					.text(d=>d.index)

		let scroll = new scroller();

		scroll.container(lineOfTime);

		scroll(lineOfTime.selectAll(".inning"))
		let current=-1;
		let fixed=false;
		let selected_partnership=-1;
		let header_fixed=false;
		scroll.on("active",function(index){
			console.log(index);
			smallchart.highlight(index-1);
		})
		scroll.on("progress",function(index,progress,y,local_y){
			//console.log(index,"==",current,"Y",progress,y,local_y,"fixed",fixed)

			if(progress>=0 && progress<0.5 && !fixed && current!==index) {
				console.log("##### 1")
				fixed=true;
				current=index;
				container
					.select(".partnerships")
					.classed("fixed",fixed)
					.style("top",(-(index-1)*475+50)+"px")
					.style("margin-top","0px")
			}
			if(progress>=0.5 && fixed) {
				console.log("##### 2")
				fixed=false;
				current=index;
				container
					.select(".partnerships")
					.classed("fixed",fixed)
					.style("margin-top",((index)*475+50)+"px")
					.style("top","0px")
			}
			if(progress<0.5 && !fixed && current===index) {
				console.log("##### 3")
				fixed=true;
				current=index;
				container
					.select(".partnerships")
					.classed("fixed",fixed)
					.style("top",(-(index-1)*475+50)+"px")
					.style("margin-top","0px")	
			}

			if(progress>=0 && progress<0.5) {
				let value=Math.floor((progress*2)*(match.innings[index-1].value.innings.length));
				if(selected_partnership!==value) {
					console.log(progress,value)

					let partnership=match.innings[index-1].value.innings[value];
					console.log(partnership)
					
					selected_partnership=value;
					partnerships_timelines[index-1].highlightPartnership(partnership);
				}
			}

			if(progress>-60 && !header_fixed) {
				header_fixed=true;
				matchAnalysis.classed("fixed",header_fixed)
			}
			if(progress<-60 && header_fixed) {
				header_fixed=false;
				matchAnalysis.classed("fixed",header_fixed)
				fixed=false;
				container
					.select(".partnerships")
					.classed("fixed",false)
			}

		})
		

	}

	_updateData(data);
	_buildChart();


}