import express from 'express'; // Framework web para Node.js
import fetch from 'node-fetch'; // Para fazer requisições HTTP
import { Parser } from 'json2csv'; // Para converter JSON em CSV
import fs from 'fs'; // Manipulação de arquivos
import cors from 'cors'; // Para permitir requisições de diferentes origens
import cron from 'node-cron'; // Agendamento de tarefas
import { parse } from 'csv-parse/sync'; // Para converter CSV em JSON

const app = express();
const PORT = 3000;
const CSV_FILE_TESOURO = 'dados_tesouro.csv';
const CSV_FILE_SICONFI = 'dados_siconfi.csv';

// Habilita CORS para permitir requisições de qualquer origem
app.use(cors({ origin: '*' }));

// URLs das APIs de onde pegamos os dados
const API_TESOURO = 'http://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo?an_exercicio=2023&nr_periodo=6&co_tipo_demonstrativo=RREO&id_ente=41';
const API_SICONFI = 'https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo';

// Array para converter os códigos dos meses em nomes legíveis
const meses = ["Dezembro", "Novembro", "Outubro", "Setembro", "Agosto", "Julho", "Junho", "Maio", "Abril", "Março", "Fevereiro", "Janeiro"];


function convertColunaToMes(coluna) {
    if (coluna === "<MR>") return "Dezembro"; // Caso específico para "MR" ser Dezembro
    
    const match = coluna.match(/^<MR-(\d+)>$/);
    if (match) {
        const index = parseInt(match[1], 10);
        if (index >= 1 && index <= 11) return meses[12 - (index + 1)]; // Ajuste para mapear corretamente os meses
    }
    
    return coluna; // Retorna o nome original caso não reconheça o padrão
}




// Função para buscar dados da API
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

// Função para filtrar os dados relevantes
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

// Função principal para buscar, filtrar e salvar os dados
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

// Função para salvar os dados filtrados em arquivos CSV
function saveToCSV(data, filename) {
    if (data.length > 0) {
        const parser = new Parser();
        fs.writeFileSync(filename, parser.parse(data));
        console.log(`✅ CSV ${filename} atualizado com sucesso!`);
    } else {
        console.error(`⚠️ Nenhum dado válido para ${filename}.`);
    }
}

// Função para converter CSV para JSON
function csvToJson(filename) {
    if (!fs.existsSync(filename)) return [];
    const fileContent = fs.readFileSync(filename, 'utf8');
    return parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
}

// Rota para retornar os dados em JSON
app.get('/dados-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const jsonTesouro = csvToJson(CSV_FILE_TESOURO);
    const jsonSiconfi = csvToJson(CSV_FILE_SICONFI);
    res.json([...jsonTesouro, ...jsonSiconfi]);
});

// Rota específica para os dados do Tesouro
app.get('/dados-json-tesouro', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(csvToJson(CSV_FILE_TESOURO));
});

// Rota específica para os dados do SICONFI
app.get('/dados-json-siconfi', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(csvToJson(CSV_FILE_SICONFI));
});

// Agendamento da atualização dos dados a cada 6 horas
cron.schedule('0 */6 * * *', processData);

// Rota para download do CSV do Tesouro
app.get('/download-csv-tesouro', (req, res) => {
    if (fs.existsSync(CSV_FILE_TESOURO)) {
        return res.download(CSV_FILE_TESOURO);
    } else {
        return res.status(500).send('CSV do Tesouro ainda não foi gerado.');
    }
});

// Rota para download do CSV do SICONFI
app.get('/download-csv-siconfi', (req, res) => {
    if (fs.existsSync(CSV_FILE_SICONFI)) {
        return res.download(CSV_FILE_SICONFI);
    } else {
        return res.status(500).send('CSV do SICONFI ainda não foi gerado.');
    }
});

// Executa a primeira coleta dos dados quando o servidor inicia
processData();

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
