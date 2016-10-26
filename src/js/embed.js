import iframeMessenger from 'guardian/iframe-messenger'
import embedHTML from './text/embed.html!text'

import {pa_ids} from '../assets/data/ids.js'

import {
	json as d3_json
} from 'd3-fetch';

import {
	max as d3_max
} from 'd3-array';

import {
	selection
} from 'd3-selection-multi'

import CricketChart from './components/CricketChart'

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;

    let pa_index=pa_ids.length-1;
    //console.log(pa_ids)
    //pa_index=7;
    d3_json("http://localhost:8080/?match_id="+pa_ids[pa_index]).then((data)=>{
    	console.log(data);

    	new CricketChart(data,{
			container:el,
			max_overs: d3_max(data.innings,function(d){return +d.overs}),
			max_balls: d3_max(data.innings,function(d){return d.balls}),
			min_runs: 200
		});

    })

};
