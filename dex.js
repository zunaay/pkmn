var pokedex = [];
var timer = "";

$(document).ready(function() {
	$.get("data/national.json", pkdx => {
		pokedex = pkdx;
		fillSelect();
    	cargarDex();
	});
});

// rellenar selects
function fillSelect() {

	// Generación
	var cuenta = "";
	var gen = 1;

	//$("#filter-gen").append('<option value="all">Todas las generaciones</option>');	

	do {
		cuenta = pokedex.filter(v => {return v.gen == gen});
		if (cuenta.length > 0) {
			$("#filter-gen").append('<option value="' + gen + '">GEN ' + gen + ' (' + cuenta.length + ')</option>');
		};
		gen++;

	} while (cuenta.length > 0);
	$("#filter-gen").val(gen - 2); // Cargar solo última gen

	// Especial
	// starters - legendarios - singulares - ultraentes

}

function preloadDex(db, parent = "#pkmn-list-container", size = "small") {

	// separar la db en chunks para no bloquear la pagina
    var chunk = 100;
    var index = 0;

    function doChunk() {
        var cnt = chunk;
        while (cnt-- && index < db.length) {

			// La numeración cambia segun la pokedex
			var gen = $("#filter-gen").val();
			var num = db[index].id;

			if (gen.includes("r-")) {
				var region = gen.replace("r-","");
				num = String(db[index][region]);
				if (num > 9 && num < 100) num = "0" + num;
				if (num < 10) num = "00" + num;
			};
			
            // process array[index] here
			$(parent).append('<li class="pkmn-card" data-pkmnid="' + db[index].id + '"></li>');

			$(parent).find(".pkmn-card").eq(index).append('<img src="' + getIMG(db[index].id, size, db[index].variant) + '" alt="' + db[index].name + '">');
			$(parent).find(".pkmn-card").eq(index).append('<span class="pkmn-number pkmn-gen' + db[index].gen + ' ">#' + num + '</span>');
			$(parent).find(".pkmn-card").eq(index).append('<span class="pkmn-name" title="' + db[index].name + '">' + db[index].name + '</span>');
			$(parent).find(".pkmn-card").eq(index).append('<div class="pkmn-type"></div>');
			for (t = 0; t < db[index].type.length; t++) {
				$(parent).find(".pkmn-card .pkmn-type").eq(index).append('<span class="pill background-color-' + db[index].type[t] + '"></span>');
			};

            ++index;
        }
        if (index < db.length) {
            // set Timeout for async iteration
            timer = setTimeout(doChunk, 5);
        }
    }

	doChunk();
}


