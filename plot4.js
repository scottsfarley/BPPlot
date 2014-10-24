var plotWidth = 1000;
var curveHeight = 800;
var nameOffset = 150;
var axisWidth = 100;
var PlotHeight  = nameOffset + curveHeight;
var data = {}
var names = {}
var ids = []

function setupSVG(height, width){
	svg = d3.select('#plot').append('svg')
		.attr('height', height)
		.attr('width', width)
	return svg
}

depthSVG = setupSVG(curveHeight, axisWidth)
chronSVG = setupSVG(curveHeight, axisWidth)
plotSVG = setupSVG(curveHeight, plotWidth)

function getDepths(data){
	depths = []
	for (i in data){
		depths.push(data[i][0])
	}
	return depths
}
function getChronology(data){
	chron = []
	for (i in data){
		chron.push(daa[i][1]) // assumes that chronology is always in column 1
	}
	return chron
}

data = {}

$('#load').click(function(){
	csv_file = $('#csv').val()
	loadData(csv_file)
})

function loadData(csv){
	console.log(csv)
	d3.text(csv, function(updata){
		d = d3.csv.parseRows(updata)
		data[csv] = d
		csv_names = []
		for (i in data[csv][0]){
			name = data[csv][0][i].trim()
			csv_names.push(name)
			id = name.replace(/\s/g, '_')
			ids.push(id)
		}
		names[csv] = csv_names
		$('#controls').append('<div id="gulf5.csv" class="file-header">File: ' + csv + '</div>')
		id = '#' + csv.replace(".", "\\.")
		for (i in csv_names){
			n = csv_names[i]
			a = '<div><input type="checkbox" class="selectTaxon" name="' + n + '"/><label for="' + n + '">' + n + '</label></div>'
			$(id).append(a)
		}
	})
	
}

$('#show').click(function(){
	console.log(data)
})