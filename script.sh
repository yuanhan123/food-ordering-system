#!/bin/bash

green='\033[0;32m'
yellow='\033[0;33m'

if [ -e /var/run/nginx.pid ]; then 
    echo -e "${green}[+]${clear} Restarting nginx server..."
    systemctl reload nginx
else
    echo -e "${yellow}[*]${clear} Nginx server is not running..."
    echo -e "${green}[+]${clear} Starting nginx server..."
    systemctl start nginx
fi

echo -e "${green}[+]${clear} Installing Next.js..."
npm install

echo -e "${green}[+]${clear} Building the Next.js app..."
npm run build

echo -e "${green}[+]${clear} Restarting Food Ordering System..."
pm2 restart food-ordering-system
