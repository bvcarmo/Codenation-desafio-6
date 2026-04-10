# SPA: App de Contatos - PARTE 2

## Objetivo:
O desafio é desenvolver um *SPA (Single Page Application)* de uma lista de contatos em **React** com as seguintes funcionalidades:

-  Consumir os dados de contato através de uma API Rest, usando a *Fetch API* do Javascript.
-  Busca de um contato aplicando filtro em **tempo real**.
-  Aplicar filtros de ordenação por *Nome*, *País*, *Empresa*, *Departamento* e *Data de Admissão*.

### API de Contatos:

GET: *https://5e82ac6c78337f00160ae496.mockapi.io/api/v1/contacts*

### Requisitos - Parte 2:

- Crie os *estados* do SPA.
- Consuma a *API de contatos* no *ciclo de vida correto* do componente.
- Implemente a **busca** para filtrar os contatos em tempo real.
- Implemente os filtros de ordenação por *Nome*, *País*, *Empresa*, *Departamento* e *Data de Admissão*.

### Dicas:

- Tudo pode ser resolvido em um único componente.
- O *estado* será mais complexo, ou seja, será um objeto com múltiplas *propriedades*.

### Iniciar o projeto:

- Instale as dependências do projeto com o comando *yarn install* ou *npm install*.
- Inicie o projeto com comando *yarn start* ou *npm start* / *npm run start*.

**Preview:**

[Contacts SPA](https://vimeo.com/414869096/55f4293a68)

## Tópicos:

Neste desafio você vai praticar os seus conhecimentos em:

- **React**
- **React - Ciclo de vida de componentes**
- **Modularização**
- **Fetch API**
- **JS:** *Array.map*, *Array.filter*, *Array.reduce*, *Array.find*, *Array.sort*

## API assíncrona de geração e compactação (Node.js 24)

Além do SPA, o projeto agora possui uma API HTTP em Node.js 24 para gerar arquivos e processá-los em fila de forma assíncrona.

### Executar API

```bash
npm run api:start
```

### Endpoints

- `GET /health` - healthcheck
- `POST /jobs` - cria um job e coloca na fila
- `GET /jobs/:id` - consulta status do job (`pending`, `processing`, `completed`, `failed`)
- `GET /jobs/:id/download` - baixa o `.zip` quando o job concluir

### Exemplo de criação de job

```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"files":[{"name":"a.txt","content":"A"},{"name":"b.txt","content":"B"}]}'
```

## Requisitos:

* **[Node v13.8.0](https://nodejs.org/en/)** - ou superior, instalado em seu computador.
* **[Create React App](https://github.com/facebook/create-react-app)**

## Screenshot de Referência

![](https://codenation-challenges.s3-us-west-1.amazonaws.com/react-14/screenshot.png)



