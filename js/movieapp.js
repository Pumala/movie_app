var app = angular.module('movie-app', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state({
    name: 'home',
    url: '/',
    templateUrl: 'home.html'
    // do not need
    // controller: 'MovieController'
  })
  .state({
    name: 'search_results',
    url: '/search',
    params: {'search': null},
    templateUrl: 'search_results.html',
    controller: 'SearchResultsController'
  })
  .state({
    name: 'movieDetails',
    url: '/movie/{movie_id}',
    templateUrl: 'movie_details.html',
    controller: 'MovieDetailController'
  })

  $urlRouterProvider.otherwise('/');

});

// app.run will always be running across all Pages
// then you can inside app.run create a global variable
// that is more versatile and accessible
app.run(function($rootScope, $location) {
  $rootScope.$on('$locationChangeStart', function(event, nextUrl, currentUrl) {
    nextUrl = nextUrl.split("/");
    console.log(nextUrl);
    nextUrl = nextUrl[nextUrl.length - 1];
    console.log(nextUrl);
    if (nextUrl === "") {
      $rootScope.is_homepage = false;
    } else {
      $rootScope.is_homepage = true;
    }
    console.log("RoostScope: " + $rootScope.is_homepage);
  })
});

app.factory('MovieService', function($http) {
  var service = {};
  var curr_api_key = '7468c53c297986faad9b295510465a46';

  service.searchResults = function(search) {
    var url = 'http://api.themoviedb.org/3/search/movie';
    var curr_query = search;
    return $http({
      method: 'GET',
      url: url,
      params: {
        api_key: curr_api_key,
        query: curr_query
      }
    });
  }

  service.movieDetails = function(movieId) {
    var url = 'http://api.themoviedb.org/3/movie/' + movieId;
    return $http({
      method: 'GET',
      url: url,
      params: {
        api_key: curr_api_key
      }
    });
  }

  return service;

})

// form controller
app.controller('SearchController', function($scope, $stateParams, $http, MovieService, $location, $state) {
  // $scope.is_homepage = false;

  $scope.searchResults = function(search_keyword) {
    // console.log(search_keyword);
    // $scope.is_homepage = true;
    $state.go('search_results', {'search': search_keyword});
  }

})

// search results controller
app.controller('SearchResultsController', function($scope, $stateParams, $http, MovieService, $location, $state) {
  $scope.search_keyword = $stateParams.search;
  // $scope.is_homepage = true;

  MovieService.searchResults($scope.search_keyword)
    .success(function(searchResults) {
      $scope.searchResults = searchResults;
      // $location.path('/search');
      console.log(searchResults);
    })

})

// Movie Detail Controller
app.controller('MovieDetailController', function($scope, $stateParams, $http, MovieService, $location, $state) {
  $scope.movie_Id = $stateParams.movie_id;

  console.log($scope.movie_Id);

  MovieService.movieDetails($scope.movie_Id)
    .success(function(movie) {
      $scope.currMovie = movie;
      console.log(movie);
    });

})


// app.controller('MovieController', function($scope, $stateParams, $http, MovieService, $location) {
  // $scope.is_homepage = true;
// });






// $scope.currMovieId = $stateParams.movie_id;

  // $scope.getSearchResults = function(search) {
  //   MovieService.searchResults(search)
  //     .success(function(searchResults) {
  //       $scope.searchResults = searchResults.movie_title;
  //       $location.path('/search');
  //       console.log(searchResults);
  //     })
  // }

  // $scope.getMovieDetails = function() {
  //   MovieService.movieDetails($scope.currMovieId)
  //     .success(function(movie) {
  //       $scope.currMovie = movie;
  //       console.log(movie);
  //     });
  // }





// $scope.getSearchResults = function(search) {
//   MovieService.searchResults(search)
//     .success(function(searchResults) {
//       $scope.searchResults = searchResults.movie_title;
//       $location.path('/search');
//       console.log(searchResults);
//     })
// }


// $scope.getMovieDetails = function() {
//   MovieService.movieDetails($scope.currMovieId)
//     .success(function(movie) {
//       $scope.currMovie = movie;
//       console.log(movie);
//     });
// }
