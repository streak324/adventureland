export { state, PARTY_LEAD, PARTY_MEMBERS, is_friendly, attack_leaders_target, follow, on_party_invite};

const HP_POTION_THRESHOLD=0.80;
const PARTY_MEMBERS=["TrogWarrior1", "TrogMage1", "TrogPriest1", "TrogMerch1"];
const PARTY_LEAD = "TrogWarrior1";
const MERCHANT = "TrogMerch1";
const PERSIST_STATE_VARS = ["task", "msearch", "attack_mode"];

interface State {
	attack_mode: boolean;
	msearch: {},
	task: string
	p_lead_pos: {
		x: number,
		y: number,
		map: string,
	},
	smart_result: number,
	give_inven_slot: number,
	gear_receiver: string,
	banking: boolean,
	item_sent: boolean,
}

var state: State = {
	attack_mode: false,
	msearch: {},
	task: "",
	p_lead_pos: undefined,
	smart_result: -1,
	give_inven_slot: -1,
	gear_receiver: "",
	banking: false,
	item_sent: false,
};

function set_state(state_var, state_val) {
	state[state_var] = state_val;	
	set(character.name + ":"+state_var, state_val);
}

function attack_leaders_target(leader) {
	change_target(get_target_of(leader));

	var target=get_targeted_monster();
	if(target && is_in_range(target) && can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}
}

function recover_hp_or_mp() {
	if(!is_on_cooldown("use_mp") && character.max_mp - character.mp > 100) {
		use_skill('use_mp');
	}
	var hp = character.hp / character.max_hp;
	if(!is_on_cooldown("use_hp") && hp < HP_POTION_THRESHOLD) {
		use_skill('use_hp');
	}
}

function on_party_invite(name) {
	if(is_friendly(name)) {
		accept_party_invite(name);
	}
}

function dist_sq(a, b) {
	var height_avg = (a.aheight + b.aheight)/2;
	var width_avg = (a.awidth + b.awidth) / 2;
	var dx = (a.x - b.x)/width_avg;
	var dy = (a.y - b.y)/height_avg;
	return dx * dx + dy * dy;
}

function follow(pl, max_dist=3) {
	var dsq = dist_sq(pl, character)
	if (dsq > max_dist * max_dist) {
		move(
			character.x+(pl.x-character.x)/max_dist,
			character.y+(pl.y-character.y)/max_dist
		);
		return false;
	}
	return true;
}

function is_friendly(name) {
	return PARTY_MEMBERS.indexOf(name) > -1;
}

function smart_move_p(d) {
	state.smart_result = -1;
	smart_move(d)
		.then(_ => { state.smart_result = 1 })
		.catch(_ => { state.smart_result = 0 });
}

//returns true if it reached the specified position
export function deep_smart_move(dest) {
	if (smart.moving || state.smart_result === -1) {
		return false;
	}
	if (dest.name) {
		if (state.smart_result === 0) {
			get_position(dest.name);
			return false;
		}

		var e = get_entity(dest.name);
		if (e) {
			if (can_move_to(dest.x, dest.y)) {
				return follow(e, dest.dist);
			} else {
				smart_move_p(e);
			}
			return false;
		} else if (dest.map != character.map) {
			smart_move_p(dest.map);
		} else {
			smart_move_p({x: dest.x, y: dest.y});
		}
		return false
	} else if (dest.map) {
		if (dest.map == character.map) {
			return true;
		}

		if (state.smart_result === 0) {
			log("deep_smart_move: UNABLE TO FIND " + dest.map, "red");
			return false;
		}

		smart_move_p(dest.map)
		return false;
	}

	log("deep_smart_move: UNABLE TO RESOLVE", "red");
	return false;
}

export function get_position(name) {
	state.p_lead_pos = undefined;
	send_cm(name, {type: "send_coords"});
}

export function do_common_routine() {
	recover_hp_or_mp();
	loot();
} 

function init() {
	for(let i in PERSIST_STATE_VARS) {
		let varn = PERSIST_STATE_VARS[i];
		let val = get(character.name + ":"+varn);
		if (val !== null && val !== undefined) {
			state[varn] = val;
		}
	}

	global.on_party_invite = on_party_invite;
	global.state = state;

	setInterval(function() {
		if (character.name != MERCHANT || state.task != "mule") {
			return;
		}

		for(let i in PARTY_MEMBERS) {
			var e = get_player(PARTY_MEMBERS[i]);
			if (e && e.name != MERCHANT) {
				send_cm(e.name, {type: "send_loot"});
			}
		}

	}, 2000);


	character.on("cm",function(m) {
		if (!is_friendly(m.name)){
			return
		}
		switch(m.message.type) {
			case "send_coords":
				log(m);
				send_cm(m.name, {type: "coords", pos: { x: character.x, y: character.y, map: character.map, dist: 5}});
				break;
			case "coords":
				state.p_lead_pos = m.message.pos;
				state.smart_result = undefined;
				break;
			case "gear_up":
				log(JSON.stringify(m.message));
				if (m.name != MERCHANT) {
					return;
				}
				for(let i=0; i < character.items.length; i++) {
					let item = character.items[i];
					if(!item) {
						continue;
					}
					var found_item = false;
					if (item.name == m.message.gear.name && item.level == m.message.gear.level) {
						log("equipped")
						equip(i, m.message.gear.slot);
						found_item = true;
						break;
					}
					if(!found_item) {
					}
				}
				break;
			case "send_loot":
				if (m.name != MERCHANT) {
					log("ignoring give_loot message from " + m.name);
					return;
				}
				if (character.gold > 50000) {
					send_gold(MERCHANT, character.gold);
					return;
				}
				for(let i = 0; i < character.items.length; i++) {
					var item = character.items[i];
					if (!item) {
						continue
					}
					let is_hpot = item.name.indexOf("hpot") == 0;
					let is_mpot = item.name.indexOf("mpot") == 0;
					if (!is_hpot && !is_mpot) {
						log("sending " + item.name);
						send_item(MERCHANT, i, item.q);
						return;
					}
				}
				break;
			default: 
				log("ON_CM: bad message", "yellow");
		}
	});

	if (PARTY_LEAD == character.name) {
		var ac = get_active_characters();
		for(let i in PARTY_MEMBERS) {
			var p = PARTY_MEMBERS[i] 
			if (p != PARTY_LEAD && p != MERCHANT) {
				log("starting up " + p);
				start_character(p);
			}
		}
	}
}

export function is_inventory_full() {
	var inven_space = character.items.length
	var used_inven_space = 0;
	for(let i in character.items) {
		if (character.items[i]) {
			used_inven_space++;
		}
	}
	return used_inven_space == inven_space;
}

export function is_inventory_empty() {
	var used_inven_space = 0;
	for(let i in character.items) {
		if (character.items[i]) {
			used_inven_space++;
		}
	}
	return used_inven_space == 0;
}

init();