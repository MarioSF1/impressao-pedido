import { Router } from 'express';
import type { Request, Response } from 'express';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs/promises'; // Usaremos a versão com Promises do File System
import puppeteer from 'puppeteer';

import { Order } from '../types/Order';

const router = Router();

const processPrint = async (order: Order) => {
    console.log(`Iniciando processamento do perdido #${order.number_order}`);

    try {
        if (!order.holding.client_id || !order.enterprise.client_id) {
            console.error(`Pedido #${order.number_order} cliente não possui documento para criar a pasta.`);
            return null;
        }
        // 1. Renderizar o HTML usando o template EJS
        const templatePath = path.join(__dirname, '..', 'views', 'order-template.ejs');
        const htmlRenderizado = await ejs.renderFile(templatePath, { order: order });

        // 2. Definir os caminhos dinâmicos
        const dirPath = path.join(process.cwd(), 'assets', order.holding.client_id, order.enterprise.client_id, 'order', 'print');
        const filePath = path.join(dirPath, `${order.number_order}.pdf`);

        // 3. Criar a estrutura de pastas se não existir
        await fs.mkdir(dirPath, { recursive: true });

        // 4. Gerar o PDF a partir do HTML
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlRenderizado, { waitUntil: 'networkidle0' });

        // Ajuste as dimensões para um cupom de 80mm
        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { // Define as margens da página (opcional)
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        }); 

        await browser.close();

        console.log(`PDF do order #${order.number_order} salvo em: ${filePath}`);

        return filePath;

    } catch (error) {
        console.error("###########################################");
        console.error("### ERRO CRÍTICO DENTRO DE processPrint ###");
        console.error("###########################################");
        
        console.error(error); 

        return null;
    }
};

const getPrint = async (holding_client_id: string, enterprise_client_id: string, order_number: string, res: Response) => {
    // assest/[holding_client_id]/[enterprise_client_id]/order/print/[number_order]
    try {
        if (!holding_client_id || !enterprise_client_id || !order_number) {
            console.error(`Pedido #${order_number}, falta informações para obter a impressão.`);
            return; 
        }

        // 2. Definir os caminhos dinâmicos
        const dirPath = path.join(process.cwd(), 'assets', holding_client_id, enterprise_client_id, 'order', 'print');
        const filePath = path.join(dirPath, `${order_number}.pdf`);

        res.download(filePath, (err) => {
            if (err) {
                console.error("Erro ao baixar o arquivo:", err);
                if (!res.headersSent) {
                    res.status(404).send('Arquivo não encontrado.');
                }
            }
        });

    } catch (error) {
        console.error('Erro inesperado na função getPrint:', error);
        
        if (!res.headersSent) {
            res.status(500).send('Erro interno ao processar o arquivo.');
        }
    }
}

router.post('/print', async (req: Request, res: Response) => {
    const dadosDoPedido: Order = req.body;

    // ----- INÍCIO DO BLOCO DE DEPURAÇÃO -----
    console.log("Recebido payload para impressão:", JSON.stringify(dadosDoPedido, null, 2));

    if (!dadosDoPedido) {
        console.error("FALHA NA VALIDAÇÃO: O corpo da requisição (dadosDoPedido) está vazio.");
        return res.status(400).json({ success: false, mensagem: 'Corpo da requisição vazio.' });
    }
    if (!dadosDoPedido.id) {
        console.error("FALHA NA VALIDAÇÃO: dadosDoPedido.id está faltando ou é nulo/zero.", dadosDoPedido.id);
        return res.status(400).json({ success: false, mensagem: 'ID do pedido é obrigatório.' });
    }
    if (!dadosDoPedido.client?.document) {
        console.error("FALHA NA VALIDAÇÃO: dadosDoPedido.client.document está faltando.", dadosDoPedido.client);
        return res.status(400).json({ success: false, mensagem: 'Documento do cliente é obrigatório.' });
    }
    if (!dadosDoPedido.holding?.client_id) {
        console.error("FALHA NA VALIDAÇÃO: dadosDoPedido.holding.client_id está faltando.", dadosDoPedido.holding);
        return res.status(400).json({ success: false, mensagem: 'Client ID da Holding é obrigatório.' });
    }
    if (!dadosDoPedido.enterprise?.client_id) {
        console.error("FALHA NA VALIDAÇÃO: dadosDoPedido.enterprise.client_id está faltando.", dadosDoPedido.enterprise);
        return res.status(400).json({ success: false, mensagem: 'Client ID da Empresa é obrigatório.' });
    }
    if (!dadosDoPedido.number_order) {
        console.error("FALHA NA VALIDAÇÃO: dadosDoPedido.number_order está faltando ou é nulo/zero.", dadosDoPedido.number_order);
        return res.status(400).json({ success: false, mensagem: 'Número do pedido é obrigatório.' });
    }

    // ----- FIM DO BLOCO DE DEPURAÇÃO -----

    try {
        const filePath = await processPrint(dadosDoPedido);
        // 3. Verifica se a criação do PDF foi bem-sucedida
        if (filePath) {
            // 4. Constrói a URL pública
            // Pega a parte do caminho a partir da pasta 'assets'
            const relativePath = path.relative(path.join(process.cwd(), 'assets'), filePath);
            
            // Constrói a URL final usando o host da requisição e o prefixo estático
            const fileUrl = `${req.protocol}://${req.get('host')}/static/${relativePath.replace(/\\/g, '/')}`;

            // 5. Retorna a resposta de sucesso com a URL
            res.status(200).json({
                success: true,
                mensagem: 'PDF gerado com sucesso.',
                url: fileUrl
            });
        } else {
            res.status(500).json({ success: false, mensagem: 'Falha ao gerar o arquivo PDF.' });
        }
    } catch (error) {
        console.error("Erro crítico na rota /print:", error);
        res.status(500).json({ success: false, mensagem: 'Ocorreu um erro interno no servidor.' });
    }
});

router.get('/download', (req: Request, res: Response) => {
    const { holding_client_id, enterprise_client_id, order_number } = req.query;

    if (!holding_client_id || !enterprise_client_id || !order_number) {
        return res.status(400).json({ success: false, mensagem: 'Dados do pedido inválidos.' });
    }
    // assest/[holding_client_id]/[enterprise_client_id]/order/print/[number_order]
    getPrint(holding_client_id as string, enterprise_client_id as string, order_number as string, res);

});

export default router;