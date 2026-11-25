var REDIRECTS = {};

function handler(event) {
  var request = event.request;
  var location = REDIRECTS[request.uri];
  if (location) {
    return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: location } } };
  }
  if (request.uri === '/') return request;
  var lastSegment = request.uri.substring(request.uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') !== -1) return request;
  request.uri = request.uri.replace(/\/+$/, '') + '/index.html';
  return request;
}
