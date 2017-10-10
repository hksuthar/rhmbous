var myapp = angular.module('ciu', ['ngModal', 'ngIdle']);
myapp.controller('SecondCtrl', function ($scope) {

    $scope.$on('IdleTimeout', function () {
        $window.location.href = 'blank.html';
    });
});
myapp.config(function (ngModalDefaultsProvider, IdleProvider, KeepaliveProvider) {
    return IdleProvider.idle(240);
});