function cargarDex() {

	/*
		PROBLEMAS
		-- dex regional: paldea - tauros de paldea
	*/

	clearTimeout(timer);

	const [gen, buscador, tipo, orden, especial] = getFiltros();

	var tempDex = [];
	for (x = 0; x < pokedex.length; x++) {tempDex.push(pokedex[x])};


	// Filtrar por tipos
	if (tipo != "all") {
		tempDex = tempDex.filter(v => {return v.type[0] == tipo});

		var temp = pokedex.filter(v => {return v.type[1] == tipo});
		tempDex = tempDex.concat(temp);

	};


	// Filtrar por generacion
	if (gen != "national") {
		if (gen.includes("r-")) {
			//Filtrar por región
			var region = gen.replace("r-","");
			tempDex = tempDex.filter(v => {return v[region] != null});

		} else {
			//Filtrar por generacion
			tempDex = tempDex.filter(v => {return v.gen == parseInt(gen)});
		};
	};

	// Filtro especial
	
	if (especial != "all") {
		if (especial == "starter" && gen.includes("r-")) {
			var region = gen.replace("r-","");
			tempDex = tempDex.filter(v => {return v.special == especial && v[region] < 8 });
		} else {
			tempDex = tempDex.filter(v => {return v.special == especial});
		};
	};

	// input
	if (buscador != "") {
		var nombre = normalize(buscador).toLowerCase();
		tempDex = tempDex.filter(v => {return (normalize(v.name).toLowerCase()).includes(nombre)});
	};

	// Ocultar variantes
	if (gen.includes("r-") && especial == "all") {
		// se filtra por region

		// No mostrar megaevoluciones
		tempDex = tempDex.filter(v => {return v.special != "megaevo"});

		// Solo mostrar variaciones regionales
		var region = gen.replace("r-","");

		tempDex = tempDex.filter(v => {
			if ((v.name).toLowerCase().includes(region) && v.special == "regional") {
				return (v.name).toLowerCase().includes(region) && v.special == "regional";
			} else {
				// Ocultar formas originales si existen regionales
				try {
					if (v.variant == 1 && !(v.regional).includes(region)) {
						return (v.variant == 1);
					} else {
						if (v.name.includes(region)) {
							// Kanto, Hoenn, Johto
							return v.variant == 1;

						} else {
							// Centro, Montaña etc
							var padre = $("#filter-gen option:selected").attr("data-parent");
							return (v.name.includes(padre));

						}
					};
				} catch (error) {
					return (v.variant == 1);
				};
			};
			 
		});

	} else if (especial != "megaevo" && especial != "regional" && especial != "gigamax" && !gen.includes("r-")) {
		tempDex = tempDex.filter(v => {return v.variant == 1});

	};
	


	// Ordenar
	switch (orden) {
		case "oldest":
			tempDex.sort((a, b) => {
				if (gen.includes("r-")) {
					// Ordenar por región
					var region = gen.replace("r-","");
					const nameA = a[region];
					const nameB = b[region];
					if (nameA < nameB) { return -1; }
					if (nameA > nameB) { return 1; }
					return 0; // iguales
				} else {
					// Ordenar por generacion
					const nameA = a.id;
					const nameB = b.id;
					if (nameA < nameB) { return -1; }
					if (nameA > nameB) { return 1; }
					return 0; // iguales
				};				
			});
			break;

		case "newest":
			tempDex.sort((a, b) => {

				if (gen.includes("r-")) {
					// Ordenar por región
					var region = gen.replace("r-","");
					const nameA = a[region];
					const nameB = b[region];
					if (nameA < nameB) { return 1; }
					if (nameA > nameB) { return -1; }
					return 0; // iguales
				} else {
					// Ordenar por generacion
					const nameA = a.id;
					const nameB = b.id;
					if (nameA < nameB) { return 1; }
					if (nameA > nameB) { return -1; }
					return 0; // iguales
				};		
			});
			break;

		case "az":
			tempDex.sort((a, b) => {
				const nameA = a.name.toUpperCase();
				const nameB = b.name.toUpperCase();
				if (nameA < nameB) { return -1; }
				if (nameA > nameB) { return 1; }
				return 0; // iguales
			});
			break;

		case "za":
			tempDex.sort((a, b) => {
				const nameA = a.name.toUpperCase();
				const nameB = b.name.toUpperCase();
				if (nameA < nameB) { return 1; }
				if (nameA > nameB) { return -1; }
				return 0; // iguales
			});
			break;
	};

	$("#pkmn-list-container").html("");
	preloadDex(tempDex);
};

function cargarVariant(id) {
	// Cargar solo las variantes
	var variant = pokedex.filter(v => {return v.id == id});
	$("#popup-card-container").html('');
	$("#popup-navigation-container").html('');

	// En pokedex regional, no mostrar variaciones de otras regiones
	var region = $("#filter-gen").val();
	if (region.includes("r-")) {
		region = region.replace("r-", "");
		variant = variant.filter(v => {return v[region] != null});
	}

	// Si hay más de uno dibujar botones
	if (variant.length > 1) {
		for (i = 0; i < variant.length; i++) {
			$("#popup-navigation-container").append('<div class="pkmn-variant" data-variant="' + variant[i].variant + '">' + variant[i].variant + '</div>');
		};

		$(".pkmn-variant").eq(0).addClass("active");
	};

	preloadDex(variant, "#popup-card-container", "full");

	$("#popup-card-container .pkmn-card").eq(0).addClass("active");
};

