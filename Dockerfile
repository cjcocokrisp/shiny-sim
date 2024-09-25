FROM golang:1.23 as build

WORKDIR /app

COPY . .

RUN go mod download
RUN go build -o ./src/api/ ./src/api/routes.go ./src/api/db.go

FROM node:22

COPY --from=build /app /app
    
WORKDIR /app

RUN npm install

EXPOSE 3000 8080

CMD [ "npm", "run", "container" ]

