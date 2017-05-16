# JSearch
### A drop-in search widget for static sites

JSearch literally scrapes a target URL, matches internal links in the response's markup and uses it as a data source to match a keyword/phrase.

Matching is done by using Levenshtein distance. At the moment, this is done as a 'best of [x]' rather than mean average.

## Usage
Include JSearch as an external JS library:
    
    <script async src="/path/to/jsearch.js"></script>

and initialise with:

    window.jsearch.init();
    
OR you can pass in a configuration object:

    window.jsearch.init({
      'src': 'http://www.mywebsite.com',
      'src_el': '#link_list'
    });
    
where `src` is the URL of the page to scrape and `src_el` is the narrowest possible scope to query from the scraped document, as a CSS selector for a container element.

The options you can pass in are:

| key       | description | example value |
|-----------|-------------|---------------|
| src       |             |               |
| src_el    |             |               |
| append_to |             |               |
| attrs     |             |               |

Say you had a list of blog article links, and the containing element of that list had an id of `blog_list` — you would init like so:

    window.jsearch.init({
      'src': 'http://www.myblog.com',
      'src_el': '#blog_list'
    });
