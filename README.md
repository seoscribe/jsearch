# jsearch
working title

alt approach:

    function apiSearch(query, repo, url) {
      return fetch('https://api.github.com/search/code?q=' + query + '+repo:' + repo, {
        mode: 'cors',
        headers: {
          'Accept': 'application/vnd.github.v3.text-match+json'
        }
      }).then(function(response) {
        if (response.ok) {
          return response.json().then(function(data) {
            return data.items.map(function(datum) {
              return datum.path
            }).filter(function(result) {
              return result.includes(query) && result.includes('/index.html')
            }).map(function(match) {
              const dir = match.replace('/index.html', '');
              return {
                'title': dir,
                'url': url + dir
              };
            });
          });
        }
      });
    }
