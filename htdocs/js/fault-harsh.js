var myapp = angular.module('fault', ['ngModal', 'ngCookies', 'ngIdle']);

myapp.controller('tableCtrl', ["$scope", "$http", "$timeout", "$location", "Idle", "Keepalive", "$cookieStore", "$window",  function ($scope, $http,  $timeout, $location, Idle, Keepalive, $cookieStore, $window) {

    $scope.data_Loading = false;
    $scope.nodata = false;
    $scope.tableTitle = tableTitle;
    var url = $location.absUrl().split('?')[0];
    $scope.url = url;
    $cookieStore.remove("url"); 

    

    // Initialization code for the page.  Get the row definitions fot this page.
    $http.get(jsonUrl).then(function (response) {

        $scope.rowDef = response.data;
        $cookieStore.put('url', $scope.url);
        
        for (var row = 0; row < $scope.rowDef.length; row++) {
            if ($scope.rowDef[row].Signal != '') {
                // This is an element.  Capture all of its info for future use.
                $scope.rowDef[row].title = response.data[row].Signal;
                $scope.rowDef[row].titleStyle = '';

                // The data will be retrieved from the server json.
                $scope.rowDef[row].dataRaw = "";
                $scope.rowDef[row].dataFmtd = "";
                $scope.rowDef[row].name = "";
                $scope.rowDef[row].high_1 = "";
                $scope.rowDef[row].low_1 = "";
                $scope.rowDef[row].high_2 = "";
                $scope.rowDef[row].low_2 = "";
                $scope.rowDef[row].high_3 = "";
                $scope.rowDef[row].low_3 = "";

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
        // Build a request string used to GET the element data values from the server.
        $scope.elementDataUrl = "http://localhost:2001/mbs/?m=0&t=h&r=";
        for (var i= 315; i <= 320; i++)
        {
            $scope.elementDataUrl = $scope.elementDataUrl + i + ',';
        }   
        $scope.elementTimer($scope.elementDataUrl);
        // Issue the first (and maybe only) request for fdata values.
        //$scope.elementGetValues($scope.elementDataUrl);
    });
    
    $scope.elementGetValues = function () {
        $http.get($scope.elementDataUrl).then(function (response) {
            $scope.elementValues = response.data;
            $scope.elementTimer($scope.elementDataUrl);
            $scope.elementDataSet = true;
            if(response.data.error == "Connection timed out"){
                $scope.data_Loading = true;
            }
            for (var respIdx = 0; respIdx < response.data.length; respIdx++) {
                var addr = response.data[respIdx].data;
                for (var row = 0; row < $scope.rowDef.length; row++) {
                    var Address = $scope.rowDef[row].Address;
                    if (addr == Address) {
                        var signalname = $scope.rowDef[row].Signal;
                        $scope.rowDef[row].name = signalname;
                        respIdx++;
                        var dataRaw = response.data[respIdx].data;
                        $scope.rowDef[row].dataFmtd = $scope.formatElement(row, dataRaw);
                        
                        respIdx++;
                        var dataRaw = response.data[respIdx].data;
                        $scope.rowDef[row].dataRaw = $scope.datetime(dataRaw);
                        var high_1 = (($scope.rowDef[row].dataRaw >> 8) & 0xff);
                        var low_1 = $scope.rowDef[row].dataRaw & 0xff;
                        $scope.rowDef[row].high_1 = high_1;
                        $scope.rowDef[row].low_1 = low_1;
                        respIdx++;

                        var dataRaw = response.data[respIdx].data;
                        $scope.rowDef[row].dataRaw1 = $scope.datetime(dataRaw);
                        var high_2 = (($scope.rowDef[row].dataRaw1 >> 8) & 0xff);
                        var low_2 = $scope.rowDef[row].dataRaw1 & 0xff;
                        $scope.rowDef[row].high_2 = high_2;
                        $scope.rowDef[row].low_2 = low_2;
                        respIdx++;

                        var dataRaw = response.data[respIdx].data;
                        $scope.rowDef[row].dataRaw2 = $scope.datetime(dataRaw);
                        var high_3 = (($scope.rowDef[row].dataRaw2 >> 8) & 0xff);
                        var low_3 = $scope.rowDef[row].dataRaw2 & 0xff;
                        $scope.rowDef[row].high_3 = high_3;
                        $scope.rowDef[row].low_3 = low_3 % 100;
                        $scope.data_Loading = true;
                        $scope.nodata = true;
                        break;
                    }
                    
                }            
            }
        });
    };

    // Convert the raw element value into a formatted string.
    $scope.formatElement = function (row, dataRaw) {
        var dataFmtd = window[$scope.rowDef[row].rangeName]('format', dataRaw, $scope.rowDef[row]);
        return dataFmtd;
    };
    $scope.datetime = function (dataRaw) {
        var dataRaw = dataRaw;
        return dataRaw;
    };

    $scope.elementTimer = function () {
        $scope.elementGetValues();
    };
    
    $scope.show_login = function () {
        $scope.show_login.show = true;
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
    return IdleProvider.idle(2500);
});
myapp.run(['$rootScope', '$location', '$cookieStore', '$http', 'Idle', '$window', 
    function ($rootScope, $location, $cookieStore, $http, Idle, $window) {
        // keep user logged in after page refresh
        $window.onbeforeunload = function() {
            // Clearing all cookies now!
            $cookieStore.remove("globals"); 
        };
        Idle.watch();
}]);