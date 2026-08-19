#!/usr/bin/with-contenv bashio
bashio::log.info "Starting Gridfinity Generator (nginx on :8099, via ingress)…"
exec nginx -g "daemon off;"
