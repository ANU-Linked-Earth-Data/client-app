'use strict';

/*Sourced from https://github.com/ANU-WALD/aus-env/ */

angular.module('LEDApp')
    .controller('ChartController', function($scope){



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

        $scope.barOptions =  {
            // Sets the chart to be responsive
            responsive: true,

            //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
            scaleBeginAtZero : false,

            //Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines : true,

            //String - Colour of the grid lines
            scaleGridLineColor : "rgba(0,0,0,.05)",

            //Number - Width of the grid lines
            scaleGridLineWidth : 1,

            //Boolean - If there is a stroke on each bar
            barShowStroke : true,

            //Number - Pixel width of the bar stroke
            barStrokeWidth : 0.1,

            //Number - Spacing between each of the X value sets
            barValueSpacing : 2,

            //Number - Spacing between data sets within X values
            barDatasetSpacing : 1
            //tooltipTemplate: $scope.tooltipTextFunction($scope.bar),

            //scaleLabel: "      <%=value%>"
        };

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

        $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
        $scope.series = ['Series A', 'Series B'];

        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90]
        ];
    });
