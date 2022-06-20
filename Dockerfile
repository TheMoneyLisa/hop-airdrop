# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
# syntax=docker/dockerfile:1

FROM node:14.17.4
ENV NODE_ENV=production

WORKDIR /app
COPY yarn.lock /app/
RUN yarn
COPY ./ /app/
# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
EXPOSE 3000
CMD ["npm","run","start"]