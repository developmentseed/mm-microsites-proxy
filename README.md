# mm-microsites-proxy

Proxy calendar for Missing Maps microsites

## ⚙ Installation 

### Dependencies

- Node 7.6+
- Yarn Package Manager

```
# Install node dependencies
yarn
```

### Environment variables

- `PORT`: port that the http server listens on

## 🏃 Run the API

```
yarn start
```

The API runs by default at `http://localhost:3000` . To accept outside traffic, we recommend you run a reverse proxy (like Nginx) that forwards traffic to the server to the API. 
No ports need to be open other than web traffic ports `80` and `443` .

## 👷 Local Development 

```
yarn start-dev # starts the server and watches files for changes (nodemon)
yarn test # runs the linter
```

