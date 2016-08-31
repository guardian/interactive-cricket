require('array.prototype.find');
var request = require('request');
var http = require('http');
var PORT=8080; 

var TEAMS={
	"a359844f-fc07-9cfa-d4cc-9a9ac0d5d075":{
		"code":"EN",
		"name":"England"
	},
	"f7f611a1-e667-2aa2-c3e0-6dbc6981cfa4":{
		"code":"AU",
		"name":"Australia"
	},
	"0cbc23be-e7cc-9574-611a-06561460eb8b":{
		"code":"SL",
		"name":"Sri Lanka"
	},
	"d8ea81a1-538e-3cbe-f121-c65551738832":{
		"code":"PK",
		"name":"Pakistan"
	},
	"f822b9f9-9fdc-399f-54f9-e621edaf0a28":{
		"code":"IN",
		"name":"India"
	},
	"b24d23a9-5688-ff69-efab-f668f98143d1":{
		"code":"IE",
		"name":"Ireland"
	},
	"4e0813eb-aa70-6ff5-5624-8dbf9962ee19":{
		"code":"OM",
		"name":"Oman"
	},
	"45df02c4-1a79-eda4-292b-36fae063d8c3":{
		"code":"ZW",
		"name":"Zimbabwe"
	},
	"128297de-b623-4849-3940-d9fef94481a6":{
		"code":"SC",
		"name":"Scotland"
	},
	"8fa4bd05-1313-eaa4-3a2d-a5ba198c17da":{
		"code":"AF",
		"name":"Afghanistan"
	},
	"89f1daa8-6025-4011-0012-a457570ff51c":{
		"code":"HK",
		"name":"Hong Kong"
	},
	"24b1b194-0742-8e0a-9a91-1974a4312be6":{
		"code":"NL",
		"name":"Holland"
	},
	"3d5e10fc-5a3f-1f06-6f1b-f86f4a7e8c10":{
		"code":"BD",
		"name":"Bangladesh"
	},
	"110c70b5-c05f-3be7-6670-baecd50a8c6b":{
		"code":"NZ",
		"name":"New Zealand"
	},
	"cc5f2bda-bfc0-f974-09dc-e4727b3681cf":{
		"code":"WI",
		"name":"West Indies"
	},
	"73f5d08d-0950-ca50-796a-a1cdbc9bd602":{
		"code":"ZA",
		"name":"South Africa"
	}
}

function calculateOvers(str) {
	if(typeof str == 'number') {
		return str;
	}
	var overs=str.split(".");
	overs= +overs[0] + (overs[1]?((+overs[1])/6):0);

	return overs;
}

/*
var all_partnerships=require('./data/partnerships_16_07_2015');

all_partnerships.forEach(function(d){
	var overs=d.Overs.split(".");
	d.overs= +overs[0] + (overs[1]?((+overs[1])/6):0);

	var s_overs=d.Overs_Start.split(".");
	d.s_overs= +s_overs[0] + (s_overs[1]?((+s_overs[1])/6):0);

	var e_overs=d.Overs_End.split(".");
	d.e_overs= +e_overs[0] + (e_overs[1]?((+e_overs[1])/6):0);

	var player1=d.Player1.split(" ");
	d.player1=player1[player1.length-1].toLowerCase();

	var player2=d.Player2.split(" ");
	d.player2=player2[player2.length-1].toLowerCase();

	d.Wkt= +d.Wkt.replace("th","").replace("nd","").replace("st","").replace("rd","");
});

all_partnerships.sort(function(a,b){

	var inn_diff= +a.Inns - +b.Inns;

	if(inn_diff===0) {
		return a.Wkt - b.Wkt;
	}
	return inn_diff;

	//return +a.Overs_Start - (+b.Overs_Start);
	*/
	/*
	var outA=a.End.split("/"),
		outB=b.End.split("/"),
		scoreA= +outA[1],
		scoreB= +outB[1];

	var inn_diff=+a.Inns - +b.Inns;

	if(inn_diff===0) {
		return +a.Wkt - +b.Wkt;
	}
	return inn_diff;
	*/
/*
})


var prev;
all_partnerships.forEach(function(d,i){
	

	d.starting_over=d.s_overs;
	d.ending_over=d.e_overs;
	*/
	/*
	if(d.Wkt===1) {
		d.starting_over=0;
	} else {
		d.starting_over=prev.ending_over;
	}
	d.ending_over=d.starting_over+d.overs;
	prev=d;
	*/
/*
})
*/

//console.log(all_partnerships);


//process.exit(0);
var express = require('express'),
	cors = require('cors'),
	app = express();
 

