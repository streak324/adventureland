import { do_common_routine, follow, attack_leaders_target} from "./1/common"

setInterval(function() {
	do_common_routine();
	if (character.party == undefined) return;
	var leader = get_player(character.party);
	if (leader != undefined) {
		follow(leader);
		attack_leaders_target(leader);
	}
},1000/5); // Loops every 1/5 seconds.