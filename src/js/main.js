import iframeMessenger from 'guardian/iframe-messenger'
import d3 from 'd3'
import mainHTML from './templates/main.html!text'

import Partnerships from './components/Partnerships'

export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML

    console.log(d3)

    var pa_ids=[
		"ea36549b-3064-fc88-d43c-0e9cc5d7b593",
		"00d08f33-0e01-0688-2a6d-146e9b288194",
		"15081cc4-eb9a-76c3-3cd6-bc7cb91ea277",
		"85d470eb-ef89-70c6-8916-1f0d7f5c7451",
		"c82049d1-92b8-9b2d-b8db-c737cdbdba97", //pakistan - sri lanka
		"91d3f83e-201e-ca23-192c-560875d3982a", //india - england test match
		"5e1e6233-7b88-9c63-7d17-3077364350b9", //india - england test match
		"99c10a3a-fed1-b89a-fb87-dbfd1e4a6180", //india - sri lanka 12 Aug 2015
		"a3d2e993-2a9c-43fc-b187-23ee19587205", //ireland - oman T20 WC
		"6b827271-95f9-d29a-9a58-36669805e1ea", //scotland - zimbabwe T20 WC
		"8fd452eb-36de-7094-0bb4-72406a35c550" //afghanistan - hong kong T20 WC
	]

	let pa_index=pa_ids.length-2;

	//pa_index=2;
	
	d3.json("http://localhost:8080/?match_id="+pa_ids[pa_index],function(data){

		new Partnerships(data,{
			container:"#matches"
		});

	});
	/*
	d3.json("http://localhost:8080/?match_id="+pa_ids[2],function(data){

		new Partnerships(data,{
			container:"#matches"
		});

	});
    */
}
