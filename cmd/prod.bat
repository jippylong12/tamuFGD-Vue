rem Build our current script and then move those copies to the PHP server locally
$env:NODE_ENV="production"
vite build
Copy-Item -Force dist/index.html C:\wamp64\www\cPanel
Copy-Item -Force dist/assets/index.css C:\wamp64\www\cPanel\assets
Copy-Item -Force dist/assets/index.js C:\wamp64\www\cPanel\assets
