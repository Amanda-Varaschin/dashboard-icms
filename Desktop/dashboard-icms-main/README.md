# Dashboard ICMS - https://dashboard-icms.vercel.app/

Este projeto consiste em um sistema para coletar, processar e visualizar dados do ICMS a partir de APIs governamentais. O sistema é dividido em duas partes principais: um servidor backend e um dashboard frontend.

## Tecnologias Utilizadas

### Backend (SERVER-ICMS)

- **Plataforma:** Node.js
- **Framework:** Express.js
- **Bibliotecas:**
  - `node-fetch`: Para requisições HTTP
  - `json2csv`: Para conversão de JSON para CSV
  - `node-cron`: Para agendamento de tarefas
  - `csv-parse`: Para leitura de arquivos CSV
  - `cors`: Para permitir requisições do frontend

### Frontend (DASHBOARD-ICMS)

- **Plataforma:** Next.js (React)
- **Bibliotecas:**
  - `react-chartjs-2` e `chart.js`: Para gráficos
  - `js-cookie`: Para gerenciamento de cookies (autenticação)

---

## Estrutura do Projeto

### Backend (SERVER-ICMS)

```
server-icms/
├── server.js  # Servidor Express
├── dados_tesouro.csv  # Dados processados do Tesouro
├── dados_siconfi.csv  # Dados processados do SICONFI
├── package.json  # Dependências e scripts
└── ...
```

### Frontend (DASHBOARD-ICMS)

```
dashboard-icms/
├── app/
│   ├── layout.js        # Layout principal
│   ├── page.js          # Página inicial
│   ├── pages/
│   │   ├── dashboard.js # Dashboard de dados
│   │   ├── login.js     # Página de login
│   └── middleware.js    # Middleware de autenticação
├── package.json         # Dependências e scripts
└── ...
```

---

## Instalação e Configuração

### 1️⃣ Backend - SERVER-ICMS

```sh
# Clonar o repositório
$ git clone https://github.com/seu-repo/server-icms.git
$ cd server-icms

# Instalar dependências
$ npm install

# Iniciar o servidor
$ npm start
```

Por padrão, o backend roda na porta **3000**.

### 2️⃣ Frontend - DASHBOARD-ICMS

```sh
# Clonar o repositório
$ git clone https://github.com/seu-repo/dashboard-icms.git
$ cd dashboard-icms

# Criar um arquivo .env.local e definir a variável de API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Instalar dependências
$ npm install

# Iniciar o frontend
$ npm run dev
```

Por padrão, o frontend roda na porta **3001**.

---

## Funcionalidades

✅ **Coleta automática de dados** do Tesouro e SICONFI via API
✅ **Processamento e armazenamento** de dados em arquivos CSV
✅ **Dashboard interativo** com gráficos do ICMS
✅ **Autenticação básica** via cookies
✅ **Download de dados** em formato CSV

---

## Rotas Disponíveis

### Backend (Express)

- `GET /dados-json` → Retorna os dados processados (Tesouro + SICONFI)
- `GET /dados-json-tesouro` → Retorna apenas dados do Tesouro
- `GET /dados-json-siconfi` → Retorna apenas dados do SICONFI
- `GET /download-csv-tesouro` → Download do CSV do Tesouro
- `GET /download-csv-siconfi` → Download do CSV do SICONFI

### Frontend (Next.js)

- `/` → Página inicial
- `/login` → Tela de login
- `/dashboard` → Dashboard protegido por autenticação

---

## Segurança e Autenticação

O acesso ao `/dashboard` é protegido por um **middleware** que verifica se o cookie `auth=true` está presente. Caso contrário, o usuário é redirecionado para `/login`.

```js
// middleware.js
export function middleware(request) {
    const authCookie = request.cookies.get('auth');
    if (!authCookie || authCookie.value !== 'true') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}
```

---

## Contribuição

Caso queira contribuir, siga os passos:

1. Faça um fork do repositório
2. Crie uma nova branch (`feature-minha-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Minha nova funcionalidade'`)
4. Envie um pull request 🚀

---

## Licença

Projeto desenvolvido para fins educativos e aberto para melhorias.

📌 **Criado por Amanda Varaschin**
https://github.com/Amanda-Varaschin/dashboard-icms


