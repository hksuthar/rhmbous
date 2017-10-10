var myapp = angular.module('slider', ['ngModal', 'ngIdle']);
myapp.controller('SliderController', function ($scope, $http, $interval, $window, $timeout, $location) {

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

        if ($scope.timedout) {
          $cookieStore.remove('globals');
          $cookieStore.remove('readonly');
          $scope.timedout.close();
          $scope.timedout = null;
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

});
myapp.directive('sglclick', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
          var fn = $parse(attr['sglclick']);
          var delay = 300, clicks = 0, timer = null;
          element.on('click', function (event) {
            clicks++;  //count clicks
            if(clicks === 1) {
              timer = setTimeout(function() {
                scope.$apply(function () {
                    fn(scope, { $event: event });
                }); 
                clicks = 0;             //after action performed, reset counter
              }, delay);
              } else {
                clearTimeout(timer);    //prevent single-click action
                clicks = 0;             //after action performed, reset counter
              }
          });
        }
    };
}])

myapp.controller('tableCtrl', ["$scope", "$http", "$timeout", "$location", "Idle", "Keepalive", "$window", function ($scope, $http, $timeout, $location, Idle, Keepalive, $window) {

    $scope.data_Loading = false;
    $scope.tableTitle = tableTitle;
    var url = $location.absUrl().split('?')[0];
    $scope.url = url;

	$scope.left_top = "Battery"; //Battery,Solar`
	$scope.left_top_Address = 270;
	$scope.left_top_DC_Current = 271;
	$scope.left_top_Description = "Battery";
	
	$scope.left_bottom = "Solar"; //Battery,Solar
	$scope.left_bottom_Address = 276;
	$scope.left_bottom_DC_Current = 277;
	$scope.left_bottom_Description = "Solar";
	
	$scope.right_top = "Grid"; //Grid,Criticalload
	$scope.right_top_Address = 284;
	$scope.right_top_AC_Current = 277;
	$scope.right_top_Description = "Grid";

	$scope.right_bottom = "Criticalload"; //Grid,Criticalload
	$scope.right_bottom_Address = 291;
	$scope.right_bottom_AC_Current = 271;
	$scope.right_bottom_Description = "Critical Load";

	$scope.elementDataUrl_Current = "http://localhost:2001/mbs/?m=0&t=h&r=";
    $scope.elementDataUrl_left_top_DC_Current = $scope.elementDataUrl_Current + $scope.left_top_DC_Current;
	$http.get($scope.elementDataUrl_left_top_DC_Current).then(function (response) {
		$scope.elementDataUrl_left_top_DC_Current = response.data;
	});
	$scope.elementDataUrl_left_bottom_DC_Current = $scope.elementDataUrl_Current + $scope.left_bottom_DC_Current;
	$http.get($scope.elementDataUrl_left_bottom_DC_Current).then(function (response) {
	    	$scope.elementDataUrl_left_bottom_DC_Current = response.data;
	});
	$scope.elementDataUrl_right_top_AC_Current = $scope.elementDataUrl_Current + $scope.right_top_AC_Current;
	$http.get($scope.elementDataUrl_right_top_AC_Current).then(function (response) {
		$scope.elementDataUrl_right_top_AC_Current = response.data;
	});
	$scope.elementDataUrl_right_bottom_AC_Current = $scope.elementDataUrl_Current + $scope.right_bottom_AC_Current;
	$http.get($scope.elementDataUrl_right_bottom_AC_Current).then(function (response) {
		$scope.elementDataUrl_right_bottom_AC_Current = response.data;
	});

	$scope.elementGetValues_left_top_DC = function () {
		$scope.elementDataUrl_left_top_DC_Current = $scope.elementDataUrl_Current + $scope.left_top_DC_Current;
		$http.get($scope.elementDataUrl_left_top_DC_Current).then(function (response) {
			$scope.elementDataUrl_left_top_DC_Current = response.data;
			$scope.Data_left_top_DC_Current = $scope.elementDataUrl_left_top_DC_Current;
		});
	}
	$scope.elementGetValues_left_bottom_DC = function () {
		$scope.elementDataUrl_left_bottom_DC_Current = $scope.elementDataUrl_Current + $scope.left_bottom_DC_Current;
		$http.get($scope.elementDataUrl_left_bottom_DC_Current).then(function (response) {
		    $scope.elementDataUrl_left_bottom_DC_Current = response.data;
			$scope.Data_left_bottom_DC_Current = $scope.elementDataUrl_left_bottom_DC_Current;
		});
	}
	$scope.elementGetValues_right_top_DC = function () {
		$scope.elementDataUrl_right_top_AC_Current = $scope.elementDataUrl_Current + $scope.right_top_AC_Current;
		$http.get($scope.elementDataUrl_right_top_AC_Current).then(function (response) {
			$scope.elementDataUrl_right_top_AC_Current = response.data;
			$scope.Data_right_top_AC_Current = $scope.elementDataUrl_right_top_AC_Current;
		});
	}
	$scope.elementGetValues_right_bottom_DC = function () {
		$scope.elementDataUrl_right_bottom_AC_Current = $scope.elementDataUrl_Current + $scope.right_bottom_AC_Current;
		$http.get($scope.elementDataUrl_right_bottom_AC_Current).then(function (response) {
			$scope.elementDataUrl_right_bottom_AC_Current = response.data;
			$scope.Data_right_bottom_AC_Current = $scope.elementDataUrl_right_bottom_AC_Current;
		});
	}

        // Initialization code for the page.  Get the row definitions fot this page.
        $http.get(jsonUrl).then(function (response) {

            $scope.rowDef = response.data;

            for (var row = 0; row < $scope.rowDef.length; row++) {
                if ($scope.rowDef[row].Signal != '') {
                    // This is an element.  Capture all of its info for future use.
                    $scope.rowDef[row].title = response.data[row].Signal;
                    $scope.rowDef[row].titleStyle = '';

                    // The data will be retrieved from the server json.
                    $scope.rowDef[row].dataRaw = 0;
                    $scope.rowDef[row].dataFmtd = "";

                    // Lack of a default value indicates this element cannot be set.
                    $scope.rowDef[row].changeHidden = $scope.rowDef[row].Default == '' ? 1 : 0;

                    // Get the range function for this element.
                    var range = $scope.rowDef[row].Range;
                    var re = /([a-zA-Z0-9_$]*)+\((.*)\)/;
                    var match = re.exec(range);
                    var rangeName = null, rangeArgs = null;
                    if (match != null) {
                        rangeName = match[1];
                        rangeArgs = match[2].split(',');
                    }
                    $scope.rowDef[row].rangeName = rangeName;
                    $scope.rowDef[row].rangeArgs = rangeArgs;

                }


            }
            $scope.rows = response.data.length;

            // Build a request string used to GET the element data values from the server.
            $scope.elementDataUrl = "http://localhost:2001/mbs/?m=0&t=h&r=";
            $scope.elementDataUrl = $scope.elementDataUrl + $scope.left_top_Address + ',' + $scope.left_bottom_Address + ',' + $scope.right_top_Address + ',' + $scope.right_bottom_Address ;
                
            // Issue the first (and maybe only) request for fdata values.
            $scope.elementTimer($scope.elementDataUrl);
        });
        
        // GET the element data values from the server.
        $scope.elementDataSet = false;
        $scope.elementGetValues = function () {
            $http.get($scope.elementDataUrl).then(function (response) {
                
                $scope.elementValues = response.data;
                $scope.elementTimer($scope.elementDataUrl);
                $scope.elementDataSet = true;
                // Set the formatted data dataRaws for each element.
                for (var respIdx = 0; respIdx < response.data.length; respIdx++) {
                    var addr = response.data[respIdx].addr;
                    // Find this address in the displayed rows.
                    for (var row = 0; row < $scope.rowDef.length; row++) {
                        var Address = $scope.rowDef[row].Address;
                        if (addr == Address) {
                            var dataRaw = response.data[respIdx].data;
                            $scope.rowDef[row].dataRaw = dataRaw;
                            $scope.rowDef[row].dataFmtd = $scope.formatElement(row, dataRaw);
                            $scope.data_Loading = true;
                        }
                    }
                }
            });
        };

        // Periodic update function.
        $scope.elementTimer = function () {
            $scope.elementGetValues();
    	    $scope.elementGetValues_left_top_DC();
    	    $scope.elementGetValues_left_bottom_DC();
    	    $scope.elementGetValues_right_top_DC();
    	    $scope.elementGetValues_right_bottom_DC();
            $scope.data_Loading = true;
            
            // Reschedule the next update if this is a status screen.
            if (statusScreen) {
                $timeout($scope.elementTimer, 1000);
            }
        };

        // Convert the raw element value into a formatted string.
        $scope.formatElement = function (row, dataRaw) {
            var dataFmtd = window[$scope.rowDef[row].rangeName]('format', dataRaw, $scope.rowDef[row]);
            return dataFmtd;
        };
        
        $scope.started = false;
        function closeModals() {
            if ($scope.warning) {
              $scope.warning.close();
              $scope.warning = null;
            }

            if ($scope.timedout) {
              $cookieStore.remove('globals');
              $cookieStore.remove('readonly');
              $scope.timedout.close();
              $scope.timedout = null;
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

            $scope.$on('IdleTimeout', function () {
                $window.location.href = 'blank.html';
            });
    }]);

myapp.config(function (ngModalDefaultsProvider, IdleProvider, KeepaliveProvider) {
    return IdleProvider.idle(240);
});
myapp.run(['$rootScope', '$location', '$http', 'Idle',
    function ($rootScope, $location, $http, Idle) {
        // keep user logged in after page refresh
        Idle.watch();
}]);
