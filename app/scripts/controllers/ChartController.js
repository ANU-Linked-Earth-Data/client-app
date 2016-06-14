'use strict';

/*Sourced from https://github.com/ANU-WALD/aus-env/ */

angular.module('LEDApp')
    .controller('ChartController', function($scope, SearchService){

        var self = this;

        $scope.$on('onSelectRegion', function(event, cell){
            self.performQueryLimitLocation(cell);
        });

        self.performQueryLimitLocation = function (cell) {
            SearchService.performQueryLimitLocation(cell).then(function(data){
                var observations = data.results.bindings;
                var labels = [];
                var values = [];

                for (var i in observations){
                    labels.push((moment(observations[i].timePeriod.value).format("DD/MM/YY, h:mm:ss a")));
                    values.push(Number(observations[i].value.value).toFixed(2));    //Display value to 2 decimal places
                }

                $scope.data = [values];
                $scope.labels = labels;
            });
        };

        /* $scope.bar = {
            title:"Test Chart",
            description:"Test Chart description",
            units: "m",
            originalUnits: "ft",
            download: null
        };

        $scope.barLabels = ['# of Votes'];
        $scope.barSeries = ['# of votes'];
        $scope.barColors = [{fillColor:["#66987F"]}];
        $scope.barData =  [12, 19, 3, 5, 2, 3];



        //$scope.selection = selection;

        $scope.origViewOptions = [
            {
                style:'bar',
                icon:'fa-bar-chart',
                tooltip:'Annual time series',
            },
            {
                style:'pie',
                icon:'fa-pie-chart',
                tooltip:'Proportion by land cover type',
            }//,
//      {
//        style:'timeseries',
//        icon:'fa-line-chart',
//        tooltip:'Detailed time series'
//      }
        ]; */

        $scope.barOptions =  {
            // Sets the chart to be responsive
            responsive: true,

            //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
            scaleBeginAtZero : false,

            //Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines : true,

            //String - Colour of the grid lines
            scaleGridLineColor : "rgba(255,255,255,.5)",

            //Number - Width of the grid lines
            scaleGridLineWidth : 1,

            //Boolean - If there is a stroke on each bar
            barShowStroke : true,

            //Number - Pixel width of the bar stroke
            barStrokeWidth : 0.1,

            //Number - Spacing between each of the X value sets
            barValueSpacing : 2,

            //Number - Spacing between data sets within X values
            barDatasetSpacing : 1,

            scales: {
                xAxes: [{
                    display: false
                }]
            }
            //tooltipTemplate: $scope.tooltipTextFunction($scope.bar),

            //scaleLabel: "      <%=value%>"
        };

        $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
        $scope.series = ['Values'];

        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40]
        ];
    });
