angular.module('Authentication', []);
var app = angular.module('app', ['ngModal', 'ngKeypad', 'Authentication', 'ngRoute', 'ngCookies', 'ngIdle', 'ui.bootstrap', 'angularUtils.directives.dirPagination', 'slider']);

app.controller('tableCtrl_m1', ["$scope", "$http", "$timeout", "$location", "Idle", "Keepalive", "$uibModal", "$cookieStore", "$window",  function ($scope, $http,  $timeout, $location, Idle, Keepalive, $uibModal, $cookieStore, $window) {
    $scope.data_Loading = false;
    $scope.tableTitle = tableTitle;
    var url = $location.absUrl().split('?')[0];
    $scope.url = url;
    $cookieStore.remove("url"); 
    
    // Initialization code for the page.  Get the row definitions fot this page.
    $http.get(jsonUrl).then(function (response) {
    $scope.currentPage = 1;
    $scope.pageSize = 9;
    $scope.rowDef = response.data;
    $cookieStore.put('url', $scope.url);
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
                var rangeName = null; 
                var rangeArgs = null;
                if (match != null) {
                    rangeName = match[1];
                    rangeArgs = match[2].split(',');
                }
                $scope.rowDef[row].rangeName = rangeName;
                $scope.rowDef[row].rangeArgs = rangeArgs;

                // Get the scaling factor for this element.
                var scale = $scope.rowDef[row].Scaling;
                scale = parseFloat(scale);
                if (isNaN(scale))
                    scale = 1.0;
                $scope.rowDef[row].scale = scale;
                } else {
                    // If no signal name treat this as a title.
                    $scope.rowDef[row].title = $scope.rowDef[row].Address;
                    $scope.rowDef[row].titleStyle = {color: 'red', 'font-weight': 'bold', 'font-size': '20px'};
                    $scope.rowDef[row].changeHidden = 1;
                }
                if($scope.rowDef[row].Security == 'High')
                {
                    $scope.rowDef[row].Security = 127;
                }
                if($scope.rowDef[row].Security == 'Low')
                {
                    $scope.rowDef[row].Security = 125;
                }
                if($scope.rowDef[row].Security == 'Medium')
                {
                    $scope.rowDef[row].Security = 126;
                }

            }
               $scope.rows = response.data.length;

                // Build a request string used to GET the element data values from the server.
                $scope.elementDataUrl = "http://localhost:2001/mbs/?m=0&t=h&r=";
                    for (var respIdx = 0; respIdx < response.data.length; respIdx++) {
                        var addr = parseInt(response.data[respIdx].Address);
                        // Only add valid addresses to the request.
                        if (!isNaN(addr)) {
                            $scope.elementDataUrl = $scope.elementDataUrl + addr + ',';
                        }
                    }

            // Issue the first (and maybe only) request for fdata values.
            $scope.elementDataUrl_1024 = "http://localhost:2001/mbs/?m=0&t=h&r=1024";
            $http.get($scope.elementDataUrl_1024).then(function (response) {
                    $scope.elementValues1 = response.data;
                });
                $scope.elementTimer($scope.elementDataUrl);
            });
    
    // The change button has been pressed.
    $scope.changeElement = function (index) {
    $scope.modalData = $scope.rowDef[index];
        $scope.modalData.lowRaw = parseFloat($scope.rowDef[index].rangeArgs[0]);
        $scope.modalData.lowFmtd = $scope.formatElement(index, $scope.modalData.lowRaw);
        $scope.modalData.highRaw = parseFloat($scope.rowDef[index].rangeArgs[1]);
        $scope.modalData.highFmtd = $scope.formatElement(index, $scope.modalData.highRaw);
        $scope.modalData.newFmtd = '';
        $scope.modalData.oor = '';
        $scope.showModal();
    };
    $scope.show_login = function () {
        $scope.show_login.show = true;
    };

    // GET the element data values from the server.
    $scope.elementDataSet = false;
    $scope.elementGetValues = function () {

        $http.get($scope.elementDataUrl).then(function (response) {
            $scope.elementValues = response.data;
            $scope.elementDataSet = true;
            $scope.data_Loading = true;
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
                        
                        break;
                    }
                }
            }

        });
    };

    $scope.$on('IdleTimeout', function() {        
        closeModals();          
        $cookieStore.remove('globals');    
        $scope.elementDataUrl_0_0 = "http://localhost:2001/mbs/?m=0&t=w&r=1024&d=124";
        return $http.get($scope.elementDataUrl_0_0).then(function (response) {
        	return $window.location.href = 'index.html';
        });              
    });

    // Periodic update function.
    $scope.elementTimer = function () {
        $scope.elementGetValues();
        // Reschedule the next update if this is a status screen.
        if (statusScreen) {
            $timeout($scope.elementTimer, 1000);
        }
    };

    // Convert the raw element value into a formatted string.
    $scope.formatElement = function (row, dataRaw) {
        //console.log(dataRaw);
        var dataFmtd = window[$scope.rowDef[row].rangeName]('format', dataRaw, $scope.rowDef[row]);
        return dataFmtd;
    };

    // Called with the modal is closed.
    $scope.closeModal = function () {
        $scope.modalData.newRaw = parseFloat($scope.modalData.newFmtd);
    };

    // Calls to show or toggle the modal.
    $scope.showModal = function () {
        $scope.modalData.show = true;
    };
    $scope.toggleModal = function () {
       $scope.modalData.show = !$scope.modalData.show;
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
}]);


