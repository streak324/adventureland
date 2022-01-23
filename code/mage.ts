import { do_common_routine, attack_leaders_target, deep_smart_move, state} from "./1/common"

setInterval(function() {
	do_common_routine();
	if (character.party == undefined) return;
	state.dest = {id: character.party}
	deep_smart_move(state.dest, 5);

	var leader = get_player(character.party);
	if (leader != undefined) {
		attack_leaders_target(leader);
	}
},1000/5); // Loops every 1/5 seconds.