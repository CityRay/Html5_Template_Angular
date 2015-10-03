(function() {
  'use strict';

  angular.module('application', [
    'ui.router',
    'ngAnimate',

    //foundation
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations'
  ])
    .config(config)
    .run(run)
    .controller('MainController', MainController)
  ;

  config.$inject = ['$urlRouterProvider', '$locationProvider'];

  function config($urlProvider, $locationProvider) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled:false,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');
  }

  function run() {
    FastClick.attach(document.body);
  }


  MainController.$inject = ['$rootScope', '$scope', '$state', '$window'];

  function MainController($rootScope, $scope, $state, $window) {
    console.log('main controller');

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      // ADD YOUR Code Below
      console.log('state change');


      //END ===================
    });
  };

})();
