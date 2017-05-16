# JSearch
## A drop-in search widget for static sites

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

## Configuration options
The options you can pass in are:

| Key | Type | Description | Default value | Example value |
|-----|------|-------------|---------------|---------------|
| `src` | `string` | URL to the resource to be queried, be it the home page or sitemap.xml or whatever | `window.origin` | `'http://mywebsite.com/archive'` |
| `src_el` | `string` | CSS selector string matching the element that contains nodes relevant to your search query. This is determined automatically for RSS/Atom feedsand sitemaps. | `'html'` | `'#element'` |
| `append_to` | `string` | CSS selector matching the element to which the search widget should be attached. | `'body'` | `'.wrapper'` |
| `attrs` | `array` | Array of attributes you want to check. This is handled automatically if querying RSS, Atom or sitemap. | `['href', 'title']` | `['href', 'title', 'data-info']` |

So, if you had:
- a list of blog article links on an archive page
- and the containing element of that list had an id of `blog_list`
- you wanted to append the search widget to a width-constraining element with an id of `wrapper`
- you wanted to check `href`, `title` and `data-summary` attributes

then you would init like so:

    window.jsearch.init({
      'src': 'http://www.myblog.com/archive',
      'src_el': '#blog_list',
      'append_to': '#wrapper',
      'attrs': ['href', 'title', 'data-summary']
    });

## A note on performance
Obviously, the fewer nodes JSearch has to look through, the faster it will be, so if you can try to provide a `src_el` element if you're scraping a web page.
