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
    url: '/search/{search}/{page_number}',
    params: {'search': null, 'page_number': null},
    templateUrl: 'search_results.html',
    controller: 'SearchResultsController'
  })
  .state({
    name: 'movieDetails',
    url: '/movie/{movie_id}',
    templateUrl: 'movie_details.html',
    controller: 'MovieDetailController'
  })
  .state({
    name: 'now_playing',
    url: '/now_playing/{page_number}',
    params: {'page_number': null},
    templateUrl: 'now_playing.html',
    controller: 'NowPlayingController'
  })

  $urlRouterProvider.otherwise('/');

});

// app.run will always be running across all Pages
// then inside app.run you can create a global variable
// that is more versatile and accessible
app.run(function($rootScope, $location) {
  // $locationChangeStart has access to the new url that the user is changing to
  $rootScope.$on('$locationChangeStart', function(event, nextUrl) {
    // split the url
    nextUrl = nextUrl.split("/");
    // grab the last index of the url and check its value
    nextUrl = nextUrl[nextUrl.length - 1];
    // if there is nothing, then the url is not home
    if (nextUrl === "") {
      $rootScope.is_homepage = false;
    } else {
      // if there is something else here, then the url is home
      $rootScope.is_homepage = true;
    }
  })
});

app.factory('MovieService', function($http) {
  // an object called service that stores all of app.factory's services
  var service = {};
  var curr_api_key = '7468c53c297986faad9b295510465a46';

  service.nowPlaying = function(curr_page_num) {
    var url = 'https://api.themoviedb.org/3/movie/now_playing';
    return $http({
      method: 'GET',
      url: url,
      params: {
        api_key: curr_api_key,
        page: curr_page_num
      }
    });
  }

  service.searchResults = function(search_keyword, curr_page_num) {
    // the query we want to search is passed in as search_keyword
    var url = 'http://api.themoviedb.org/3/search/movie';

    return $http({
      method: 'GET',
      url: url,
      params: {
        api_key: curr_api_key,
        query: search_keyword,
        page: curr_page_num
      }
    });
  }

  service.showNextPageResults = function(condition, page_number) {
    if (condition === 'subtract') {
      page_number--;
    } else {
      page_number++;
    }
    return page_number;
  }

  service.movieDetails = function(movieId) {
    // the movie id is passed in as movieId
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

// form controller: the movie search engine is accessible on all the pages
// it has its own controller to be more versatile
app.controller('SearchController', function($scope, $state) {

  // the scope method takes in a search keyword that it will be searching for
  $scope.searchResults = function(search_keyword) {
    // state.go changes to a new state
    // pass in the search keyword we are searching
    // hard code the page number to 1 because it is the first page of the results
    $state.go('search_results', {'search': search_keyword, 'page_number': 1});
  }

})

// search results controller
app.controller('SearchResultsController', function($scope, $stateParams, MovieService, $state) {
  // grab the $stateParams values and save them to scope variables
  $scope.search_keyword = $stateParams['search'];
  $scope.page_number = Number($stateParams['page_number']);

  // instantly call searchResults service and pass in the search keyword user is looking up,
  // as well as the page number
  MovieService.searchResults($scope.search_keyword, $scope.page_number)
    // upon success, searchResults is return back
    .success(function(searchResults) {
      // save searchResults to a scope variable
      $scope.searchResults = searchResults;
      // save the total pages of results to a scope variable
      $scope.total_pages = searchResults.total_pages;
      // save the total number of results to a scope variable
      $scope.total_results = searchResults.total_results;
      //
      // $scope.searchResults.page = Number($scope.page_number);
    })

    // this scope method takes in a condition and the current page number
   // the condition is either 'subtract' or 'add'
    $scope.showNextPageResults = function(condition) {
      $scope.page_number = MovieService.showNextPageResults(condition, $scope.page_number);
      // use $state.go to change states (pass in the search_keyword and page_number values)
      $state.go('search_results', {'search_keyword': $scope.search_keyword, 'page_number': $scope.page_number});
    }

})

// Movie Detail Controller
app.controller('MovieDetailController', function($scope, $stateParams, $http, MovieService) {
  // grab the movie id from $stateParams
  $scope.movie_Id = $stateParams.movie_id;

  // instantly calls movieDetails service
  // pass in the movie id of the movie we are searching
  MovieService.movieDetails($scope.movie_Id)
    .success(function(movie) {
      $scope.currMovie = movie;
    });

})

// Now Playing Controller
app.controller('NowPlayingController', function($scope, $stateParams, MovieService, $state) {
  // grab the curr page number from stateParams and save it to a scope variable
  $scope.page_number = Number($stateParams['page_number']);

  // instantly call nowPlaying service and pass in the page_number
  MovieService.nowPlaying($scope.page_number)
    // upon success, the results return as we catch it by naming it currMovies
    .success(function(currMovies) {
      // save the result to a scope variable
      $scope.currMovies = currMovies;
      // also, save the total results pages and number of results to scope variables
      $scope.total_pages = currMovies.total_pages;
      $scope.total_results = currMovies.total_results;
      // $scope.currMovies.page = Number($scope.page_number);
    })

    $scope.showNextPageResults = function(condition) {
      $scope.page_number = MovieService.showNextPageResults(condition, $scope.page_number);
      $state.go('now_playing', {'page_number': $scope.page_number});
    }

});


// app.controller('MovieController', function($scope, $stateParams, $http, MovieService, $location) {
//   $scope.is_homepage = true;
// });
