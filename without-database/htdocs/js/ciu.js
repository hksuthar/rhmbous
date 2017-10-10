var myapp = angular.module('ciu', ['ngModal', 'ngIdle']);
myapp.controller('SecondCtrl', ["$scope", "$http", "$timeout", "$location", "Idle", "$window",  function ($scope, $http,  $timeout, $location, Idle, $window) {

    $scope.$on('IdleTimeout', function () {
        $scope.elementDataUrl_0_0 = "http://localhost:2001/mbs/?m=0&t=w&r=1024&d=124";
        return $http.get($scope.elementDataUrl_0_0).then(function (response) {
        	return $window.location.href = 'blank.html';
        });
    });

    $scope.started = false;
    function closeModals() {
	    if ($scope.warning) {
	      $scope.warning.close();
	      $scope.warning = null;
	    }
    }
      
	$scope.$on('IdleStart', function() {
		closeModals();
	});

	$scope.$on('IdleEnd', function() {
		closeModals();
	});

	$scope.start = function() {
		closeModals();
		Idle.watch();
		$scope.started = true;
	};

	$scope.stop = function() {
		closeModals();
		Idle.unwatch();
		$scope.started = false;
	};

}]);
myapp.config(function (ngModalDefaultsProvider, IdleProvider, KeepaliveProvider) {
    return IdleProvider.idle(240);
});
myapp.run(['$rootScope', '$location', '$http', 'Idle', '$window', 
    function ($rootScope, $location, $http, Idle, $window) {
        // keep user logged in after page refresh
        Idle.watch();
}]);
