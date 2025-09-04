import { Router } from 'express';
import type { Request, Response } from 'express';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises'; // Usaremos a versão com Promises do File System
import puppeteer from 'puppeteer';

import { Order } from '../types/Order';

const router = Router();

const processarImpressao = async (order: Order) => {
    console.log(`Iniciando processamento do perdido #${order.id}`);
    console.log('Pedido enviado para a impressora (simulação).');

    try {
        if (!order.holding.client_id || !order.enterprise.client_id) {
            console.error(`Pedido #${order.id} cliente não possui documento para criar a pasta.`);
            return; // Para a execução desta função
        }
        // 1. Renderizar o HTML usando o template EJS
        const templatePath = path.join(__dirname, '..', 'views', 'order-template.ejs');
        const htmlRenderizado = await ejs.renderFile(templatePath, { order: order });

        // 2. Definir os caminhos dinâmicos
        // const sanitizedDocument = order.client.document.replace(/\D/g, ''); // Remove caracteres não numéricos
        const dirPath = path.join(process.cwd(), 'assets', order.holding.client_id, order.enterprise.client_id, 'pedidos', 'impressao');
        const filePath = path.join(dirPath, `${order.number_order}.pdf`);

        // 3. Criar a estrutura de pastas se não existir
        await fs.mkdir(dirPath, { recursive: true });

        // 4. Gerar o PDF a partir do HTML
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(htmlRenderizado, { waitUntil: 'networkidle0' });

        // Ajuste as dimensões para um cupom de 80mm
        await page.pdf({
            path: filePath,
            format: 'A4', // Define o formato da página como A4
            printBackground: true,
            margin: { // Define as margens da página (opcional)
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        }); 

        await browser.close();

        console.log(`PDF do order #${order.id} salvo em: ${filePath}`);

    } catch (error) {
        if (error instanceof Error) {
            // Erro genérico
            console.error('Erro inesperado ao notificar API externa:', error.message);
        } else {
            // Caso algo totalmente inesperado seja lançado
            console.error('Ocorreu um erro desconhecido e não padrão:', error);
        }
    }
};

router.post('/imprimir', (req: Request, res: Response) => {
    const dadosDoPedido: Order = req.body;

    if (!dadosDoPedido || !dadosDoPedido.id || !dadosDoPedido.client.document) {
        return res.status(400).json({ status: 'erro', mensagem: 'Dados do order inválidos. ID e Documento do cliente são obrigatórios.' });
    }

    processarImpressao(dadosDoPedido);

    res.status(202).json({
        success: true,
        mensagem: 'Pedido recebido e está sendo processado para impressão.'
    });
});

export default router;