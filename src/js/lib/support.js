export function getBalls(overs) {

	if(typeof overs === 'number') {
		return overs*6;
	}

	//console.log(overs,typeof overs)

	if(overs.indexOf(".")===-1) {
		return +overs*6;
	}

	let __overs=overs.split(".");

	return +__overs[0]*6+ (+__overs[1]);



}