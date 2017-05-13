# jsearch

A drop-in search widget for static sites, esp. those without a sitemap that can be queried.

jsearch literally scrapes a target URL and matches links (within a specified element in the scraped document) and uses it as a data source to match a keyword/phrase using Levenshtein distance.

## Usage
Include jsearch as an external JS library and init with:

    window.jsearch.init();
    
Optionally passing in a config object:

    window.jsearch.init({
      'src': 'http://www.mywebsite.com',
      'src_el': '#link_list'
    });
    
where `src` is the URL of the page to scrape and `src_el` is the narrowest possible scope to query from the scraped document, as a CSS selector for a container element.

Say you had a list of blog article links, and the containing element of that list had an id of `blog_list` — you would init like so:

    window.jsearch.init({
      'src': 'http://www.myblog.com',
      'src_el': #blog_list
    });