/*
    This controller handles all of the presses on the keypad.  It builds the user input string in $scope.modalData.newFmtd

    It will not allow an out of range value to be entered.
*/

app.controller('kpdController_m1', ['$scope', '$http', function kpdController_m1($scope, $http) {

    var vm = this;
    vm.decimal = false;
    vm.keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    vm.onKeyPressed = onKeyPressed;

    function onKeyPressed(data) {
        if (data == 'Enter') {
            $scope.modalData.newRaw = parseFloat($scope.modalData.newFmtd);
            if ($scope.modalData.newRaw < $scope.modalData.lowRaw || $scope.modalData.newRaw > $scope.modalData.highRaw) {
                $scope.modalData.newFmtd = "";
                $scope.modalData.oor = "red";
                vm.decimal = false;
            } else if ($scope.modalData.newFmtd.length != 0) {
        $scope.elementDataUrl = "http://localhost:2001/mbs/?m=0&t=w&r=";
        $scope.elementDataUrl = $scope.elementDataUrl + $scope.modalData.Address + '&d=' + $scope.modalData.newFmtd;
        $scope.elementTimer($http.get($scope.elementDataUrl));
        $scope.toggleModal();
            }
        }
        else if (data == "Cancel") {
            $scope.modalData.newFmtd = "";
            $scope.toggleModal();
        }
        else if (data == 'Clear') {
            $scope.modalData.newFmtd = "";
            $scope.modalData.oor = "";
            vm.decimal = false;
        }
        else if (data == '.') {
            if ($scope.modalData.newFmtd.length == 0) {
                $scope.modalData.newFmtd = '0.';
            }
            else if (!vm.decimal) {
        $scope.modalData.newFmtd += data;
            }
        }
        else if (data == '-') {
            if ($scope.modalData.newFmtd.charAt(0) == '-') {
                $scope.modalData.newFmtd = $scope.modalData.newFmtd.slice(1);
            } else {
                $scope.modalData.newFmtd = '-' + $scope.modalData.newFmtd;
            }
        }
        else {
            $scope.modalData.newFmtd += data;
        }

        if (data == '.')
            vm.decimal = true;
    }

}]);

