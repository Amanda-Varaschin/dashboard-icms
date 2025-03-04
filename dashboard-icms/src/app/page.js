"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dashboard-icms.onrender.com";

export default function Dashboard() {
  const [dadosTesouro, setDadosTesouro] = useState([]);
  const [dadosSiconfi, setDadosSiconfi] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const resTesouro = await fetch("https://dashboard-icms.onrender.com/dados-json-tesouro", {
          mode: "cors",
        });
        const resSiconfi = await fetch("https://dashboard-icms.onrender.com/dados-json-siconfi", {
          mode: "cors",
        });        

        if (!resTesouro.ok || !resSiconfi.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const tesouro = await resTesouro.json();
        const siconfi = await resSiconfi.json();

        setDadosTesouro(processarDados(Array.isArray(tesouro) ? tesouro : []));
        setDadosSiconfi(processarDados(Array.isArray(siconfi) ? siconfi : []));
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      } finally {
        setCarregando(false);
      }
    }

    fetchData();
  }, []);

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
    return meses[coluna] || coluna;
  }

  function processarDados(dados) {
    const resultado = {};
    dados.forEach(({ coluna, valor }) => {
      const mes = convertColunaToMes(coluna);
      if (!resultado[mes]) resultado[mes] = 0;
      resultado[mes] += parseFloat(valor) || 0;
    });
    return resultado;
  }

  const mesesMR = ["MR-11", "MR-10", "MR-09", "MR-08", "MR-07", "MR-06", "MR-05", "MR-04", "MR-03", "MR-02", "MR-01"];
  const meses = mesesMR.map(convertColunaToMes).filter(m => dadosTesouro[m] || dadosSiconfi[m]);

  const valoresTesouro = meses.map(m => dadosTesouro[m] || 0);
  const valoresSiconfi = meses.map(m => dadosSiconfi[m] || 0);
  const valoresGastos = meses.map((m, i) => Math.abs(valoresTesouro[i] - valoresSiconfi[i]));

  const totalTesouro = valoresTesouro.reduce((acc, val) => acc + val, 0);
  const totalSiconfi = valoresSiconfi.reduce((acc, val) => acc + val, 0);
  const totalGastos = valoresGastos.reduce((acc, val) => acc + val, 0);

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
