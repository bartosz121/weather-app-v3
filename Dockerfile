FROM denoland/deno:alpine-2.1.9 AS builder

ARG OPENWEATHERMAP_APPID

ARG GOOGLE_AI_API_KEY

ENV OPENWEATHERMAP_APPID=$OPENWEATHERMAP_APPID

ENV GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY

RUN apk add libstdc++

WORKDIR /app

COPY package.json deno.lock ./

RUN deno install

RUN deno install --allow-scripts=npm:sharp@0.33.5

COPY . .

RUN deno run build

FROM denoland/deno:alpine-2.1.9

WORKDIR /app

COPY --from=builder /app/build build/

COPY --from=builder /app/node_modules node_modules/

COPY package.json deno.lock /app/

EXPOSE 3000

CMD [ "deno", "run", "-REN", "build/index.js" ]

