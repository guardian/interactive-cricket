import {
	select
} from 'd3-selection'
import {
	scaleLinear
} from 'd3-scale'
import {
	line
} from 'd3-shape'
import {
	strokeShadow
} from '../lib/CSSUtils';
import {
	range
} from 'd3-array';

export default function SmallChart(data,options) {

	let margins=options.margins || {
		top:10,
		right:10,
		bottom:0,
		left:10
	}

	let svg,
		WIDTH,
		HEIGHT;

	function builData() {
		console.log(data);
	}

	function buildVisual() {

		let box=options.container.getBoundingClientRect();
		WIDTH=box.width;
		HEIGHT=box.height;

		console.log(options.container,box)
		//return;

		svg=select(options.container)
			.append("svg")
			.style("width",WIDTH+"px")
			.attr("width",WIDTH)
			.attr("height",HEIGHT);

		
		let xscale=scaleLinear().domain([0,data.overall.total_balls]).range([0,WIDTH-(margins.left+margins.right)]),
			yscale=scaleLinear().domain([0,data.overall.runs]).range([HEIGHT-(margins.top+margins.bottom),0]);


		let innings=svg.append("g")
						.attr("transform",`translate(${margins.left},${margins.top})`)
						.selectAll("g.innings")
							.data(data.innings)
							.enter()
							.append("g")
								.attr("class",function(d){
									return "innings "+options.getTeamInfo(d.value.id).code;
								})
								.attr("transform",d=>{
									let x=xscale(d.value.starting_balls),
										y=0;
									return `translate(${x},${y})`
								})

		var area = line()
				    .x(function(d) { return (d.x); })
				    .y(function(d) { return (d.y); });

		innings.append("path")
					.attr("class","runs-bg")
					.attr("d",d=>{
						let points=[
							{
								x:0,
								y:yscale(0)
							},
							{
								x:0,
								y:yscale(d.value.starting_runs)
							},
							{
								x:xscale(d.value.balls),
								y:yscale(d.value.total_runs+d.value.starting_runs)
							},
							{
								x:xscale(d.value.balls),
								y:yscale(0)
							}
						];

						//console.log(points,area(points))

						return area(points);
						
					})
		

		innings.append("line")
					.attrs(d=>({
						class:"runs",
						x1:0,
						y1:yscale(d.value.starting_runs),
						x2:xscale(d.value.balls),
						y2:yscale(d.value.total_runs+d.value.starting_runs)
					}))
		/*innings
			.filter(d=>d.value.starting_runs>0 && (d.value.id!==d.value.prev_inning_team_id))
			.append("line")
			.attrs(d=>({
				class:"run-link",
				x1:-xscale(d.value.prev_inning_played_balls),
				y1:yscale(d.value.starting_runs)-1,
				x2:0,
				y2:yscale(d.value.starting_runs)-1
			}))*/

		
		innings
			.append("text")
				.attrs(d=>({
					class:"runs",
					x:xscale(d.value.balls),
					y:yscale(d.value.total_runs+d.value.starting_runs),
					dy:"0.1em",
					dx:"-7"
				}))
				.text(d=>(d.value.total_runs+d.value.starting_runs))	
				.each(function(){
    				strokeShadow(this,1.5,"rgba(255,255,255,1)");
    			})
		
		

	}

	builData();
	buildVisual();

}