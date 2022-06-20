# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
# syntax=docker/dockerfile:1

FROM node:14.17.4
ENV NODE_ENV=production

WORKDIR /app
COPY yarn.lock /app/
RUN yarn
COPY ./ /app/
EXPOSE 8080
CMD ["npm","run","start"]