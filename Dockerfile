FROM oven/bun:1.1.8-alpine

WORKDIR /usr/src/app

COPY package.json .

COPY bun.lockb .

RUN bun install

COPY . .

CMD [ "bun" ,"run", "dev" ]

