import express from 'express';
import fetch from 'node-fetch';
import { Parser } from 'json2csv';
import fs from 'fs';
import cors from 'cors';
import cron from 'node-cron';
import { parse } from 'csv-parse/sync';

const app = express();
const PORT = 3000;
const CSV_FILE_TESOURO = 'dados_tesouro.csv';
const CSV_FILE_SICONFI = 'dados_siconfi.csv';

const cors = require('cors');
app.use(cors({ origin: '*' })); // Permite acesso de qualquer origem

  
const API_TESOURO = 'http://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo?an_exercicio=2023&nr_periodo=6&co_tipo_demonstrativo=RREO&id_ente=41';
const API_SICONFI = 'https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo';

const meses = ["Dezembro", "Novembro", "Outubro", "Setembro", "Agosto", "Julho", "Junho", "Maio", "Abril", "Março", "Fevereiro", "Janeiro"];

function convertColunaToMes(coluna) {
    const match = coluna.match(/MR-(\d+)/);
    if (match) {
        const index = parseInt(match[1], 10);
        return meses[index] || coluna;
    }
    return coluna;
}

async function fetchData(apiUrl, params = {}) {
    try {
        const url = new URL(apiUrl);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} - ${res.statusText}`);
        const json = await res.json();
        return json.items || [];
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
        return [];
    }
}

function filterData(data) {
    return data.filter(row =>
        row.anexo === 'RREO-Anexo 03' &&
        row.conta === 'ICMS' &&
        row.coluna !== 'PREVISÃO ATUALIZADA 2023' &&
        row.coluna !== 'TOTAL (ÚLTIMOS 12 MESES)'
    ).map(row => ({
        ...row,
        coluna: convertColunaToMes(row.coluna)
    }));
}

async function processData() {
    console.log('Buscando dados do Tesouro e SICONFI...');

    const [dataTesouro, dataSiconfi] = await Promise.all([
        fetchData(API_TESOURO),
        fetchData(API_SICONFI, {
            an_exercicio: 2023,
            nr_periodo: 6,
            co_tipo_demonstrativo: 'RREO',
            id_ente: 41
        })
    ]);

    console.log("🔍 Dados brutos do Tesouro:", dataTesouro.length);
    console.log("🔍 Dados brutos do SICONFI:", dataSiconfi.length);

    const filteredTesouro = filterData(dataTesouro);
    const filteredSiconfi = filterData(dataSiconfi);

    console.log("📌 Dados filtrados do Tesouro:", filteredTesouro.length);
    console.log("📌 Dados filtrados do SICONFI:", filteredSiconfi.length);

    saveToCSV(filteredTesouro, CSV_FILE_TESOURO);
    saveToCSV(filteredSiconfi, CSV_FILE_SICONFI);
}

function saveToCSV(data, filename) {
    if (data.length > 0) {
        const parser = new Parser();
        fs.writeFileSync(filename, parser.parse(data));
        console.log(`✅ CSV ${filename} atualizado com sucesso!`);
    } else {
        console.error(`⚠️ Nenhum dado válido para ${filename}.`);
    }
}

function csvToJson(filename) {
    if (!fs.existsSync(filename)) return [];
    const fileContent = fs.readFileSync(filename, 'utf8');
    return parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
}

app.get('/dados-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const jsonTesouro = csvToJson(CSV_FILE_TESOURO);
    const jsonSiconfi = csvToJson(CSV_FILE_SICONFI);
    res.json([...jsonTesouro, ...jsonSiconfi]);
});

app.get('/dados-json-tesouro', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(csvToJson(CSV_FILE_TESOURO));
});

app.get('/dados-json-siconfi', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(csvToJson(CSV_FILE_SICONFI));
});

cron.schedule('0 */6 * * *', processData);

app.get('/download-csv-tesouro', (req, res) => {
    if (fs.existsSync(CSV_FILE_TESOURO)) {
        return res.download(CSV_FILE_TESOURO);
    } else {
        return res.status(500).send('CSV do Tesouro ainda não foi gerado.');
    }
});

app.get('/download-csv-siconfi', (req, res) => {
    if (fs.existsSync(CSV_FILE_SICONFI)) {
        return res.download(CSV_FILE_SICONFI);
    } else {
        return res.status(500).send('CSV do SICONFI ainda não foi gerado.');
    }
});

processData();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
