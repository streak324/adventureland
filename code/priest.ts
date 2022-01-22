import { do_common_routine, follow} from "./1/common"

const PARTY_HEAL_THRESHOLD=0.90;

setInterval(function() {
	do_common_routine();
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
		if (!is_on_cooldown("heal") && (hp_perc < PARTY_HEAL_THRESHOLD || hp_diff > character.attack)) {
			heal(pl);
		}
	}
}, 1000/5);