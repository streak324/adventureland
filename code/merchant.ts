import { do_common_routine, state, PARTY_LEAD, get_position, is_inventory_full, is_inventory_empty, deep_smart_move} from "./1/common"

state.task = undefined;

init_merchant();

module.exports = {
	state
};

global.give_gear = give_gear;

setInterval(function(){
	do_common_routine();
	switch(state.task) {
		case "mule": {
			if (state.p_lead_pos == undefined) {
				get_position(PARTY_LEAD);
				return;
			}
			if (is_inventory_full()) {
				state.banking = true;
			} else if (is_inventory_empty()) {
				state.banking = false;
			}

			if (!state.banking) {
				deep_smart_move({name: PARTY_LEAD, x: state.p_lead_pos.x, y: state.p_lead_pos.y, map: state.p_lead_pos.map, max_dist: 5})
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
			if (state.p_lead_pos == undefined) {
				return;
			}
			if(deep_smart_move({name: state.gear_receiver, x: state.p_lead_pos.x, y: state.p_lead_pos.y, map: state.p_lead_pos.map, max_dist: 5})) {
				var item = character.items[state.give_inven_slot];
				send_item(state.gear_receiver, state.give_inven_slot);
				send_cm(state.gear_receiver, {type: "gear_up", gear: item});
				state.task = undefined;
			}
		} break;
	}
},1000/4); // Loops every 1/4 seconds.


function give_gear(id: string, i: number) {
	var found_gear = false;
	let item = character.items[i];
	if (!item) {
		return log("no item in slot", "red");
	}

	state.task = "give_gear";
	state.give_inven_slot = i;
	found_gear = true;
	state.gear_receiver = id;
	get_position(id);
}

function init_merchant() {
	map_key("Q","snippet","exports.give_gear(character.target, 0)")
}