var CURRENT_MATCH="ea36549b-3064-fc88-d43c-0e9cc5d7b593";

app.use(cors());
 
app.get('/', function(req, res, next){
  //res.json({msg: 'This is CORS-enabled for all origins!'});
  
  getScorecard(req.query.match_id,function(stats){
  	res.json(stats);
  })
  
});
 
app.listen(PORT, function(){
  console.log('CORS-enabled web server listening on port',PORT);
});

var fixes={
	"00d08f33-0e01-0688-2a6d-146e9b288194":[
		{
			match:"16 Jul 2015",
			innings:2, //3-1
			order:"3",
			fallenWicket:[
				{
					order: "0",
					statistic: [
						{
							type: "runs",
							value: "114"
						},
						{
							type: "over-and-ball",
							value: "27"
						}
					],
					player: {
						id: "0bb0c092-c462-508f-ddf8-2b6cbd60b756",
						name: "C J L Rogers",
						initials: "C J L",
						firstName: "Christopher",
						middleName: "John Llewellyn",
						lastName: "Rogers"
					}
				}
			]
		}
	],
	"589431ae-d3af-ff02-0859-ee698b24262a":[
		{
			max_overs:18
		}
	]
}
function fixInnings(match_id,innings) {
	//console.log(CURRENT_MATCH)
	if(typeof innings.length == 'undefined') {
		//console.log("NOT AN ARRAY")
		innings=[innings];
	}

	if(fixes[match_id]) {
		fixes[match_id].forEach(function(fix){
		
			//innings[fix.innings].fallenWicket.concat(fix.fallenWicket);
			
			//var inns=innings.find(function(inn){
			//	return inn.order == fix.order;
			//});

			

			innings.filter(function(inn){
				return inn.order == fix.order;
			}).forEach(function(inns){
				inns.fallenWicket=inns.fallenWicket.concat(fix.fallenWicket)

				inns.fallenWicket.sort(function(a,b){
					return +a.order - +b.order;
				})	
			})

		});


	}
	return innings;
}
var options = {
  url: 'http://cricket.api.press.net/v1/match/'+CURRENT_MATCH+'/scorecard/', 
  //url: 'http://localhost/~czapponi/gnm/ashes/realtime/server/data/match.json',
  headers: {
    "Accept": "application/json",
    "Apikey": "zy38cnn8ce26qzdrc8qkxmu9"
  }
};
function getName(fullname) {
	var name=fullname.split(" ");
	return name[name.length-1].toLowerCase();
}

