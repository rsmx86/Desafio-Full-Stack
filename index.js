const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuração da conexão com o MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'N$%2EaY1PTqpeu.@j62+',
  database: 'user_management'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err);
  } else {
    console.log('Conectado ao banco de dados MySQL');
  }
});

// Middleware para interpretar JSON
app.use(express.json());

// Rota para criar um novo usuário
app.post('/users', (req, res) => {
  const { full_name, cpf, email, phone, role } = req.body;

  const query = `INSERT INTO users (full_name, cpf, email, phone, role) VALUES (?, ?, ?, ?, ?)`;

  connection.query(query, [full_name, cpf, email, phone, role], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Usuário ou E-mail já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
    res.status(201).json({ message: 'Usuário criado com sucesso', userId: results.insertId });
  });
});

// Rota de exemplo
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
  
    const query = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao consultar usuário' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.status(200).json(results[0]);
    });
  });
  app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { full_name, cpf, email, phone, role } = req.body;
  
    const query = `
      UPDATE users 
      SET full_name = ?, cpf = ?, email = ?, phone = ?, role = ? 
      WHERE id = ?
    `;
  
    connection.query(query, [full_name, cpf, email, phone, role, userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    });
  });
  app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
  
    const query = 'DELETE FROM users WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao deletar usuário' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.status(200).json({ message: 'Usuário deletado com sucesso' });
    });
  });

// Rota para atualizar um usuário existente pelo ID
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { full_name, cpf, email, phone, role } = req.body;
  
    const query = `
      UPDATE users
      SET full_name = ?, cpf = ?, email = ?, phone = ?, role = ?
      WHERE id = ?
    `;
  
    connection.query(query, [full_name, cpf, email, phone, role, userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    });
  });
// Função para validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g,''); // Remove caracteres não numéricos
  
    if(cpf.length !== 11 || 
      cpf === "00000000000" || 
      cpf === "11111111111" || 
      cpf === "22222222222" || 
      cpf === "33333333333" || 
      cpf === "44444444444" || 
      cpf === "55555555555" || 
      cpf === "66666666666" || 
      cpf === "77777777777" || 
      cpf === "88888888888" || 
      cpf === "99999999999") {
        return false;
    }
  
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
  
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
  
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
    return true;
  }
  