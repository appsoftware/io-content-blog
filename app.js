
// *********************************************
// Edit blog config as required
// *********************************************

blogConfig = {
	
	// Set ioContentSubAccountKey and ioContentContentType according
	// to the sub account key assigned when you created the sub account that
	// under which this blog article has been published, and ioContentContentType
	// according to the appropriate content type under that sub account 
	
	ioContentSubAccountKey: 'rimm2eskcb7fub66hczrfoqcpd',
	ioContentContentType: 'blog-article',
	
	// Replace to change blog logo. Below is set to use I/O Content asset CDN using
	// a url generated in I/O content asset management area
	
	logoImageSrc: 'https://cdn.iocontent.com/api/v1.0/assets/nfm6dwvsmrd6uukgj3rzdugerc/20151113-091052578/tcm1/iocontent-blocks-logo-335-x-1149.png?max-height=80',
	
	// Replace to change blog strapline txt
	
	strapLineText: 'For I/O Content news and tips for managing content in your applications',
	
	// Set null to disable disqus comments
	
	disqusShortName: 'iocontent', 
};
		
// *********************************************
// No need to edit below this line
// *********************************************
(function () {

	'use strict';
	
	angular
	
	.module('appMain', ['ng', 'ngRoute', 'ngSanitize', 'ngDisqus'])
	.config(['$routeProvider', '$locationProvider', '$disqusProvider', function ($routeProvider, $locationProvider, $disqusProvider) {

		$routeProvider
		.when('/', {
			templateUrl: 'template.html',
			controller: 'blogController'
		})
		.when('/blog/:contentKey/:contentSeoTitle', {
			templateUrl: 'template.html',
			controller: 'blogController'
		})
		.otherwise({
			redirectTo: '/'
		});

		// html5Mode required for querystring parameter search ($location)

		$locationProvider.html5Mode(false).hashPrefix('!');
		
		if(blogConfig.disqusShortName)
		{
			$disqusProvider.setShortname(blogConfig.disqusShortName)
		}
	}]);
})();

(function () {

	'use strict';

	angular.module('appMain')

		.controller('blogController', ['$scope', '$routeParams', function ($scope, $routeParams) {
			
			// Helper function for creating pretty seo text in url
			
			var toHypenCase = function (str) {
				
				return str.replace(/\W+/g, '-').toLowerCase();
			}
			
			// Common url string generation from blog entry properties
			
			var getBlogUrl = function (contentKey, contentTitle) {
				
				return '/#!/blog/' + contentKey + '/' + toHypenCase(contentTitle);
			}
			
			// Simple routing mechanism using Angulars location service
			
			var contentKey = $routeParams.contentKey; 

			// Set up I/O Content ContentClient and configure sub account and 
			// content type.

			var contentClient = new ContentClient();

			contentClient.contentClientBaseParameters.subAccountKey = blogConfig.ioContentSubAccountKey;
			contentClient.contentClientBaseParameters.contentType = blogConfig.ioContentContentType;

			$scope.contentCurrent = {};

			$scope.blogConfig = blogConfig;

			$scope.blog = {

				contentEntryList: [],
				
				loadSingleBlogEntry: function (contentKey) {

					// Load full content for a single blog article

					var apiCallBack = function (responseJson) {

						var responseObj = JSON.parse(responseJson);

						// In JS api, an array of content objects is always returned, even
						// where the query would always limit the result set to a single content entity
						
						var contentCurrent = responseObj[0];

						$scope.contentCurrent = contentCurrent;
						
						console.log($scope.contentCurrent)
						
						// Scope apply as this callback as async event
						// not monitored by Angular
						
						$scope.$apply();
						
						// Doc title needs to be set in plain JS as is out of scope of
						// view controller
						
						if(contentCurrent && contentCurrent.title)
						{
							document.title = contentCurrent.title;
						}
					}
					
					// Construct single blog entry query and fetch
					
					var query = 'key.equals=' + contentKey + '&markdownToHtml=true';

					contentClient.get(query, apiCallBack);
				},
				loadContentEntryList: function() {
					
					// Load a list of blog artciles to allow user to navigate
					
					var blog = this;
					
					var apiCallBack = function (responseJson) {

						blog.contentEntryList = JSON.parse(responseJson); // [] of content entries
						
						for(var i= 0; i < blog.contentEntryList.length; i++)
						{
							blog.contentEntryList[i].blogUrl = getBlogUrl(blog.contentEntryList[i].key, toHypenCase(blog.contentEntryList[i].title));
						}
						
						// If content key is not loaded on the route, load the most recent
						// blog entry from the list
						
						var loadKey = contentKey != null ? contentKey : blog.contentEntryList[0].key;
						
						if(!$scope.contentKey)
						{
							$scope.blog.loadSingleBlogEntry(loadKey);
						}
						
						// Scope apply as this callback as async event
						// not monitored by Angular
						
						$scope.$apply();
					}
					
					// Since we are simply pulling all articles for purpose of creating side nav, 
					// only need to specify.
					
					var query = 'orderByDescending=publicPublishDate&limit=20';

					contentClient.get(query, apiCallBack);
				}
			}

			// Init

			$scope.blog.loadContentEntryList();
			
			if($scope.contentKey)
			{
				$scope.blog.loadSingleBlogEntry($scope.contentKey);
			}
		}]);

})();