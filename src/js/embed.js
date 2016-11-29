import iframeMessenger from 'guardian/iframe-messenger'
import embedHTML from './text/embed.html!text'

import {pa_ids} from '../assets/data/ids.js'

import {
	json as d3_json
} from 'd3-request';

import {
	max as d3_max
} from 'd3-array';

import {
	selection
} from 'd3-selection-multi'

import {
  getURLParameter
} from './lib/utils'

import CricketChart from './components/CricketChart'

window.init = function init(el, config) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;

    let pa_index=pa_ids.length-1,
        tid=pa_ids[pa_index];

    let param=getURLParameter("tid");

    if(param) {
      tid=param;
    }
    
    //d3_json("http://localhost:8080/?match_id="+tid,(data)=>{
    //d3_json(`${config.assetPath}/assets/data/${tid}.json`).then((data)=>{
    d3_json(`${config.assetPath}/assets/data/${tid}.json`,(data)=>{
    //d3_json("http://localhost:8080/?match_id="+pa_ids[pa_index],(data)=>{
    	console.log(data);

    	new CricketChart(data,{
  			container:el,
  			max_overs: d3_max(data.innings,function(d){return +d.overs}),
  			max_balls: d3_max(data.innings,function(d){return d.balls}),
  			min_runs: 200
  		});

    })

};

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value: function(predicate) {
     'use strict';
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
    }
  });
}