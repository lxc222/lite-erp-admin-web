#!/bin/bash

cd ../lite-erp-admin-web-dist
git pull
rm -rf ./*

cd ../lite-erp-admin-web
rm -rf ./dist/
git pull
npm run build

cp -R ./dist/* ../lite-erp-admin-web-dist/ 
rm -R ./dist/*

cd ../lite-erp-admin-web-dist/
git add -A
git commit -m "sync";
git push

cd ../lite-erp-admin-web
