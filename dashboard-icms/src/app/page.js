"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard() {
  // Aqui estou criando estados para armazenar os dados vindos do backend e um para saber se os dados ainda estão carregando
  const [dadosTesouro, setDadosTesouro] = useState([]);
  const [dadosSiconfi, setDadosSiconfi] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Função assíncrona que busca os dados do backend
    async function fetchData() {
      try {
        // Busco os dados de duas fontes diferentes
        const resTesouro = await fetch("http://localhost:3000/dados-json-tesouro");
        const resSiconfi = await fetch("http://localhost:3000/dados-json-siconfi");

        // Converto a resposta para JSON
        const tesouro = await resTesouro.json();
        const siconfi = await resSiconfi.json();

        // Processo os dados recebidos e salvo no estado
        setDadosTesouro(processarDados(tesouro));
        setDadosSiconfi(processarDados(siconfi));
        setCarregando(false); // Paro de exibir a mensagem de carregamento
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
        setCarregando(false);
      }
    }

    fetchData();
  }, []); // O useEffect roda apenas uma vez, ao montar o componente

  // Essa função converte os códigos de coluna para os nomes dos meses correspondentes
  function convertColunaToMes(coluna) {
    const meses = {
      "MR-11": "Dezembro",
      "MR-10": "Novembro",
      "MR-09": "Outubro",
      "MR-08": "Setembro",
      "MR-07": "Agosto",
      "MR-06": "Julho",
      "MR-05": "Junho",
      "MR-04": "Maio",
      "MR-03": "Abril",
      "MR-02": "Março",
      "MR-01": "Fevereiro",
    };
    return meses[coluna] || coluna; // Se não encontrar, mantém o valor original
  }

  // Aqui estou pegando os dados recebidos e organizando eles por mês, somando os valores
  function processarDados(dados) {
    const resultado = {};
    dados.forEach(({ coluna, valor }) => {
      const mes = convertColunaToMes(coluna);
      if (!resultado[mes]) resultado[mes] = 0; // Se não existir o mês no objeto, inicializa com zero
      resultado[mes] += parseFloat(valor) || 0; // Converte o valor para número e soma
    });
    return resultado;
  }

  // Lista com os meses em ordem de referência
  const mesesMR = ["MR-11", "MR-10", "MR-09", "MR-08", "MR-07", "MR-06", "MR-05", "MR-04", "MR-03", "MR-02", "MR-01"];
  const meses = mesesMR.map(convertColunaToMes).filter(m => dadosTesouro[m] || dadosSiconfi[m]);

  // Extraio os valores organizados por mês para alimentar o gráfico
  const valoresTesouro = meses.map(m => dadosTesouro[m] || 0);
  const valoresSiconfi = meses.map(m => dadosSiconfi[m] || 0);
  const valoresGastos = meses.map((m, i) => Math.abs(valoresTesouro[i] - valoresSiconfi[i])); // Diferença entre os valores para calcular os gastos

  // Calculo os totais de cada fonte de dados
  const totalTesouro = valoresTesouro.reduce((acc, val) => acc + val, 0);
  const totalSiconfi = valoresSiconfi.reduce((acc, val) => acc + val, 0);
  const totalGastos = valoresGastos.reduce((acc, val) => acc + val, 0);

  // Estrutura de dados para o gráfico de barras
  const data = {
    labels: meses,
    datasets: [
      {
        label: "Tesouro Nacional",
        data: valoresTesouro,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "SICONFI",
        data: valoresSiconfi,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Valor Gasto",
        data: valoresGastos,
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
    ],
  };

  return (
    <div style={{ width: "80%", margin: "auto", textAlign: "center" }}>
      <h1>Comparação ICMS Tesouro x SICONFI</h1>
      <h3>Comparação por Mês</h3>
      {carregando ? <p>Carregando...</p> : <Bar data={data} />}
      <div style={{ marginTop: "20px", fontSize: "18px" }}>
        <p><strong>Total Tesouro:</strong> {totalTesouro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <p><strong>Total SICONFI:</strong> {totalSiconfi.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        <p><strong>Total Gastos:</strong> {totalGastos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
      </div>
    </div>
  );
}
