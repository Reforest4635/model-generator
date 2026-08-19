ARG BUILD_FROM
FROM ${BUILD_FROM}

# Bump this on every release to force the layers below to rebuild (matches the
# Hearth workflow). Docker also busts the COPY layer automatically when the
# contents of public/ change, but this makes intent explicit.
ARG CACHEBUST=2

RUN apk add --no-cache nginx \
    && mkdir -p /run/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY run.sh /run.sh
RUN chmod a+x /run.sh

# --- content below rebuilds when CACHEBUST or public/ changes ---
RUN echo "build ${CACHEBUST}"
COPY public/ /www/

CMD [ "/run.sh" ]
