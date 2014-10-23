var plotWidth = 1000;
var plotHeight = 800;
var nameOffset = 200;
var axisWidth = 100;

$('load').click(function(){
	loadData
})

loadData = function(csv_file){
	d3.text(csv_file, function(updata){
		data = d3.csv.parseRows(updata)
		
		
		
	})//end of d3.load
};//end of load data

