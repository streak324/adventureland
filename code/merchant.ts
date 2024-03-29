import { do_common_routine, state, PARTY_LEAD, get_position, is_inventory_full, is_inventory_empty, deep_smart_move, is_friendly} from "./1/common"

state.task = undefined;

init_merchant();

global.give_gear = give_gear;

setInterval(function(){
	do_common_routine();
	switch(state.task) {
		case "mule": {
			if (is_inventory_full()) {
				state.banking = true;
			} else if (is_inventory_empty()) {
				state.banking = false;
			}

			if (!state.banking) {
				state.dest = {id: PARTY_LEAD };
				deep_smart_move(state.dest, 5);
			} else {
				if (deep_smart_move({map: "bank"})) {
					if (character.gold > 0) {
						bank_deposit(character.gold);
					}
					for(let i = 0; i < character.items.length; i++) {
						if (!character.items[i]) continue;
						bank_store(i);
						return;
					}
				}
			}
		} break;
		case "give_gear": {
			if (state.dest == undefined) {
				return;
			}
			if(deep_smart_move(state.dest, 5)) {
				var item = character.items[state.give_inven_slot];
				send_item(state.dest.id, state.give_inven_slot);
				state.task = undefined;
				setTimeout(function() {
					send_cm(state.gear_receiver, {type: "gear_up", gear: item});
				}, 500);
			}

		} break;
	}
},1000/4); // Loops every 1/4 seconds.


function give_gear(id: string, i: number) {
	if(!is_friendly(id)) {
		log("stop giving shit to unfriendly: " + id);
	}
	var found_gear = false;
	let item = character.items[i];
	if (!item) {
		return log("no item in slot", "red");
	}

	state.task = "give_gear";
	state.give_inven_slot = i;
	get_position(id);
}

function init_merchant() {
	map_key("Q","snippet","give_gear(character.focus, 0)");
	map_key("R", "snippet", "upgrade(1, 0)");
	map_key("M", "snippet", "state.task='mule'")
	map_key("0", "snippet", "state.task='none'")
}