app.controller('LoginController',
    ['$scope', '$http' , '$window', '$rootScope', '$location', 'AuthenticationService', '$cookieStore', '$rootScope',   
    function ($scope, $http, $window, $rootScope, $location, AuthenticationService, $cookieStore, $rootScope) {
        // reset login status
        AuthenticationService.ClearCredentials();
           $scope.password = "";
           $scope.back_url = $cookieStore.get('url');
        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.password);
                    $scope.globals_cooki = $cookieStore.get('globals');
                    if($scope.globals_cooki.currentUser.authdata =="MDAwMTI1"){
                        $scope.elementDataUrl_127_0 = "http://localhost:2001/mbs/?m=0&t=w&r=1024&d=125";
                        return $http.get($scope.elementDataUrl_127_0).then(function (response) {
                        	return $window.location.href = $cookieStore.get('url');
                        });
                    }
                    if($scope.globals_cooki.currentUser.authdata == "MDAwMTI2"){
                        $scope.elementDataUrl_127_0 = "http://localhost:2001/mbs/?m=0&t=w&r=1024&d=126";
                        return $http.get($scope.elementDataUrl_127_0).then(function (response) {
                        	return $window.location.href = $cookieStore.get('url');
                        });
                    }
                    if($scope.globals_cooki.currentUser.authdata == "MDAwMTI3"){
                    	$scope.elementDataUrl_127_0 = "http://localhost:2001/mbs/?m=0&t=w&r=1024&d=127";
                        return $http.get($scope.elementDataUrl_127_0).then(function (response) {
                        	return $window.location.href = $cookieStore.get('url');
                        });
                    }
                    //$scope.show_login.show = !$scope.show_login.show;                     
                } else {
                    $scope.error = response.message;
                    $scope.dataLoading = false;

                }
            });
        };
        $scope.clearSearch = function () {
            $scope.password = "";
            $rootScope.$emit("clearSearch1", {});
        };
        $scope.lpassword = function ($data) {
            $scope.password = $data;
        };
        $scope.$on('IdleTimeout', function() {        
	        closeModals();          
	        $cookieStore.remove('globals');    
	        $scope.elementDataUrl_0_0 = "http://localhost:2001/mbs/?m=0&t=w&r=1024&d=124";
	        return $http.get($scope.elementDataUrl_0_0).then(function (response) {
	        	return $window.location.href = 'index.html';
	        });              
	    });
	    
    }]);
app.controller('kpdController', ['$scope', '$http', '$rootScope', '$cookieStore', '$window', function kpdController($scope, $http, $rootScope, $cookieStore, $window) {

    var vm = this;
    vm.keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    vm.onKeyPressed = onKeyPressed;
    $rootScope.$on("clearSearch1", function(){
          $scope.password = "";
    });
    
    
    function onKeyPressed(data) {

        if (data == 'Clear') {
            $scope.password = "";
        }
        else if (data == 'Cancel') {
            $window.location.href = $cookieStore.get('url');
        }
        else {
            //console.log(data);
            $scope.password += data
            $scope.lpassword($scope.password);
        }
    }

}]);
app.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function (Base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {};

        service.Login = function (password, callback) {

            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
            $timeout(function () {
                var response = { success: password === '000125' || password === '000126' || password === '000127' };
                if (!response.success) {
                    response.message = 'Password is incorrect';
                }
                callback(response);
            }, 180);
        };

        service.SetCredentials = function (password) {
            var authdata = Base64.encode(password);

            $rootScope.globals = {
                currentUser: {
                    authdata: authdata
                }
            };
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $cookieStore.remove('readonly');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        return service;
    }])

app.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);

                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
});
app.config(function (ngModalDefaultsProvider, IdleProvider, KeepaliveProvider) {     
    return IdleProvider.idle(150);
});

app.run(['$rootScope', '$location', '$cookieStore', '$http', 'Idle', '$window', 
    function ($rootScope, $location, $cookieStore, $http, Idle, $window) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $window.onbeforeunload = function() {
            // Clearing all cookies now!
            $cookieStore.remove("globals"); 
        };

        Idle.watch();
}]);
