require('dotenv').config(); // REFERENTE AS VARIAVEIS DE AMBIENTE
const express = require('express');
const app = express();

const mongoose = require('mongoose');
const {checkCsrfError, csrfMiddleware} = require('./src/middlewares/middleware');
mongoose.connect(process.env.CONNECTIONSTRING)
.then(() => {
        app.emit("conected");
})
.catch(e => {
        console.log(e);
});

const session = require('express-session'); //referente as sessões do cliente (Salvar cookie para manter logado)
const MongoStore = require('connect-mongo'); //Para salvar as sessões na base de dados
const flash = require('connect-flash'); //Para mensagens autodestrutivas (ao ler irão sumir da base de dados)

var bodyParser  = require('body-parser');
const routes = require('./routes'); //Para usar as rotas da aplicação
const path = require('path'); //para pegar os caminhos das pastas
const csrf = require('csurf'); //para criar tokens para envio de formulários (garantindo a segurança para que nada externo envie dados ou comandos para o server)

const helmet = require('helmet'); //olhar a documentação (sobre segurança)

app.use(bodyParser.urlencoded());

app.use(express.static(path.resolve(__dirname, 'public')));

app.use(helmet());

app.use(csrf())
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);
app.use(bodyParser.json());

const sessionOptions = session({
        secret: 'a9dnrh298djc(ued#$kdio',
        store: MongoStore.create({mongoUrl: process.env.CONNECTIONSTRING}),
        resave: false,
        saveUninitialized: false,
        cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true
        }
})
app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views') );
app.set('view engine', 'ejs');

app.on('conected', () => {
        app.listen(3000, () => {
                console.log("Executando o servidor");
                console.log("http://localhost:3000");
        });
});
