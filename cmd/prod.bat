rem Build our current script and then move those copies to the PHP server locally
set NODE_ENV=production
vite build
powershell Copy-Item -Force dist/index.html C:\wamp64\www\cPanel
powershell Copy-Item -Force dist/assets/index.css C:\wamp64\www\cPanel\assets
powershell Copy-Item -Force dist/assets/index.js C:\wamp64\www\cPanel\assets