function getScorecard(match_id,callback) {
	console.log("##################################");
	console.log("FETCHING");
	console.log("##################################");

	var stats={};
	stats[match_id]={};
	function getBowlers(innings) {
		return innings.bowling.bowler.map(function(b){
			var name=b.player.name.split(" ");
			return {
				name:name[name.length-1].toLowerCase(),
				id:b.player.id,
				order:+b.order,
				overs:+b.statistic.find(function(d){return d.type=="overs"}).value,
				balls:+b.statistic.find(function(d){return d.type=="balls"}).value,
				runs:+b.statistic.find(function(d){return d.type=="runs-conceded"}).value,
				maidens:+b.statistic.find(function(d){return d.type=="maidens"}).value,
				noballs:+b.statistic.find(function(d){return d.type=="no-balls"}).value,
				wickets:+b.statistic.find(function(d){return d.type=="wickets-taken"}).value,
				wides:+b.statistic.find(function(d){return d.type=="wides"}).value
			}
		});
	}
	function getBatters(innings) {
		var last_out;
		
		return innings.batting.batter.map(function(b){
			var name=b.player.name.split(" ");
			
			return {
				name:name[name.length-1].toLowerCase(),
				id:b.player.id,
				order:+b.order,
				status:b.status,
				runs:+b.statistic.find(function(d){return d.type=="runs-scored"}).value,
				balls:+b.statistic.find(function(d){return d.type=="balls-faced"}).value,
				minutes:+b.statistic.find(function(d){return d.type=="minutes-batting"}).value,
				fours:+b.statistic.find(function(d){return d.type=="fours"}).value,
				sixes:+b.statistic.find(function(d){return d.type=="sixes"}).value,
				dismissal:b.dismissal?{
					type:b.dismissal.type,
					description:b.dismissal.description
				}:null
			}
			
		}).sort(function(a,b){
			return a.order - b.order;
		})
	}

	function getFallenWickets(wickets,inning_index) {
		if(!wickets){
			return [];
		}

		if(typeof wickets.length == 'undefined') {
			wickets=[wickets];
		}

		return wickets.map(function(w){

			var name=w.player.name.split(" "),
				runs=w.statistic.find(function(d){return d.type=="runs"}),
				over=w.statistic.find(function(d){return d.type=="over-and-ball"});
			
			var balls = (function(){
							var __overs=over.value.split("."),
								balls= (+__overs[0]*6) + (__overs[1]?(+__overs[1]):0);
							return balls;
						}())

			return {
				inning:inning_index,
				order: +w.order,
				id: w.player.id,
				name: name[name.length-1].toLowerCase(),
				runs: +runs.value,
				over: over.value,
				balls: balls
			}
		})
	}

	function getPartnerships(batters,wickets,inning_index) {

		/*var out_players=wickets.map(function(w){
			return w.name;
		});*/



		var partnerships=[]

		var starting=0;

		var partnership=[
			batters[0],
			batters[1]
		];
		partnership[0].starting=starting;
		partnership[1].starting=starting;

		//console.log(partnership[0])

		var wicket0=wickets.find(function(w){
			return w.id == partnership[0].id && w.inning == inning_index;
		})
		
		var wicket1=wickets.find(function(w){
			return w.id == partnership[1].id && w.inning == inning_index;
		})
		
		partnership[0].ending=wicket0?wicket0.balls:null;
		partnership[1].ending=wicket1?wicket1.balls:null;
		
		//partnership[0].ending= +batters[0].balls;
		//partnership[1].ending= +batters[1].balls;
		


		partnerships.push({
			partners:partnership
		});



		//console.log(partnership[0].name,partnership[1].name)

		var out;

		for(var i=2;i<batters.length;i++) {
			var current_partnership=partnerships[partnerships.length-1].partners,
				next_out=(current_partnership[0].ending<current_partnership[1].ending)?0:1;





			if(!current_partnership[0].ending) {
				next_out=1;
			}
			if(!current_partnership[1].ending) {
				next_out=0;
			}

			//FIX FOR BUG WHEN THE FIRST BATTING GUY .ending IS LOWER
			//THEN THE LAST BATTED OUT
			var wicket=wickets.find(function(w){
				return w.id == current_partnership[next_out].id  && w.inning == inning_index;
			})
			if(!wicket) {
				next_out = !next_out?1:0;
			}

			console.log("between",current_partnership[0].name,current_partnership[0].ending,"and",current_partnership[1].name,current_partnership[1].ending,"next out is",current_partnership[next_out].name)


			//console.log(current_partnership[0].name,current_partnership[0].ending,"<",current_partnership[1].name,current_partnership[1].ending)
			//console.log("OUT",next_out,current_partnership[next_out].name)

			batters[i].starting=current_partnership[next_out].ending;
			
			var wicket=wickets.find(function(w){
				return w.id == batters[i].id  && w.inning == inning_index;
			})


			if(wicket) {
				batters[i].ending=wicket.balls;	
				//console.log(batters[i].name,wicket.balls,wicket.over)
			} else {

				batters[i].ending=batters[i].starting+batters[i].balls;

				console.log(batters[i].name,batters[i].ending)
			}
			

			//batters[i].ending=batters[i].starting+batters[i].runs;
			

			batters[i].inFor=current_partnership[next_out].id;
			batters[i].inForName=current_partnership[next_out].name;

			//console.log("NEW PARTNERS",current_partnership[next_out?0:1].name,batters[i].name)

			partnerships.push({
				partners:[
					current_partnership[next_out?0:1],
					batters[i]
				]
			});
		}

		//console.log(partnerships)



		return partnerships;
	}
	

	if(match_id) {
		CURRENT_MATCH=match_id;
		options.url = 'http://cricket.api.press.net/v1/match/'+(CURRENT_MATCH)+'/scorecard/';
	}
	

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);

			if(error) {
				console.log("ERROR",error)
				process.exit(0)
			}

			var match=info.cricket.match;
			console.log(body)
			//return;
			var innings=fixInnings(match_id,match.innings);

			/*
			stats[match_id]=match;
			callback(stats[match_id]);
			return;
			*/
			//process.exit(0);
			

			//console.log(innings)
			//return;

			var current_innings=innings[innings.length-1];

			//console.log(match.innings)
			//return;

			stats[match_id]= {
				dateTime:match.dateTime,
				stage:match.stage,
				round:match.round,
				venue:match.venue.name,
				max_overs:fixes[match_id]?fixes[match_id][0].max_overs:20,
				result:match.result?{
					type:match.result.type==='draw'?'draw':match.result.winner.type,
					winner:match.result.type==='draw'?"none":match.result.winner.team,
					margin:match.result.type==='draw'?0:match.result.winner.margin
				}:null,
				teams:TEAMS,
				current:{
					team:current_innings.batting.team.name,
					id:current_innings.batting.team.id,
					overs:current_innings.statistic.find(function(d){return d.type=="overs"}).value,
					runs:current_innings.statistic.find(function(d){return d.type=="runs-scored"}).value,
					wickets:current_innings.statistic.find(function(d){return d.type=="wickets"}).value	
				},
				innings: (function(){

					return innings.map(function(i){
						var overs = (i.statistic.find(function(d){return d.type=="overs"}).value),
							team = i.batting.team.name,
							id = i.batting.team.id,
							balls = (function(){
								if(typeof overs == 'number') {
									return overs*6;
								}
								var __overs=overs.split("."),
									balls= (+__overs[0]*6) + (__overs[1]?(+__overs[1]):0);
								return balls;
							}());
						var inning= {
							team: team,
							id: id,
							overs: overs,
							balls: balls,
							runs: +i.statistic.find(function(d){return d.type=="runs-scored"}).value,
							wickets: i.fallenWicket.length,//+i.statistic.find(function(d){return d.type=="wickets"}).value,
							batters: getBatters(i),
							bowlers: getBowlers(i),
							fallenWickets: getFallenWickets(i.fallenWicket,i.order)
						}
						inning.partnerships = getPartnerships(inning.batters,inning.fallenWickets,i.order);
						return inning;
					})
				}()),

			};
			
			

			var batted=current_innings.batting.batter.filter(function(d){
				return d.status=="batted";
			});
			var batting=current_innings.batting.batter.filter(function(d){
				return d.status=="batting";
			});

			stats[match_id].batting=batting.map(function(b){
				return {
					name:b.player.name,
					id:b.player.id,
					runs:b.statistic.find(function(d){return d.type=="runs-scored"}).value,
					balls:b.statistic.find(function(d){return d.type=="balls-faced"}).value,
					minutes:b.statistic.find(function(d){return d.type=="minutes-batting"}).value,
					fours:b.statistic.find(function(d){return d.type=="fours"}).value,
					sixes:b.statistic.find(function(d){return d.type=="sixes"}).value
				}
			})

			//stats.partnerships2=all_partnerships;


			stats[match_id].partnerships=[];

			stats[match_id].info=[
				{
					id:match.team[0].id,
					name:match.team[0].name
				},
				{
					id:match.team[1].id,
					name:match.team[1].name
				}
			]

			stats[match_id].innings.forEach(function(inns,index){
				var prev_over=0,
					prev_runs=0,
					prev_out="-";
				inns.partnerships.forEach(function(p,i){
					console.log("!!!!",p.partners[0])
					var partnership={
						player1:p.partners[0].name,
						id1:p.partners[0].id,
						player2:p.partners[1].name,
						id2:p.partners[1].id,
						Inns:index+1,
						id:inns.id,//team.replace(/\s/gi,""),//TEAMS[inns.team],//(inns.team=="England"?"EN":"AU"),
						team:inns.team,
						Wkt:i+1,
						starting_over:prev_over,
						ending_over:inns.fallenWickets[i]?calculateOvers(inns.fallenWickets[i].over):calculateOvers(inns.overs),
						ending_runs:inns.fallenWickets[i]?inns.fallenWickets[i].runs:+inns.runs,
						/*
						// WORKS ONLY REALTIME
						ending_over:inns.fallenWickets[i]?calculateOvers(inns.fallenWickets[i].over):calculateOvers(stats.current.overs),
						ending_runs:inns.fallenWickets[i]?inns.fallenWickets[i].runs:+stats.current.runs,
						*/
						inA:prev_out
					}
					partnership.overs=partnership.ending_over-partnership.starting_over;
					partnership.runs=partnership.ending_runs - prev_runs;
					partnership.Runs=partnership.runs;
					
					//if(partnership.Inns==3) {
					//	console.log(inns.fallenWickets[i],partnership.ending_over,partnership.starting_over)
					//	console.log(stats.current)
					//}


					//if(partnership.Runs<0) {
					//	console.log(p,partnership.ending_over,partnership.starting_over)
					//}

					if(partnership.ending_runs) {
						partnership.Out=partnership.Wkt+"/"+partnership.ending_runs;	
					}
					partnership.RR=partnership.runs/partnership.overs;

					prev_out=partnership.Out;
					prev_over=partnership.ending_over;
					prev_runs=partnership.ending_runs;
					
					stats[match_id].partnerships.push(partnership)
				})
			})
			
			//console.log(stats)


		}

		if(callback) {
			callback(stats[match_id]);
		}

		//setTimeout(getScorecard,30 * 1000);
	});

	
}

//getScorecard();


