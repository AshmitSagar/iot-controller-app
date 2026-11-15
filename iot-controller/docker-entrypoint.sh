#!/bin/sh
set -e

# Generate env.js from template with runtime environment variables
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

echo "Generated env.js with HA_URL=${HA_URL}"

# Execute the CMD
exec "$@"
