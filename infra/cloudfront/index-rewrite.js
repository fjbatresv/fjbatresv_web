var REDIRECTS = {
  '/about': '/#experience',
  '/experience': '/#experience',
  '/skills': '/#experience',
  '/projects': '/#projects',
  '/contact': '/#contact',
  '/writing': '/',
  '/es/about': '/es/#experience',
  '/es/experience': '/es/#experience',
  '/es/skills': '/es/#experience',
  '/es/projects': '/es/#projects',
  '/es/contact': '/es/#contact',
  '/es/writing': '/es/',
};

function handler(event) {
  var request = event.request;
  if (request.headers && request.headers.host && request.headers.host.value.toLowerCase() === 'www.fjbatresv.com') {
    var query = [];
    for (var key in request.querystring || {}) {
      var parameter = request.querystring[key];
      var values = parameter.multiValue || [parameter];
      for (var i = 0; i < values.length; i++) query.push(key + '=' + values[i].value);
    }
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://fjbatresv.com' + request.uri + (query.length ? '?' + query.join('&') : '') },
        'cache-control': { value: 'max-age=3600' },
      },
    };
  }
  var path = request.uri.replace(/\/+$/, '') || '/';
  var location = REDIRECTS[path];
  if (location) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: location } },
    };
  }
  if (request.uri === '/') return request;
  var lastSegment = request.uri.substring(request.uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') !== -1) return request;
  request.uri = request.uri.replace(/\/+$/, '') + '/index.html';
  return request;
}
