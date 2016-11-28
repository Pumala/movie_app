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

  service.nowPlaying = function(curr_page_num) {
    console.log('service page num', curr_page_num);
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
    var url = 'http://api.themoviedb.org/3/search/movie';
    var curr_query = search_keyword;
    console.log(curr_query);
    return $http({
      method: 'GET',
      url: url,
      params: {
        api_key: curr_api_key,
        query: curr_query,
        page: curr_page_num
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
app.controller('SearchController', function($scope, $stateParams, $http, MovieService, $state) {

  $scope.searchResults = function(search_keyword) {
    $state.go('search_results', {'search': search_keyword, 'page_number': 1});
    $scope.currSearch = "";
  }

})

// search results controller
app.controller('SearchResultsController', function($scope, $stateParams, $http, MovieService, $location, $state) {
  // $scope.search_keyword = $stateParams.search_keyword;
  $scope.search_keyword = $stateParams['search']
  $scope.page_number = $stateParams['page_number']

  console.log("SEARCH KEYWORD: ");
  console.log($stateParams['search']);

  MovieService.searchResults($scope.search_keyword, $scope.page_number)
    .success(function(searchResults) {
      $scope.searchResults = searchResults;
      // $location.path('/search');
      console.log("Hellow there is something here...");
      console.log($scope.searchResults);
      $scope.total_pages = searchResults.total_pages;
      $scope.total_results = searchResults.total_results;
      console.log($scope.searchResults.total_pages);
      $scope.searchResults.page = Number($scope.page_number);
      console.log($scope.searchResults);

    })

  $scope.showNextPageResults = function(condition) {
    if (condition === 'subtract') {
      $scope.page_number--;
    } else {
      $scope.page_number++;
    }
    $state.go('search_results', {'search_keyword': $scope.search_keyword, 'page_number': $scope.page_number});
  }

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

// Now Playing Controller
app.controller('NowPlayingController', function($scope, $stateParams, MovieService, $state) {
  $scope.page_number = $stateParams['page_number'];

  console.log($scope.page_number);

  MovieService.nowPlaying($scope.page_number)
    .success(function(currMovies) {
      $scope.currMovies = currMovies;
      $scope.total_pages = currMovies.total_pages;
      $scope.total_results = currMovies.total_results;
      $scope.currMovies.page = Number($scope.page_number);
    })

    $scope.showNextPageResults = function(condition) {
      if (condition === 'subtract') {
        $scope.page_number--;
      } else {
        $scope.page_number++;
      }
      $state.go('now_playing', {'page_number': $scope.page_number});
    }

});


// app.controller('MovieController', function($scope, $stateParams, $http, MovieService, $location) {
//   $scope.is_homepage = true;
// });
