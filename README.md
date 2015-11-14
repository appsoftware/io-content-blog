# I/O Content Example Blog

## A simple HTML, JS and CSS blog backed by [I/O Content](http://www.icontent.com) API driven CMS

This simple blog is an example of how [I/O Content](http://www.icontent.com) can be used to manage content for websites. You can also use this example to run your blog using content in your I/O Content account.


The **[Demo](http://exampleblog.iocontent.com/index.html?key=xtun42ocqlxeu56wim5s3ccuma)** is hosted on Amazon S3 using S3's [static website](http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html) feature.

This blog uses simple HTML, JS and CSS, backed by the I/O Content API which serves content entries in response to a query sent over an HTTP GET request using the [io-content-js](https://github.com/appsoftware/io-content-js) library. 

The only required files required to run this blog are the `index.html` file and the `bower_components` folder.

![alternate text](https://cdn.iocontent.com/api/v1.0/assets/nl7bwlc4txh2uvw3s6h4gcclgb/20151113-121206643/062b/example-blog-required-files.png)

*Note this demo is not available as a bower package, and all dependencies have been copied to the respository so you can simply copy deploy this website on any web server. This will not run from the local file system, so you will need to run via your local web server (e.g. Apache / IIS) to test.*

## How this example blog works

This example pulls content hosted in our 'blog-example' sub account. You'll need to set up you're own sub account and content types and edit the sample as appropriate. Full [documentation](https://github.com/appsoftware/io-content-docs)  for I/O Content describes how to manage content, set up content types and query the API.

The dependencies for this example are:

- [io-content-js](https://github.com/appsoftware/io-content-js) - for querying the I/O content API
- [AngularJS](https://github.com/angular) - for rendering UI / managing routes
- [gridism](https://github.com/cobyism/gridism) - for a light weight CSS grid
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) - simple markdown / html styling

Note that I/O Content is queried via REST API, and [io-content-js](https://github.com/appsoftware/io-content-js) assists with making cross domain requests compatible with all major browsers.

### API Query

The core content fetch code is as follows:

**1. Set up the content client**

```
var contentClient = new ContentClient();

contentClient.contentClientBaseParameters.subAccountKey = 'nl7bwlc4txh2uvw3s6h4gcclgb';
contentClient.contentClientBaseParameters.contentType = 'blog-article';
```

**2. Request a list of content entries and load the first into view**

```
var blog = this;
							
var apiCallBack = function (responseJson) {

	blog.contentEntryList = JSON.parse(responseJson); // [] of content entries
	
	var loadKey = contentKey != null ? contentKey : blog.contentEntryList[0].key;
	
	$scope.blog.loadSingleBlogEntry(loadKey);
	
	$scope.$apply();
}

// Since we are simply pulling all articles for purpose of creating side nav, 
// only need to specify.

var query = 'orderByDescending=publicPublishDate&limit=20';

contentClient.get(query, apiCallBack);

```

### Content Assets

Content Assets managed in I/O Content are loaded from our CDN using plain HTTPS urls. Where requesting images, our CDN offers 'on the fly' image resizing, specified here using the `?max-height=80` query string argument. Resized images are cached in the CDN for fast load times.

Other file types are also served over the CDN in the same manner.

```
<div>
	<img src="https://cdn.iocontent.com/api/v1.0/assets/nfm6dwvsmrd6uukgj3rzdugerc/20151113-091052578/tcm1/iocontent-blocks-logo-335-x-1149.png?max-height=80" alt="logo" />
</div>
```