;(function (win, doc) {
  'use strict';

  // Keep a reference to <html> for later
  var _root = doc.documentElement;

  // These don't exist yet
  var _searchbutton, _search, _results, _close;
  var _links, _src, _src_el, _append_to, _attrs, _cache, _idx;
  var j = 0;
  var _UI = {
    'search': '',
    'button': '',
    'results': '',
    'close': ''
  };
  
  // We need these three Array methods and DOMParser() for search to work;
  // The fifth test reliably rules out IE9, which doesn't support text/html in DOMParser().parseFromString()
  // The ability to parse text/html landed in IE10, but we can't test for that without try/catch obliterating V8 optimization.
  if (!('localStorage' in win && 'map' in [] && 'filter' in [] && 'reduce' in [] && 'DOMParser' in win && 'compile' in RegExp.prototype)) { return; }

  // polyfill location.origin for default XHR target settings
  if (!('origin' in location)) { location.origin = location.protocol + '//' + location.host; }

  // Create IDs for injected HTML elements on the fly
  for (; Object.keys(_UI).length > j; ++j) { _UI[Object.keys(_UI)[j]] = generateID(j); }

  // This could always be put into main.css, but for now we can insert it dynamically:
  doc.head.insertAdjacentHTML('beforeend', 
    '<style> \
     html,body,:root{-webkit-text-size-adjust:100%;text-size-adjust:100%;margin:0;padding:0;border:0;} \
     #' + _UI.button + ', \
     #' + _UI.search + ', \
     #' + _UI.search +'>input, \
     #' + _UI.results + ', \
     #' + _UI.close + '{box-sizing:border-box;font-size:15px;} \
     #' + _UI.button+', \
     #' + _UI.search + '{position:fixed;transition-property:-webkit-transform,opacity,visibility;transition-property:transform,opacity,visibility;transition-duration:200ms;transition-timing-function:cubic-bezier(0.4,0,0.2,1);-webkit-border-radius:4px;border-radius:4px;} \
     #' + _UI.button + ', \
     #' + _UI.close + '{-webkit-appearance:none;-moz-appearance:none;-ms-appearance:none;-o-appearance:none;appearance:none;} \
     #' + _UI.button + '{bottom:2.5em;right:3em;background-color:#4183C4;background-image:url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cg%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M15.5%2014h-.79l-.28-.27C15.41%2012.59%2016%2011.11%2016%209.5%2016%205.91%2013.09%203%209.5%203S3%205.91%203%209.5%205.91%2016%209.5%2016c1.61%200%203.09-.59%204.23-1.57l.27.28v.79l5%204.99L20.49%2019l-4.99-5zm-6%200C7.01%2014%205%2011.99%205%209.5S7.01%205%209.5%205%2014%207.01%2014%209.5%2011.99%2014%209.5%2014z%22%3E%3C/path%3E%3C/g%3E%3C/svg%3E);background-repeat:no-repeat;background-size:24px 24px;background-position:50% 50%;color:#fff;width:50px;height:50px;margin:0;padding:0;border:0 none;cursor:pointer;z-index:19001;} \
     #' + _UI.search + '{bottom:2.5em;right:3em;border:5px solid #4183C4;z-index:19000;width:auto;height:auto;opacity:0;visibility:hidden;-webkit-transform:scaleX(0);transform:scaleX(0);-webkit-transform-origin:100% 50%;transform-origin:100% 50%;} \
     html[data-searchinit] #' + _UI.search + '{opacity:1;visibility:visible;-webkit-transform:scaleX(1);transform:scaleX(1);} \
     html[data-searchinit] #' + _UI.button + ', \
     #' + _UI.close + '{background-image:url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2248%22%20height%3D%2248%22%20viewBox%3D%220%200%2048%2048%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%223%22%20stroke-miterlimit%3D%2210%22%20d%3D%22M32.5%2016.5l-16%2016m16%200l-16-16%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E);background-size:30px 30px;background-repeat:no-repeat;background-position:50% 50%;} \
     #' + _UI.button + ':hover{background-color:#3e7ab6} \
     #' + _UI.search + '>input{display:block;border:0;padding:8px;height:40px;width:auto;-webkit-border-radius:4px;border-radius:4px;} \
     #' + _UI.results + '{display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:19000;height:100vh;padding:1em;background:rgba(0,0,0,.8);-webkit-overflow-scrolling:touch;} \
     #' + _UI.results + '>div>a{display:block;background:#fff;padding:1em;line-height:1.3;margin-bottom:1em;} \
     #' + _UI.close + '{background-color:transparent;position:fixed;top:25px;right:25px;z-index:19001;width:50px;height:50px;margin:0;padding:0;border:0 none;cursor:pointer;} \
     #' + _UI.results + '>div{margin:0 auto 0 auto;max-width:40em;padding:1em 1.5em 1.3em 1.5em;} \
     #' + _UI.results + '>div>h2{color:#fff;font-size:22px;margin:0.2em 0 0.8em 0;padding:0 1.5em 0.2em 0;}html[data-displayresults]{overflow:hidden} \
     html[data-displayresults] #' + _UI.button + '{display:none;} \
     html[data-displayresults] #' + _UI.results + '{display:block;-webkit-backdrop-filter:blur(4px);overflow-x:hidden;overflow-y:scroll;} \
     </style>');

  // Prepare default values for data source
  _src        = location.origin;
  _src_el     = '';
  _append_to  = 'body';
  _attrs      = ['href', 'title'];
  _cache      = true;
  _idx        = 'jsearch_' + (location.host.replace('.', ''));
  
  // Open JSearch public method
  win.jsearch = { 'init': init };

  // Index available content by scraping the homepage and retrieving HTMLAnchor elements within the #links element.
  // Attach the remaining event listeners only upon successful downloading of the document index
  function init (config) {
    var _xhr = new XMLHttpRequest();
    var _d = new Date().getTime();

    // Update with configuration object 
    if (typeof config !== 'undefined') {
      _src       = !!config.src       ? config.src       : _src;       // url to scrape
      _append_to = !!config.append_to ? config.append_to : _append_to; // element to append search button to
      _attrs     = !!config.attrs     ? config.attrs     : _attrs;     // attributes to search through
      _cache     = !!config.cache     ? config.cache     : _cache;
    }

    // If the browser seems like it will cut the mustard, add the search button, input bar and results panel
    doc.querySelector(_append_to).insertAdjacentHTML('beforeend', 
      '<button id="' + _UI.button + '" tabindex="1"></button> \
       <form method="GET" action="/" id="' + _UI.search + '"> \
         <input type="text" title="Search for a particular example" required> \
       </form> \
       <div id="' + _UI.results + '" aria-hidden="true" hidden> \
         <button id="' + _UI.close + '" tabindex="1"></button> \
         <div><h2></h2></div> \
       </div>');

    // Now we've added that HTML, let's store some references
    _searchbutton = doc.getElementById(_UI.button);
    _search       = doc.getElementById(_UI.search);
    _results      = doc.getElementById(_UI.results);
    _close        = doc.getElementById(_UI.close);

    // Search button event wireup, enabling the user to open the search input box
    _searchbutton.addEventListener('click', showForm, false);
    _xhr.open('GET', _src, true);

    // We're using DOMParser, but the same effect could be achieved with responseType = 'document'
    // Using responseType is cleaner, but we'd be throwing already limited IE support out of the window
    _xhr.onload = function () {
      var _typ = this.getResponseHeader('content-type');
      var _doc = new DOMParser().parseFromString(this.responseText, (
        !!_typ.indexOf('xhtml') ? 
          'application/xhtml+xml' : 
            !!_typ.indexOf('html') ? 
              'text/html' : 
                'application/xml')
      );
      
      // no document? parser error? dismantle optimistically configured widget
      if (!_doc || !_doc.documentElement || !!_doc.querySelector('parsererror')) { 
        _searchbutton.removeEventListener('click', showForm, false);
        _searchbutton.parentNode.removeChild(_searchbutton);
        _search.parentNode.removeChild(_search);
        _results.parentNode.removeChild(_results);
        _close.parentNode.removeChild(_close);
      }
      
      // no document
      if (!_doc || !_doc.documentElement) { throw (new Error('No document at resource')); }
      
      // parser error
      if (!!_doc.querySelector('parsererror')) { throw (new Error('Parser error: invalid markup')); }
      
      // Set this now that we know what the root element is
      _src_el = !!config && !!config.src_el ? config.src_el : _doc.documentElement.tagName;
      
      if (!!_cache && !!(localStorage.getItem(_idx))) {
        // within cache expiration threshold
        if (!!(_d - localStorage.getItem(_idx).unixdate < _cache)) {
          _links = decodeURIComponent(localStorage.getItem(_idx).index);
        }
        // cache expired or not existent
      } else {
      
        // handle XML feeds
        switch (_doc.documentElement.tagName) {

          // sitemap.xml
          case 'urlset':
            // [].slice.call to convert NodeList to Array (so we can map/reduce/filter it to death)
            _links = [].slice.call(
              _doc.getElementsByTagName('url')
                ).map(function (url) {
                  return url.querySelector('loc');
                });
            break;

          // RSS
          case 'channel':
            _links = [].slice.call(
              _doc.getElementsByTagName('item')
                ).map(function (item) { 
                  var _composite = item.querySelector('link');
                  _composite.setAttribute('title', item.querySelector('title').textContent);
                  _composite.setAttribute('href', _composite.textContent);
                  //=> <link title="title" href="http://url.com">http://url.com</link>
                  return _composite;
                });
            break;
        
          // atom
          case 'feed':
            _links = [].slice.call(
              _doc.getElementsByTagName('entry')
                ).map(function (entry) {
                  var _composite = entry.querySelector('link');
                  _composite.setAttribute('title', entry.querySelector('title').textContent);
                  //=> <link title="title" href="http://url.com"/>
                  return _composite;
                });
            break;

          case 'html':
            _links = [].slice.call(_doc.querySelector(_src_el).getElementsByTagName('a'));
            break;

          default:
            // Handles an atypical XML document data source
            _links = [].slice.call(
              _doc.querySelector(_src_el)
                .getElementsByTagName('*')
                  ).filter(function (el) { 
                    return !!el.getAttribute('href');
                  });
        }
      
        // set cached index
        if (!!_cache) { 
          localStorage.setItem(_idx, {
            'unixdate': _d,
            'index': encodeURIComponent(_links)
          });
        }
      }
      
      // We don't need or want to wire up these events until we have an index of links to search through
      _search.addEventListener('submit', handleSearchAttempt, false);
      _close.addEventListener('click', resetSearchResults, false);
    };

    _xhr.onerror = _xhr.ontimeout = _xhr.onabort = function() {
      console.warn('Error with request: ' + this.status);
    };

    _xhr.send(null);
  }

  // Handle the submission of the search form
  function handleSearchAttempt (e) {
    var _query;

    // If there's no index, exit immediately and re-initialise:
    if (typeof _links !== 'object' || !Array.isArray(_links) || !_links) { return init(); }

    // Prevent default submit behaviour
    typeof e !== 'undefined' && e.preventDefault();

    // Retrieve the search query from the input element
    _query = e.target.querySelector('input').value;

    // Suffice it to say that we should quit if there's no query
    if (typeof _query !== 'string' || !_query) { return; }

    displaySearchResults(_query, getSearchResults(_query, _links));
    return false;
  }

  // Reveal search results panel and populate with data
  function displaySearchResults (query, results) {

    // We're using data-attributes to govern CSS properties of the search form/results panel
    _root.setAttribute('data-displayresults','true');
    _root.removeAttribute('data-searchinit');
    _results.removeAttribute('aria-hidden');
    _results.removeAttribute('hidden');

    // Display number of results found above the results list
    _results
      .querySelector('div>h2')
        .textContent = results.length +
          (results.length === 1 ? ' result' : ' results') +
            ' found for "' + query + '"';

    if (results.length < 1) { return; }
    _results.querySelector('div').insertAdjacentHTML('beforeend',
      // The fun part:
      generateMarkup(results)
    );
  }

  // Grind the index down using clean, functional methods
  function getSearchResults (query, data) {
    return data.filter(function (link) {

      // convert string specification from config/defaults to actual node attribute content
      var _attr_vals = _attrs.map(function (attr) {
        return !!link.getAttribute(attr) ? link.getAttribute(attr) : '';
      });

      // inject textcontent without being specified
      // textcontent is not an attribute, so we can't get it from the config without
      // a total mess of ifs/elses
      // but fortunately it's the one thing that will definitely be worth checking
      _attr_vals[(_attr_vals.length)] = !!link.textContent ? link.textContent.toLowerCase() : '';

      return !!occursAtLeastOnce(query.toLowerCase(), _attr_vals);
    }).map(function (link) {
      var _title   = !!link.getAttribute('title') ? link.getAttribute('title') : '';
      var _url     = !!link.getAttribute('href')  ? link.getAttribute('href')  : '';
      var _content = sanitize(link.textContent);
      return {
        'title': _title,
        'url': _url,
        'content': _content,
        'ldistance': bestOf(query.toLowerCase(), [_title.toLowerCase(), _url.toLowerCase(), _content.toLowerCase()])
      };
    }).sort(function (p, q) {
      if (p.ldistance < q.ldistance) { return -1; }
      if (p.ldistance > q.ldistance) { return 1; }
      return 0;
    });
  }

  function generateMarkup (results) {
    return results.map(function (result) {
      return '<a href="' + result.url +
             '" title="' + result.title +
             '">' + result.content + '</a>';
    }).reduce(function (acc, nxt) {
      return acc + nxt;
    });
  }

  // Find the Levenshtein distance for each of an array of strings compared to a query
  // Sort the array by shortest distance and return shortest distance item
  // This enables us to check href, title attributes and textContent for
  // indications of a good match.

  // this does not actually need to be limited to three candidates
  // change function name
  function bestOf (query, candidates) {
    return candidates.map(function (candidate) {
      return getLevenshteinDistance(query, candidate);
    }).sort(function (p, q) {
      if (p < q) { return -1; }
      if (p > q) { return 1; }
      return 0;
    }).filter(function (item, idx) {
      return idx === 0;
    });
  }

  // Substitute for String.protoype.includes(), but for an array of strings
  function occursAtLeastOnce (query, data) {
    return data.map(function (datum) {
      if (datum.length < query.length) { return false; }
      return datum.indexOf(query) !== -1;
    }).reduce(function (w, x) {
      return !!(w || x);
    });
  }

  // Calculate levenshtein distance reasonably quickly
  // This could probably be faster
  function getLevenshteinDistance (string, to_match) {
    var distance, row1, row2, i, j;
    for (row2 = [i = 0]; string[i]; ++i) {
      for (row1 = [j = 0]; to_match[++j];) {
        distance = row2[j] = i ?
          Math.min(
            row2[--j], 
            (Math.min(
              row1[j] - (string[i - 1] === to_match[j]),
              row1[++j] = row2[j]
            ))
          ) + 1 : j;
      }
    }
    return distance;
  }

  // Basic sanitizer for element.textContent
  // This would ideally need to be stricter/more rigorous
  function sanitize (text) {
    return text.split('').map(function (char) {
      return char === '<' ? '&lt;' : char === '>' ? '&gt;' : char
    ;}).join('');
  }

  // Delete all the results and close the search panel
  function resetSearchResults () {
    [].slice.call(
      _results.getElementsByTagName('a')
    ).forEach(function (result) {
      result.parentNode.removeChild(result);
    });
    _results.setAttribute('aria-hidden', 'true');
    _results.setAttribute('hidden', '');
    _root.removeAttribute('data-displayresults');
  }

  // Reveal the search bar and autofocus
  // NB: use setTimeout to time the autofocus such that the CSS transition
  // completes first, as the input element will not focus while transforming
  function showForm () {
    if (typeof _links !== 'object' || !Array.isArray(_links) || !_links) { return init(); }
    if (!_root.getAttribute('data-searchinit')) {
      _root.setAttribute('data-searchinit','true');
      win.setTimeout(function () {
        _search.querySelector('input').focus();
      }, 220);
    } else {
      _root.removeAttribute('data-searchinit');
    }
  }

  // Use to create unique element IDs for the injected markup
  // necessary to avoid possible conflicts with existing elements on any given page
  function generateID (idx) {
    return ('jsrch_' + idx + '_' + new Date().getTime());
  }

})(window, document);
