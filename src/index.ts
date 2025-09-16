import express = require('express');
import type { Express, Request, Response } from 'express';
import pedidoRoutes from './routes/pedidoRoutes';
import path from 'path';

const app: Express = express();
const PORT: number = 3000;

// Middleware para entender JSON
app.use(express.json({ limit : '50mb'}));

/*// Rota de "saúde" da aplicação
app.get('/', (req: Request, res: Response) => {
    res.send('Servidor de impressão está no ar! Use POST /order/print para enviar um pedido.');
});*/

// Cria uma rota virtual '/static' que serve os arquivos da pasta 'assets'
app.use('/static', express.static(path.join(process.cwd(), 'assets')));

// Usa as rotas de pedido com o prefixo /pedidos
app.use('/api/v1/order', pedidoRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando com TypeScript na porta ${PORT}`);
});