function changeMobileCard(n) {
	// clean actives
	$("#popup-navigation-container .pkmn-variant.active").removeClass("active");
	$("#popup-card-container .pkmn-card.active").removeClass("active");

	// set new actives
	$("#popup-navigation-container .pkmn-variant").eq(n).addClass("active");
	$("#popup-card-container .pkmn-card").eq(n).addClass("active");
}


function changeOptionDisplayName() {

	// remove parent names
	$("#filter-gen").find(".opt-child").each(function(){
		var padre = $(this).attr("data-parent");
		var nombre = $(this).text();
		nombre = nombre.replace(padre, "");
		$(this).text(nombre);
	});
	
	// set new display name if necessary
	try {
		var clase = $("#filter-gen").find("option:selected").attr("class");	
		if (clase.includes("opt-child")) {
			var padre = $("#filter-gen").find("option:selected").attr("data-parent");	
			var nombre = $("#filter-gen").find("option:selected").text();
			$("#filter-gen").find("option:selected").text(padre + nombre);
		}
	} catch (error) {}

}

$(function() {
	$("#button-up").click(function() {
		window.scrollTo(0, 0);
	});

	$("select").change(function() {
		// change display name on first filter if necessary
		var filtro = $(this).attr("id");
		if (filtro.includes("filter-gen")) {
			changeOptionDisplayName();
		}

		// load pokedex
		cargarDex();
	});

	$("input").on("input", function() {
		cargarDex();
	});

	$("#pkmn-list-container").on("click", ".pkmn-card", function(){
		var num = $(this).attr("data-pkmnid");
		cargarVariant(num);
		$("#popup-bg").fadeIn(100);
	});

	$("#popup-bg").click(function() {
		$(this).fadeOut(100);
	});

	$("#popup-card-container").on("click", ".pkmn-card", function(event) {
		event.stopPropagation();
	});

	$("#popup-navigation-container").on("click", ".pkmn-variant", function(event) {
		event.stopPropagation();
		var num = parseInt( $(this).attr("data-variant") ) - 1;
		changeMobileCard(num);
	});


	// MOBILE SETTINGS
	$("#show-filters").click(function() {
		$("form").show();
		$("body").css("overflow", "hidden");
	});

	$("#hide-filters").click(function() {
		$("form").hide();
		$("body").css("overflow", "auto");
	})
	
});


function getFiltros() {
	var a = $("#filter-gen").val();
	var b = $("#filter-name").val();
	var c = $("#filter-type1").val();
	var d = $("#filter-order").val();
	var e = $("#filter-special").val();

	return [a, b, c, d, e];
}

function getIMG(num, size, variant) {

	num = parseInt(num);
	var imgId = "";
	(num < 10) ? imgId = "00" + num : (num < 100) ? imgId = "0" + num : imgId = num;
	
	var enlace = "https://assets.pokemon.com/assets/cms2/img/pokedex/";
	size == "small" ? enlace += "detail/" : enlace += "full/";
	variant == 1 ? enlace += imgId + ".png" : enlace += imgId + "_f" + variant + ".png";

	return enlace;
};


var normalize = (function() {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
        to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
        mapping = {};
   
    for(var i = 0, j = from.length; i < j; i++ )
        mapping[ from.charAt( i ) ] = to.charAt( i );
   
    return function( str ) {
        var ret = [];
        for( var i = 0, j = str.length; i < j; i++ ) {
            var c = str.charAt( i );
            if( mapping.hasOwnProperty( str.charAt( i ) ) )
                ret.push( mapping[ c ] );
            else
                ret.push( c );
        }      
        return ret.join( '' );
    }
})();
