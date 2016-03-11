import PartnershipsChart from './PartnershipsChart'
import PartnershipTimeline from './PartnershipTimeline'
import WicketsTimeline from './WicketsTimeline'
import matchHTML from './templates/match.html!text'

export default function Partnerships(data,options) {

	console.log("Partnerships",data)

	this.getTeamInfo = () => {};

	this.extents;
	this.startFrom=0;
	this.match={};

	this.data=data;
	
	this.options=options;

	

	

	
	let _updateData = (data) => {

		let prev_balls=0,
			prev_runs={};

		prev_runs[this.data.info[0].id]=0;
		prev_runs[this.data.info[1].id]=0;

		this.getTeamInfo = (teamID) => {
			//console.log("getTeamClass",teamID)
			return data.teams[teamID];

		}
		var self=this;
		this.match.innings=d3.nest()
				.key((d) => (+d.Inns))
				.rollup(function(leaves){

					

					let stuff= {

						leaves:leaves,
						id:leaves[0].id,
						team:leaves[0].team,
						overs:d3.extent(leaves,(d)=>{
							return d.overs;
						}),
						Over:data.innings[+leaves[0].Inns-1].overs,
						balls:d3.extent(leaves,(d)=>{
							return d.overs*6;
						}),
						starting_balls:prev_balls,
						starting_runs:prev_runs[leaves[0].id],
						runs:d3.extent(leaves,(d)=>{
							return +d.Runs;
						}),
						total_runs:d3.sum(leaves,(d)=>{
							return +d.Runs;
						}),
						total_balls:d3.sum(leaves,(d)=>{
							return d.overs*6;
						}),
						innings:(((leaves) => {
							let starting_over=0,
								starting_runs=0;
							
							return leaves.map((d,i) => {

								let order1=self.data.innings[+leaves[0].Inns-1].batters.find((p)=>{
									return p.id == d.id1;
								})
								
								d.order1=order1.order;

								let order2=self.data.innings[+leaves[0].Inns-1].batters.find((p)=>{
									////console.log(p.name,d.player2)
									return p.id == d.id2;
								})

								d.order2=order2.order;

								d.starting_over=starting_over;
								d.starting_balls=starting_over*6;
								starting_over+=d.overs;

								d.starting_runs=starting_runs;
								starting_runs+=d.Runs;

								return d;
							})
						})(leaves))
					};
					prev_balls+=stuff.total_balls;
					prev_runs[leaves[0].id]+=stuff.total_runs;
					////console.log("prev_balls",prev_balls)
					return stuff;
				})
				.entries(this.data.partnerships)

		this.match.innings.forEach((d,i) => {
			let info=self.data.innings[i];
			d.values.wickets=info.wickets;
		})

		this.match.overall={
			total_runs:d3.sum(this.data.partnerships,(d) => {
				return +d.Runs;
			}),
			total_balls:d3.sum(this.data.partnerships,(d) => {
				return d.overs*6;
			}),
			runs:d3.max(this.match.innings.map((d) => {
				return d.values.runs[1];
			}))
		}

		this.match.score=d3.nest()
				.key(function(d){
					return d.id;
				})
				.rollup(function(leaves){
					return {
						runs:d3.sum(leaves,(d) => (d.runs))
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



		////console.log("MATCH",match)
		
		this.data.innings.forEach((inn) => {

			inn.batters.forEach((batsman) => {
				////console.log(batsman.name,batsman.inFor);

				

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
					////console.log(batsman.name,batsman.inFor)
					wicket=inn.fallenWickets.find((w,i) => {
						return w.id == batsman.inFor || i==inn.fallenWickets.length-1;
					});

					////console.log(wicket)
					batsman.starting_balls=wicket.balls;

				}
				
			})
		})

	}

	

	let _buildChart = () => {
		let self=this;
		
		let container=d3.select(this.options.container)
			.append("div")
			.html(matchHTML);

		let box=container.node().getBoundingClientRect();
		let WIDTH=box.width-65*this.data.innings.length-30*this.data.innings.length;
		let HEIGHT=170;

		//let WIDTH=(800-80*3) / 4 * this.data.innings.length,
		//HEIGHT=170;

		//WIDTH=(310-65*this.data.innings.length-30*this.data.innings.length);///3 * this.data.innings.length;
		
		let margins={
			top:20,
			right:0,
			bottom:0,
			left:0
		}
		console.log("!!!!",this.match.overall.total_balls)
		let xscale=d3.scale.linear().range([0,WIDTH-(margins.left+margins.right)]).domain([0,this.match.overall.total_balls]),
			yscale=d3.scale.linear().range([HEIGHT-(margins.top+margins.bottom),0]).domain([0,d3.max(this.match.score,(d) => (d.values.runs))]);

		let runscale=d3.scale.linear().domain([0,this.match.overall.runs]);


		

		container.select("h1")
					.html(`${data.info[0].name} <span>vs</span> ${data.info[1].name}`)
		container.select("h2")
					.html(`${data.result.winner.name} won by ${data.result.margin} ${data.result.type}`)
		container.select("div.info")
					.html(`${data.stage}<br/>${data.round?data.round+"<br/>":""}${d3.time.format("%d %B %Y, %H:%M%p")(new Date(data.dateTime))}<br/>${data.venue}`)

		container
			.select(".partnerships")
				.selectAll("div.chart")
					.data(this.match.innings)
					.enter()
					.append("div")
						.attr("class","chart inns"+this.data.innings.length)
						.attr("rel",(d) => (d.key))
						.each(function(d,i) {

							//console.log(d,self);

							var partnershipChart;
							var partnershipTimeline;
							var wicketsTimeline;
							
							partnershipChart=new PartnershipsChart(d,{
								container:this,
								inning: +d.key,
								extents:self.extents,
								xscale:xscale,
								yscale:yscale,
								margins:margins,
								height:HEIGHT,
								getTeamInfo:self.getTeamInfo,
								callback:(players) => {
									partnershipTimeline.doStuff(players);
									wicketsTimeline.doStuff(players);
								}
							});
							
							partnershipTimeline=new PartnershipTimeline(self.match.batters[i],{
								innings:d,
								container:this,
								inning: +d.key,
								width:WIDTH,
								extents:self.extents,
								xscale:xscale,
								yscale:yscale,
								runscale:runscale,
								margins:margins,
								getTeamInfo:self.getTeamInfo,
								callback:function(players){
									partnershipChart.doStuff(players);
									wicketsTimeline.doStuff(players);
								}
							});
							
							wicketsTimeline=new WicketsTimeline({bowlers:self.match.bowlers[i],batters:self.match.batters[i]},{
								innings:d,
								container:this,
								inning: +d.key,
								width:WIDTH,
								extents:self.extents,
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
	}

	_updateData(data);
	_buildChart();
}