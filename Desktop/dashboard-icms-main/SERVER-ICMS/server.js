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

app.use(cors({ origin: '*' }));

const API_TESOURO = 'http://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo?an_exercicio=2023&nr_periodo=6&co_tipo_demonstrativo=RREO&id_ente=41';

const meses = ["Dezembro", "Novembro", "Outubro", "Setembro", "Agosto", "Julho", "Junho", "Maio", "Abril", "Março", "Fevereiro", "Janeiro"];

function convertColunaToMes(coluna) {
    console.log("Convertendo coluna:", coluna);
    const match = coluna.match(/MR-(\d+)/);
    if (match) {
        const index = parseInt(match[1], 10);
        return meses[index] || coluna;
    } else if (coluna === '<MR>') {
        return meses[0];
    }
    return coluna;
}

async function fetchData(apiUrl) {
    try {
        console.log("Buscando dados da API:", apiUrl);
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} - ${res.statusText}`);
        const json = await res.json();
        console.log("Dados recebidos:", json.items.length);
        return json.items || [];
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
        return [];
    }
}

// Função para filtrar os dados relevantes e arredondar os valores numéricos
function filterData(data) {
    return data.filter(row =>
        row.anexo === 'RREO-Anexo 03' &&
        row.conta === 'ICMS' &&
        row.coluna !== 'PREVISÃO ATUALIZADA 2023' &&
        row.coluna !== 'TOTAL (ÚLTIMOS 12 MESES)'
    ).map(row => {
        // Arredonda os valores numéricos
        const arredondarValores = (value) => {
            if (typeof value === 'number') {
                return Math.round(value);
            }
            return value;
        };

        return {
            ...row,
            coluna: convertColunaToMes(row.coluna),
            // Aqui, você pode adicionar mais colunas a serem arredondadas se necessário
            valor: arredondarValores(row.valor), // Exemplo de arredondamento da coluna 'valor'
        };
    });
}


async function updateTesouroData() {
    console.log('Atualizando dados do Tesouro...');
    const dataTesouro = await fetchData(API_TESOURO);
    console.log("🔍 Dados brutos do Tesouro:", dataTesouro.length);
    const filteredTesouro = filterData(dataTesouro);
    console.log("📌 Dados filtrados do Tesouro:", filteredTesouro.length);
    saveToCSV(filteredTesouro, CSV_FILE_TESOURO);
}

function saveToCSV(data, filename) {
    console.log("Salvando dados no CSV:", filename);
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
    }).map(row => {
        console.log("Convertendo linha do CSV para JSON:", row);
        return {
            ...row,
            valor: typeof row.valor === 'string' ? parseFloat(row.valor.replace(/\./g, '').replace(',', '.')) || 0 : row.valor
        };
    });
}

app.get('/dados-json', (req, res) => {
    console.log("Endpoint /dados-json acessado");
    res.setHeader('Content-Type', 'application/json');
    const jsonTesouro = csvToJson(CSV_FILE_TESOURO);
    const jsonSiconfi = csvToJson(CSV_FILE_SICONFI);
    res.json([...jsonTesouro, ...jsonSiconfi]);
});

app.get('/dados-json-tesouro', (req, res) => {
    console.log("Endpoint /dados-json-tesouro acessado");
    res.setHeader('Content-Type', 'application/json');
    res.json(csvToJson(CSV_FILE_TESOURO));
});

app.get('/dados-json-siconfi', (req, res) => {
    console.log("Endpoint /dados-json-siconfi acessado");
    res.setHeader('Content-Type', 'application/json');
    res.json(csvToJson(CSV_FILE_SICONFI));
});

cron.schedule('0 */6 * * *', updateTesouroData);

app.get('/download-csv-tesouro', (req, res) => {
    console.log("Download do CSV Tesouro solicitado");
    if (fs.existsSync(CSV_FILE_TESOURO)) {
        return res.download(CSV_FILE_TESOURO);
    } else {
        return res.status(500).send('CSV do Tesouro ainda não foi gerado.');
    }
});

app.get('/download-csv-siconfi', (req, res) => {
    console.log("Download do CSV SICONFI solicitado");
    if (fs.existsSync(CSV_FILE_SICONFI)) {
        return res.download(CSV_FILE_SICONFI);
    } else {
        return res.status(500).send('CSV do SICONFI ainda não foi gerado.');
    }
});

updateTesouroData();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
