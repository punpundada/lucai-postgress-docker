FROM oven/bun:1.1.8-alpine as development

WORKDIR /usr/src/app

COPY package.json .

COPY bun.lockb .

RUN bun install

COPY . .

# CMD [ "bun" ,"run", "dev" ]
RUN bun run build

FROM oven/bun:1.1.8-alpine as production

ARG BUN_ENV=production
ENV BUN_ENV=${BUN_ENV}


WORKDIR /usr/src/app

COPY package.json .

COPY bun.lockb .

RUN bun install --production

COPY --from=development /usr/src/app/dist ./dist

CMD [ "bun" , "run", "dist/index.js" ]
