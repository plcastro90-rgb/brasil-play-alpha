const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuração de Pool para evitar perda de conexão por inatividade
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let db;

function handleDisconnect() {
  db = mysql.createPool(dbConfig);
  
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL do SA-MP (tentando novamente em 5s):', err);
      setTimeout(handleDisconnect, 5000);
    } else {
      console.log('Conectado ao banco de dados do SA-MP com sucesso!');
      connection.release();
    }
  });

  db.on('error', (err) => {
    console.error('Erro inesperado no MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

// Rota de Login
app.post('/api/login', (req, res) => {
  const { nick, pass } = req.body;

  if (!nick || !pass) {
    return res.json({ sucesso: false, mensagem: 'Preencha todos os campos.' });
  }

  const query = 'SELECT * FROM contas WHERE nome = ? AND senha = ?';

  db.query(query, [nick, pass], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }

    if (results.length > 0) {
      const user = results[0];
      res.json({
        sucesso: true,
        usuario: {
          nick: user.nome,
          id: user.id || 1492,
          rg: user.rg || 89210,
          dinheiro: user.dinheiro || 0,
          banco: user.banco || 0,
          level: user.level || 1,
          organizacao: user.org || 'Civil / Nenhum'
        }
      });
    } else {
      res.json({ sucesso: false, mensagem: 'Utilizador ou palavra-passe incorretos.' });
    }
  });
});

// Rota de Registo de Nova Conta
app.post('/api/register', (req, res) => {
  const { nick, pass } = req.body;

  if (!nick || !pass) {
    return res.json({ sucesso: false, mensagem: 'Preencha todos os campos para registar.' });
  }

  // Verifica se a conta já existe
  const checkQuery = 'SELECT * FROM contas WHERE nome = ?';
  db.query(checkQuery, [nick], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
    }

    if (results.length > 0) {
      return res.json({ sucesso: false, mensagem: 'Este nick já está registado.' });
    }

    // Insere a nova conta na base de dados
    const insertQuery = 'INSERT INTO contas (nome, senha, dinheiro, banco, level) VALUES (?, ?, 5000, 1000, 1)';
    db.query(insertQuery, [nick, pass], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar conta no banco de dados.' });
      }

      res.json({ sucesso: true, mensagem: 'Conta criada com sucesso! Faça login.' });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor UCP rodando na porta ${PORT}`);
});
