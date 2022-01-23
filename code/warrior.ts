
import { do_common_routine, state, PARTY_MEMBERS, is_friendly } from "./1/common"

global.state = state;
state.attack_mode = true;
state.msearch = {type: "tortoise"};

setInterval(function() {
	do_common_routine();

	if (character.party != undefined && !is_friendly(character.party)) {
		leave_party();
	}
	for (let i = 0; i < PARTY_MEMBERS.length; i++) {
		var c = get_player(PARTY_MEMBERS[i]);
		if (c != undefined && c.party == undefined && c.name != character.name) {
			send_party_invite(c.name);
		}
	}

	if(!state.attack_mode || character.rip || is_moving(character)) return;

	var target=get_targeted_monster();
	if(!target)
	{
		target=get_nearest_monster(state.msearch);
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(!is_in_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
	}
	else if(can_attack(target))
	{
		set_message("Attacking");
		var mtarget = get_target_of(target);
		if(mtarget && mtarget.name != character.name && !is_on_cooldown("taunt")) {
			use_skill("taunt");
		}
		attack(target);
	}
}, 1000/5);

function init_warrior() {
	map_key("0","snippet","state.attack_mode=false;\nchange_target(undefined);");
	map_key("T","snippet","state.attack_mode=true;state.msearch={type: character.target.type}");
}
init_warrior();