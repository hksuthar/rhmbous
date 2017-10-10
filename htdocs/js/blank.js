var myapp = angular.module('slider', ['ngModal']);
myapp.controller('database', ["$scope", "$http", "$timeout", "$location", function ($scope, $http, $timeout, $location) {

    $scope.regdef_fun = function (){
        $http.get(jsonUrl_reg).then(function (response) {
            $scope.regdef = response.data;
            $scope.elementDataUrlregdef = "http://localhost:2001/mbs/?m=0&t=r&r=";
            for (var row = 0; row < $scope.regdef.length; row++) {
                $scope.regdef[row].Address = response.data[row].Address;
                $scope.elementDataUrlregdef = $scope.elementDataUrlregdef + $scope.regdef[row].Address + ',';
            }
            $http.get($scope.elementDataUrlregdef).then(function (response1) {
                $scope.elementValues = response1.data;
                //$scope.regdef_fun($scope.elementDataUrlregdef);
                console.log($scope.elementValues);
                $timeout($scope.regdef_fun, 30000);     
            });
        }); 
    };
    $scope.regdef_fun(); 
}]);
