# Auth Microservice

Microsserviço de autenticação desenvolvido com Node.js 22, Fastify, TypeScript e PASETO. 

## Funcionalidades

- 🔐 Autenticação com PASETO tokens
- 👥 Gerenciamento de usuários
- 🔑 Sistema de níveis de acesso
- 👨‍👩‍👧‍👦 Grupos de usuários
- 🔒 Verificação de permissões
- 📊 Health checks
- 🐳 Containerização com Docker
- 📚 Documentação automática com Swagger

## Tecnologias

- **Node.js 22** - Runtime JavaScript
- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Tipagem estática
- **PASETO** - Tokens de autenticação seguros
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e armazenamento de tokens
- **Drizzle ORM** - ORM para PostgreSQL
- **Zod** - Validação de esquemas
- **Docker** - Containerização

## Estrutura do Projeto

```
src/
├── config/         # Configurações da aplicação
├── db/            # Configuração do banco de dados e schemas
├── middleware/    # Middlewares de autenticação
├── routes/        # Definição das rotas
├── schemas/       # Esquemas de validação Zod
├── services/      # Serviços de negócio
├── app.ts         # Configuração do Fastify
└── index.ts       # Ponto de entrada da aplicação
```

## Rotas da API

### Autenticação (`/auth`)
- `POST /auth/login` - Login de usuário
- `POST /auth/refresh` - Renovação de token
- `POST /auth/logout` - Logout
- `POST /auth/check-permission` - Verificar permissão específica
- `POST /auth/check-permissions` - Verificar múltiplas permissões
- `POST /auth/check-group` - Verificar se usuário pertence a um grupo
- `GET /auth/profile` - Obter perfil do usuário autenticado

### Usuários (`/users`)
- `POST /users` - Criar usuário
- `GET /users` - Listar usuários
- `GET /users/:id` - Obter usuário específico
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `GET /users/:id/groups` - Listar grupos do usuário

### Grupos (`/users/groups`)
- `POST /users/groups` - Criar grupo
- `GET /users/groups` - Listar grupos
- `PUT /users/groups/:id` - Atualizar grupo
- `DELETE /users/groups/:id` - Deletar grupo
- `POST /users/assign-group` - Atribuir usuário a grupo
- `POST /users/remove-group` - Remover usuário de grupo

### Níveis de Acesso (`/access-levels`)
- `POST /access-levels` - Criar nível de acesso
- `GET /access-levels` - Listar níveis de acesso
- `GET /access-levels/:id` - Obter nível específico
- `PUT /access-levels/:id` - Atualizar nível de acesso
- `DELETE /access-levels/:id` - Deletar nível de acesso

### Health Check (`/health`)
- `GET /health` - Status geral da aplicação
- `GET /health/ready` - Verificar se a aplicação está pronta
- `GET /health/live` - Verificar se a aplicação está viva

## Configuração

### Variáveis de Ambiente

Copie o arquivo `env.example` para `.env` e configure as variáveis:

```bash
cp env.example .env
```

### Instalação

```bash
# Instalar dependências
npm install

# Executar migrações do banco
npm run migration:generate
npm run migration:run

# Executar em modo desenvolvimento
npm run dev

# Executar em modo produção
npm run build
npm start
```

## Docker

### Desenvolvimento Local

```bash
# Subir todos os serviços
docker-compose up -d

# Logs da aplicação
docker-compose logs -f app

# Parar serviços
docker-compose down
```

### Build de Produção

```bash
# Build da imagem
docker build -t auth-microservice .

# Executar container
docker run -p 3000:3000 auth-microservice
```

## Documentação da API

Acesse a documentação Swagger em: `http://localhost:3000/docs`

## Permissões

O sistema utiliza permissões baseadas em strings. Exemplos:

- `users.create` - Criar usuários
- `users.read` - Ler usuários
- `users.update` - Atualizar usuários
- `users.delete` - Deletar usuários
- `groups.create` - Criar grupos
- `groups.assign` - Atribuir usuários a grupos
- `access-levels.create` - Criar níveis de acesso

## Exemplo de Uso

### 1. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Verificar Permissão

```bash
curl -X POST http://localhost:3000/auth/check-permission \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "users.create"
  }'
```

### 3. Criar Usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "password123"
  }'
```

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build para produção
- `npm start` - Executar em produção
- `npm run lint` - Verificar código com ESLint
- `npm run test` - Executar testes
- `npm run migration:generate` - Gerar migrações
- `npm run migration:run` - Executar migrações

### Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## Deploy no Google Cloud Run

### Preparação

1. Configure o Google Cloud SDK
2. Configure as variáveis de ambiente no Cloud Run
3. Configure o banco PostgreSQL (Cloud SQL)
4. Configure o Redis (Memorystore)

### Deploy

```bash
# Build e push da imagem
gcloud builds submit --tag gcr.io/YOUR_PROJECT/auth-microservice

# Deploy no Cloud Run
gcloud run deploy auth-microservice \
  --image gcr.io/YOUR_PROJECT/auth-microservice \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.