var dex = [];
var timer = "";

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

	$("#filter-gen").append('<option value="all">Todas las generaciones</option>');	

	do {
		cuenta = dex.filter(v => {return v.gen == gen});
		if (cuenta.length > 0) {
			$("#filter-gen").append('<option value="' + gen + '">GEN ' + gen + ' (' + cuenta.length + ')</option>');
		};
		gen++;

	} while (cuenta.length > 0);

	// Especial
	// starters - legendarios - singulares - ultraentes

}

function preloadDex(db, parent = "#pkmn-list-container") {

	// separar la db en chunks para no bloquear la pagina
    var chunk = 100;
    var index = 0;

    function doChunk() {
        var cnt = chunk;
        while (cnt-- && index < db.length) {
            // process array[index] here
			$(parent).append('<li class="pkmn-card" data-pkmnid="' + db[index].id + '"></li>');
			$(parent).find(".pkmn-card").eq(index).append('<img src="' + getIMG(db[index].id, "small", db[index].variant) + '" alt="' + db[index].name + '">');
			$(parent).find(".pkmn-card").eq(index).append('<span class="pkmn-number pkmn-gen' + db[index].gen + ' ">#' + db[index].id + '</span>');
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
	clearTimeout(timer);

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

	// Ocultar variantes
	if (especial != "megaevo" && especial != "regional") {
		tempDex = tempDex.filter(v => {return v.variant == 1});
	}
	


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
	preloadDex(tempDex);
};

function cargarVariant(id) {
	// Cargar solo las variantes
	var variant = dex.filter(v => {return v.id == id});
	$("#popup-card-container").html('');
	$("#popup-navigation-container").html('');

	// Si hay más de uno dibujar botones
	if (variant.length > 1) {
		for (i = 0; i < variant.length; i++) {
			$("#popup-navigation-container").append('<div class="pkmn-variant" data-variant="' + variant[i].variant + '">' + variant[i].variant + '</div>');
		};

		$(".pkmn-variant").eq(0).addClass("active");
	};

	preloadDex(variant, "#popup-card-container");

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


$(function() {
	$("#button-up").click(function() {
		window.scrollTo(0, 0);
	});

	$("select").change(function() {
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
