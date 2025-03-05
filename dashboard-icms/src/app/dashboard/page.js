'use client';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dashboard-icms.onrender.com';

export default function Dashboard() {
  const [dadosTesouro, setDadosTesouro] = useState([]);
  const [dadosSiconfi, setDadosSiconfi] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTesouro = await fetch(`${API_BASE_URL}/dados-json-tesouro`);
        const resSiconfi = await fetch(`${API_BASE_URL}/dados-json-siconfi`);

        if (!resTesouro.ok || !resSiconfi.ok) throw new Error('Erro ao buscar dados');

        const tesouro = await resTesouro.json();
        const siconfi = await resSiconfi.json();

        setDadosTesouro(Array.isArray(tesouro) ? processarDados(tesouro) : {});
        setDadosSiconfi(Array.isArray(siconfi) ? processarDados(siconfi) : {});
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      } finally {
        setCarregando(false);
      }
    };

    fetchData();
  }, []);

  const convertColunaToMes = (coluna) => ({
    'MR-11': 'Dezembro',
    'MR-10': 'Novembro',
    'MR-09': 'Outubro',
    'MR-08': 'Setembro',
    'MR-07': 'Agosto',
    'MR-06': 'Julho',
    'MR-05': 'Junho',
    'MR-04': 'Maio',
    'MR-03': 'Abril',
    'MR-02': 'Março',
    'MR-01': 'Fevereiro',
  }[coluna] || coluna);

  const processarDados = (dados) => {
    return dados.reduce((acc, { coluna, valor }) => {
      const mes = convertColunaToMes(coluna);
      acc[mes] = (acc[mes] || 0) + (parseFloat(valor) || 0);
      return acc;
    }, {});
  };

  const mesesMR = ['MR-11', 'MR-10', 'MR-09', 'MR-08', 'MR-07', 'MR-06', 'MR-05', 'MR-04', 'MR-03', 'MR-02', 'MR-01'];
  const meses = mesesMR.map(convertColunaToMes).filter((m) => dadosTesouro[m] || dadosSiconfi[m]);
  const valoresTesouro = meses.map((m) => dadosTesouro[m] || 0);
  const valoresSiconfi = meses.map((m) => dadosSiconfi[m] || 0);
  const valoresGastos = valoresTesouro.map((val, i) => Math.abs(val - valoresSiconfi[i]));

  const totalTesouro = valoresTesouro.reduce((acc, val) => acc + val, 0);
  const totalSiconfi = valoresSiconfi.reduce((acc, val) => acc + val, 0);
  const diferencaTotal = Math.abs(totalTesouro - totalSiconfi);

  const dataBar = {
    labels: meses,
    datasets: [
      {
        label: 'Tesouro',
        data: valoresTesouro,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Siconfi',
        data: valoresSiconfi,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'Diferença',
        data: valoresGastos,
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

  const dataPie = {
    labels: ['Tesouro', 'Siconfi', 'Diferença'],
    datasets: [
      {
        data: [totalTesouro, totalSiconfi, diferencaTotal],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '90%', margin: '0 auto', textAlign: 'center' }}>
      <h1>Dashboard ICMS</h1>
      {carregando ? <p>Carregando dados...</p> : (
        <>
          <h2>Valor Total Arrecadado</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ width: '300px' }}>
              <Pie data={{ labels: ['Tesouro'], datasets: [{ data: [totalTesouro], backgroundColor: ['rgba(54, 162, 235, 0.6)'] }] }} />
            </div>
            <div style={{ width: '300px' }}>
              <Pie data={{ labels: ['Siconfi'], datasets: [{ data: [totalSiconfi], backgroundColor: ['rgba(255, 99, 132, 0.6)'] }] }} />
            </div>
            <div style={{ width: '300px' }}>
              <Pie data={{ labels: ['Diferença'], datasets: [{ data: [diferencaTotal], backgroundColor: ['rgba(255, 206, 86, 0.6)'] }] }} />
            </div>
          </div>
          <Bar data={dataBar} />
        </>
      )}
    </div>
  );
}