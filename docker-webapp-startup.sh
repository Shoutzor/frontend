#!/bin/sh

# Replace the template tokens in config.template.json with the values from the environment variables
# Then save the result as config.json
envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json