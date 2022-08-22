/**
 * Métodos HTTP:
 * 
 * GET: Buscar informações do back-end
 * POST: Criar uma informação no back-end
 * PUT: Alterar uma informação no back-end
 * DELETE: Deletar uma informação no back-end
 */

/**
 * Tipos de parâmetros:
 * 
 * Query Params: Filtros e paginação
 * Route Params: Identificar recursos (Atualizar/Deletar)
 * Request Body: Conteúdo para criar ou editar  um recurso (JSON)
 */

/** Middleware:
 * 
 * Interceptador de requisições que pode interromper uma requisição
 * ou alterar dados de uma requisição 
*/

const express = require('express');
const { uuid, isUuid } = require('uuidv4');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
/** 
  A linha abaixo aplica o midlleware para todas as rotas iniciadas
  por /projects/:id (Alteração e deleção).
  Com ela poderia ser retirado o nome da função dos métodos put e delete
*/
app.use('/projects/:id', validateProjectId);

const projects = [];

// Função que mostra logs para exemplificar midlleware
function logRequests(request, response, next) {
  const {method, url} =request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.log(logLabel);

  next();

}

app.use(logRequests); // Chama a função (midlleware) logRequests

function validateProjectId(request, response, next){
  const { id } = request.params;

  if (!isUuid(id)) 
     return (response.status(400).json({ error: 'Invalid project ID. (Middleware)' }));

  return next();

}

// Listagem de projetos
app.get('/projects', (request, response) => {
  const { title, owner } = request.query;

  // Filtro (Query inserida no insomnia) por title
  results = title ?
    projects.filter(project => project.title.includes(title)) :
    projects;

  // Filtro (Query inserida no insomnia) por owner
  results = owner ?
    results.filter(project => project.owner.includes(owner)) :
    results;

  return response.json(results);
});

// Inclusão de projetos
app.post('/projects', (request, response) => {
  const { title, owner } = request.body;
  const id = uuid();

  const project = { id, title, owner };
  projects.push(project);

  return response.json(project);
});

// Alteração de projetos
app.put('/projects/:id', validateProjectId, (request, response) => {
  const { id } = request.params;
  const { title, owner } = request.body;

  projectIndex = projects.findIndex(project => project.id === id);

  if (projectIndex < 0) {
    return response.status(400).json({ error: 'Project not Found'});
  }

  const project = { id, title, owner };

  projects[projectIndex] = project;

  return response.json(project);
});

// Deleção de projetos
app.delete('/projects/:id', validateProjectId, (request, response) => {
  const { id } = request.params;

  projectIndex = projects.findIndex(project => project.id === id);

  if (projectIndex < 0) {
    return response.status(400).json({ error: 'Project not Found'});
  }

  projects.splice(projectIndex, 1);

  return response.json({ 'delete': 'Successfully' });

});

app.listen(3333, () => {
  console.log('Servidor iniciado.')
});