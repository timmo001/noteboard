#!/usr/bin/with-contenv bash
# ==============================================================================
# Configures NGINX for use with Noteboard
# ==============================================================================
# Enable SSL
if [[ -z "$SSL_CERTFILE" ]]; then
    sed -i "s/%%certfile%%/${SSL_CERTFILE}/g" /etc/nginx/nginx-ssl.conf
    sed -i "s/%%keyfile%%/${SSL_KEYFILE}/g" /etc/nginx/nginx-ssl.conf
fi
