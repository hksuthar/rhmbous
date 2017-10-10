var myapp = angular.module('slider', ['ngModal', 'ngIdle']);


myapp.controller('database', ["$scope", "$http", "$timeout", "$location", function ($scope, $http, $timeout, $location) {

    $http.get(jsonUrl_reg).then(function (response) {
        $scope.regdef = response.data;
        $scope.elementDataUrlregdef = "http://localhost:2001/mbs/?m=0&t=h&r=";
        for (var row = 0; row < $scope.regdef.length; row++) {
            $scope.regdef[row].Address = response.data[row].Address;
            $scope.elementDataUrlregdef = $scope.elementDataUrlregdef + $scope.regdef[row].Address + ',';
        }
        //console.log($scope.elementDataUrlregdef);
        $scope.elementTimer_database($scope.elementDataUrlregdef);
    });
    $scope.regdef_fun = function () {
        $http.get($scope.elementDataUrlregdef).then(function (response) {
            $scope.elementValues_database = response.data;
            console.log($scope.elementValues_database);
            $scope.elementTimer_database($scope.elementDataUrlregdef); 
        });
    };
    $scope.elementTimer_database = function () {
        $scope.regdef_fun();
        // Reschedule the next update if this is a status screen.
        if (statusScreen) {
            $timeout($scope.elementTimer_database, 1000);
        }
    }; 

}]);