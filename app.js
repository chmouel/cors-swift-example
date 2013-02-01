/* Adapted for Swift by Chmouel Boudjnah <chmouel@enovance.com>
   Original: http://www.ioncannon.net/programming/1539/direct-browser-uploading-amazon-s3-cors-fileapi-xhr2-and-signed-puts/

   */
function createCORSRequest(method, url)
{
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr)
  {
    xhr.open(method, url, true);
  }
  else if (typeof XDomainRequest != "undefined")
  {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  }
  else
  {
    xhr = null;
  }
  return xhr;
}

function handleFileSelect(evt)
{
  setProgress(0, 'Upload started.');

  var files = evt.target.files;

  var output = [];
  for (var i = 0, f; f = files[i]; i++)
  {
    uploadFile(f);
  }
}

function uploadFile(file)
{
  // authUrl='http://5.79.16.179:8080/v1/AUTH_0251e600096b454f8fc046e1f27f7e61';
  // container='foo';
  // token='b77b7b3600a946d7837b7008236fc020'
  authUrl=document.getElementById('authurl').value;
  container=document.getElementById('container').value;
  token=document.getElementById('authtoken').value;

  signedURL=authUrl + "/" + container + "/" + file.name;
  uploadToSW(file, signedURL, token);
}

/**
 * Use a CORS call to upload the given file to Swift. Assumes the url
 * parameter has been signed and is accessable for upload.
 */
function uploadToSW(file, url, token)
{
  var xhr = createCORSRequest('PUT', url);
  if (!xhr)
  {
    setProgress(0, 'CORS not supported');
  }
  else
  {
    xhr.onload = function()
    {
      if(xhr.status == 200 || xhr.status == 201)
      {
        setProgress(100, 'Upload completed.');
      }
      else
      {
        setProgress(0, 'Upload error: ' + xhr.status);
      }
    };

    xhr.onerror = function()
    {
      setProgress(0, 'XHR error.');
    };

    xhr.upload.onprogress = function(e)
    {
      if (e.lengthComputable)
      {
        var percentLoaded = Math.round((e.loaded / e.total) * 100);
        setProgress(percentLoaded, percentLoaded == 100 ? 'Finalizing.' : 'Uploading.');
      }
    };

    xhr.setRequestHeader('X-Auth-Token', token)
    //xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  }
}

function setProgress(percent, statusLabel)
{
  var progress = document.querySelector('.percent');
  progress.style.width = percent + '%';
  progress.textContent = percent + '%';
  document.getElementById('progress_bar').className = 'loading';

  document.getElementById('status').innerText = statusLabel;
}
