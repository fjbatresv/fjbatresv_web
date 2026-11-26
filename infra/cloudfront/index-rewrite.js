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
