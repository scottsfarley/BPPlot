
var plotWidth = 1000;
var curveHeight = 800;
var nameOffset = 150;
var axisWidth = 100;
var PlotHeight  = nameOffset + curveHeight;
var data = {}
var names = {}
var ids = []
var depths = {}
var depthMinMax = [10000, 0]
var active_taxa = []
var depthScale;
divWidth = $('#plot').width()
plotWidth  = divWidth - 200;
console.log(plotWidth)

function setupSVG(height, width){
	svg = d3.select('#plot').append('svg')
		.attr('height', height)
		.attr('width', width)
	return svg
}

depthSVG = setupSVG(curveHeight, axisWidth).attr('id', 'depthAxisSvg')
chronSVG = setupSVG(curveHeight, axisWidth)
plotSVG = setupSVG(curveHeight, plotWidth)

function getDepths(data){
	depths = []
	for (i in data){ //loops over multiple sets from different csvs
		set = data[i]
		x = 1
		while (x < data[i].length){ //loops over levels in each csv
			depth = +set[x][0]
			depths.push(depth)
			x+=1
		}
	}
	return depths
}
function getChronology(data){
	chron = []
	for (i in data){
		chron.push(data[i][1]) // assumes that chronology is always in column 1
	}
	return chron
}

$('#load').click(function(){
	csv_file = $('#csv').val()
	loadData(csv_file)
})

function loadData(csv){
	d3.text(csv, function(updata){
		d = d3.csv.parseRows(updata)
		data[csv] = d
		csv_names = []
		
		//check out the depths in the dataset...if there is a new range, adjust it to include the max 
		fileDepths = getDepths(data)
		if (d3.max(fileDepths) > depthMinMax[1]){
			depthMinMax[1] = d3.max(fileDepths)
		}
		if(d3.min(fileDepths) < depthMinMax[0]){
			depthMinMax[0] = d3.min(fileDepths)
		}
		depthScale = d3.scale.linear()
			.domain([depthMinMax[0], depthMinMax[1]])
			.range([nameOffset, curveHeight])
		var depthAxis = d3.svg.axis()
			.scale(depthScale)
			.orient('left')
		var depth = d3.select('#depthAxisSvg').append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(75, 0)')
			.call(depthAxis)
		
		//find names
		for (i in data[csv][0]){
			name = data[csv][0][i].trim()
			csv_names.push(name)
			id = name.replace(/\s/g, '_')
			ids.push(id)
		}
		names[csv] = csv_names
		$('#controls').append($('<div id="' + csv + '"></div>'))
		id = '#' + csv.replace(".", "\\.")
		$(id).append('<div class="page-header">File: ' + csv + '</div>')
		for (i in csv_names){
			n = csv_names[i]
			div = $('<div class="selectiondiv" id="' + n + '_div"></div>')
			i = $('<input type="checkbox" name="' + n + '"/>')
			$(i).data('file', csv)
			lab = $('<label for="' + n + '">' + n + '</label>')
			div.append(i)
			div.append(lab)
			i.on('click', dispatch)
			$(id).append(div) // append the name to the csv's div
		}
	})
}

function getValues(dataset, name){ //get the values for a certain taxon 
	taxon = []
	index = names[dataset].indexOf(name)
	for (level in data[dataset]){
		d = +data[dataset][level][index]
		taxon.push(d)
	}
	return taxon
}
		

function makePlot(at){ //the central graph loop
	var x_offset = 0;
	plot = plotSVG;
	for (t in at){
		datafile = at[t]['datafile']
		name = at[t]['Tname']
		getValues(datafile, name)
		top_label = plot.append('text')
			.attr('class', 'toplabel')
			.attr('x', x_offset)
			.attr('text-anchor', 'begin')
			.attr('y', nameOffset -10)
			.text(name)
	}
}

var dispatch = function(){
	var input = this
	if (input.checked){
		name = this.name
		f = $(this).data('file')
		taxon = {'datafile': f, 'Tname' : name}
		active_taxa.push(taxon)
		makePlot(active_taxa)
	}else{
		console.log('unchecked')
	}
}
