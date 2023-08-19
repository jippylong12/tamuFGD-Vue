rem Build our current script and then move those copies to the PHP server locally
$env:NODE_ENV="production"
vite build
copy dist/index.html C:\wamp64\www\cPanel
copy dist/assets/index.css C:\wamp64\www\cPanel\assets
copy dist/assets/index.js C:\wamp64\www\cPanel\assets
