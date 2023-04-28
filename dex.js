var dex = [];

$(document).ready(function() {
	const dx =  new XMLHttpRequest(); dx.open("GET", "data/db.json");dx.responseType = "json"; dx.send();
    dx.onload = function() { 
    	dex = dx.response;

    	fillSelect();
    	cargarDex();
	};
});

// rellenar selects
function fillSelect() {

	// Generación
	var cuenta = "";
	var gen = 1;

	do {
		cuenta = dex.filter(v => {return v.gen == gen});
		if (cuenta.length > 0) {
			$("#filter-gen").append('<option value="' + gen + '">GEN ' + gen + ' (' + cuenta.length + ')</option>');
		};
		gen++;

	} while (cuenta.length > 0);
	$("#filter-gen").append('<option value="all">Todas las generaciones</option>');

	// Especial
	// starters - legendarios - singulares - ultraentes

}


function cargarDex() {
	const [gen, buscador, tipo, orden, especial] = getFiltros();

	var tempDex = [];
	for (x = 0; x < dex.length; x++) {tempDex.push(dex[x])};


	// Filtrar por tipos
	if (tipo != "all") {
		tempDex = tempDex.filter(v => {return v.type[0] == tipo});

		var temp = dex.filter(v => {return v.type[1] == tipo});
		tempDex = tempDex.concat(temp);

	};


	// Filtrar por generacion
	if (gen != "all") {
		tempDex = tempDex.filter(v => {return v.gen == parseInt(gen)});
	};

	// Filtro especial
	if (especial != "all") {

		tempDex = tempDex.filter(v => {return v.special == especial});
	};

	// input
	if (buscador != "") {
		var nombre = normalize(buscador).toLowerCase();
		tempDex = tempDex.filter(v => {return (normalize(v.name).toLowerCase()).includes(nombre)});
	};


	// Ordenar
	switch (orden) {
		case "oldest":
			tempDex.sort((a, b) => {
				const nameA = a.id;
				const nameB = b.id;
				if (nameA < nameB) { return -1; }
				if (nameA > nameB) { return 1; }
				return 0; // iguales
			});
			break;

		case "newest":
			tempDex.sort((a, b) => {
				const nameA = a.id;
				const nameB = b.id;
				if (nameA < nameB) { return 1; }
				if (nameA > nameB) { return -1; }
				return 0; // iguales
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

	// Dibujar
	for (p = 0; p < tempDex.length; p++) {
		$("#pkmn-list-container").append('<li class="pkmn-card"></li>');
		$(".pkmn-card").eq(p).append('<img src="' + getIMG(tempDex[p].id, "small", tempDex[p].variant) + '" alt="' + tempDex[p].name + '">');
		$(".pkmn-card").eq(p).append('<span class="pkmn-number pkmn-gen' + tempDex[p].gen + ' ">#' + tempDex[p].id + '</span>');
		$(".pkmn-card").eq(p).append('<span class="pkmn-name" title="' + tempDex[p].name + '">' + tempDex[p].name + '</span>');
		$(".pkmn-card").eq(p).append('<div class="pkmn-type"></div>');
		for (t = 0; t < tempDex[p].type.length; t++) {
			$(".pkmn-card .pkmn-type").eq(p).append('<span class="pill background-color-' + tempDex[p].type[t] + '"></span>');
		};

	};
};


$(function() {
	$("#button-up").click(function() {
		window.scrollTo(0, 0);
	});

	$("select").change(function() {
		$("#pkmn-list-container").html("");
		$("#pkmn-list-container").append('<i class="fa-solid fa-spinner"></i>');
		cargarDex();
	});

	$("input").on("input", function() {
		$("#pkmn-list-container").html("");
		$("#pkmn-list-container").append('<i class="fa-solid fa-spinner"></i>');
		cargarDex();
	});

	
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
