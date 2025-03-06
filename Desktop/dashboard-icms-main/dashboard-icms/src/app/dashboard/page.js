'use client'; // Indica que este é um componente do lado do cliente

import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto'; // Importa automaticamente as dependências necessárias do Chart.js

// Define a URL da API (pode ser sobrescrita pela variável de ambiente)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dashboard-icms.onrender.com';

export default function Dashboard() {
  const [dadosTesouro, setDadosTesouro] = useState([]); // Estado para armazenar os dados do Tesouro
  const [dadosSiconfi, setDadosSiconfi] = useState([]); // Estado para armazenar os dados do SICONFI
  const [carregando, setCarregando] = useState(true); // Estado para indicar carregamento dos dados

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Faz as requisições para buscar os dados
        const resTesouro = await fetch(`${API_BASE_URL}/dados-json-tesouro`);
        const resSiconfi = await fetch(`${API_BASE_URL}/dados-json-siconfi`);

        if (!resTesouro.ok || !resSiconfi.ok) throw new Error('Erro ao buscar dados');

        const tesouro = await resTesouro.json();
        const siconfi = await resSiconfi.json();

        // Processa os dados antes de salvar no estado
        setDadosTesouro(Array.isArray(tesouro) ? processarDados(tesouro) : {});
        setDadosSiconfi(Array.isArray(siconfi) ? processarDados(siconfi) : {});
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      } finally {
        setCarregando(false); // Indica que os dados já foram carregados
      }
    };

    fetchData();
  }, []);

  // Converte os identificadores de colunas em nomes de meses
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

//Processa os dados
  const processarDados = (dados) => {
    return dados.reduce((acc, { coluna, valor }) => {
      const mes = convertColunaToMes(coluna);
      acc[mes] = (acc[mes] || 0) + (parseInt(valor) || 0);
      return acc;
    }, {});
  };


  // Define os meses e extrai os valores para os gráficos
  const mesesMR = ['MR-11', 'MR-10', 'MR-09', 'MR-08', 'MR-07', 'MR-06', 'MR-05', 'MR-04', 'MR-03', 'MR-02', 'MR-01'];
  const meses = mesesMR.map(convertColunaToMes).filter((m) => dadosTesouro[m] || dadosSiconfi[m]);
  const valoresTesouro = meses.map((m) => arredondarValor(dadosTesouro[m] || 0));
  const valoresSiconfi = meses.map((m) => arredondarValor(dadosSiconfi[m] || 0));
  const valoresGastos = valoresTesouro.map((val, i) => arredondarValor(Math.abs(val - valoresSiconfi[i])));

  // Calcula totais para exibir no dashboard
  const totalTesouro = arredondarValor(valoresTesouro.reduce((acc, val) => acc + val, 0));
  const totalSiconfi = arredondarValor(valoresSiconfi.reduce((acc, val) => acc + val, 0));
  const diferencaTotal = arredondarValor(Math.abs(totalTesouro - totalSiconfi));

  const formatarValor = (valor) => {
    const numero = Number(valor); // Converte para número
    if (isNaN(numero)) return "Valor inválido"; // Verifica se é um número válido
    
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(numero);
  }; //formata o valor pra BRL

  const totalTesouroFormatado = formatarValor(totalTesouro);
  const totalSiconfiFormatado = formatarValor(totalSiconfi);
  const diferencaTotalFormatado = formatarValor(diferencaTotal);

  // Configuração do gráfico de barras
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

  return (
    <div style={{ maxWidth: '90%', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ margin: '40px 0' }}>Dashboard ICMS</h1>
      {carregando ? <p>Carregando dados...</p> : (
        <>
          <h2 style={{ marginBottom: '20px' }}>Valor Total Arrecadado</h2>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
            <div style={{ width: '300px' }}>
              <Pie data={{ labels: ['Tesouro'], datasets: [{ data: [totalTesouro], backgroundColor: ['rgba(54, 162, 235, 0.6)'] }] }} />
              <h2 styl
