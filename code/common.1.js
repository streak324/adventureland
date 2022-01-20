var hp_potion_threshold=0.80;

var party_heal_threshold=0.90;

var party_members=["TrogWarrior1", "TrogMage1", "TrogPriest1"];
var msearch = {};

function do_tank_role(attack_mode) {
	recover_hp_or_mp();
	loot();

	if (character.party != undefined && !is_friendly(character.party)) {
		leave_party();
	}
	for (let i = 0; i < party_members.length; i++) {
		//say(party_members[i]);
		var c = get_entity(party_members[i]);
		if (c != undefined && c.party == undefined && c.name != character.name) {
			send_party_invite(c.name);
		}
	}

	if(!attack_mode || character.rip || is_moving(character)) return;

	var target=get_targeted_monster();
	if(!target)
	{
		target=get_nearest_monster(msearch);
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
		// Walk half the distance
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
}

function set_msearch(_msearch) {
	msearch = _msearch;	
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

function do_dps_role() {
	recover_hp_or_mp();
	loot();
	if (character.party == undefined) return;
	var leader = get_player(character.party);
	if (leader != undefined) {
		follow(leader);
		attack_leaders_target(leader)
	}
}

function do_heal_role() {
	recover_hp_or_mp();
	loot();
	if (character.party == undefined) return;
	var party = get_party();
	for (var p in party) {
		var pl = get_player(p);
		if (pl == undefined ) continue;
		if (pl.name == character.party) {
			follow(pl);
		};
		var hp_perc = pl.hp / pl.max_hp;
		var hp_diff = pl.max_hp - pl.hp;
		if (!is_on_cooldown("heal") && (hp_perc < party_heal_threshold || hp_diff > character.attack)) {
			heal(pl);
		}
	}

}

function recover_hp_or_mp() {
	if(!is_on_cooldown("use_mp") && character.max_mp - character.mp > 100) {
		use_skill('use_mp');
	}
	var hp = character.hp / character.max_hp;
	if(!is_on_cooldown("use_hp") && hp < hp_potion_threshold) {
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

function follow(pl) {
	var dsq = dist_sq(pl, character)
	const max_dist = 3;
	//set_message(dsq);
	if (dsq > max_dist * max_dist) {
		move(
			character.x+(pl.x-character.x)/3,
			character.y+(pl.y-character.y)/3
		);
	}
}

function is_friendly(name) {
	return party_members.indexOf(name) > -1;
}