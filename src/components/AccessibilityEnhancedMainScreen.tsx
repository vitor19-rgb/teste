/**
 * Accessibility Enhanced MainScreen
 * Design profissional corporativo com WCAG 2.1 compliance
 */

import React, { useState, useEffect, useRef } from 'react';
import dataManager from '../core/DataManager';
import { formatCurrency, getCurrentPeriod, formatPeriod, getPreviousPeriod, getNextPeriod } from '../utils/formatters';

interface MainScreenProps {
  onNavigate: (screen: string) => void;
}

export const AccessibilityEnhancedMainScreen: React.FC<MainScreenProps> = ({ onNavigate }) => {
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());
  const [summary, setSummary] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Outros'
  });
  const [showSpendingAlert, setShowSpendingAlert] = useState(false);

  const user = dataManager.getCurrentUser();
  const categories = dataManager.getCategories();
  const formRef = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateSummary();
  }, [currentPeriod]);

  useEffect(() => {
    if (showSpendingAlert && alertRef.current) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Atenção! Seus gastos atingiram ${getSpendingPercentage().toFixed(1)}% da sua renda mensal.`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [showSpendingAlert]);

  const updateSummary = () => {
    const newSummary = dataManager.getFinancialSummary(currentPeriod);
    setSummary(newSummary);
    
    if (newSummary && newSummary.monthlyIncome > 0) {
      const spendingPercentage = (newSummary.totalExpenses / newSummary.monthlyIncome) * 100;
      setShowSpendingAlert(spendingPercentage >= 90);
    } else {
      setShowSpendingAlert(false);
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      announceToScreenReader('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const transactionData = {
      ...formData,
      date: currentPeriod + '-01'
    };

    const transaction = dataManager.addTransaction(transactionData);
    
    if (transaction) {
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Outros'
      });
      updateSummary();
      announceToScreenReader(`Transação adicionada: ${formData.description} - ${formatCurrency(parseFloat(formData.amount))}`);
      
      const descriptionField = formRef.current?.querySelector('[name="description"]') as HTMLInputElement;
      if (descriptionField) {
        descriptionField.focus();
      }
    }
  };

  const deleteTransaction = (transactionId: string, description: string) => {
    if (confirm(`Tem certeza que deseja excluir a transação "${description}"?`)) {
      if (dataManager.removeTransaction(transactionId)) {
        updateSummary();
        announceToScreenReader(`Transação "${description}" excluída com sucesso`);
      }
    }
  };

  const handleMonthlyIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    dataManager.setMonthlyIncome(currentPeriod, amount);
    updateSummary();
    announceToScreenReader(`Renda mensal atualizada para ${formatCurrency(amount)}`);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setCurrentPeriod(newPeriod);
    announceToScreenReader(`Período alterado para ${formatPeriod(newPeriod)}`);
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-gray-100 text-gray-800'
    ];
    
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getSpendingPercentage = () => {
    if (!summary || summary.monthlyIncome <= 0) return 0;
    return (summary.totalExpenses / summary.monthlyIncome) * 100;
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  if (!summary) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Alerta de Gastos - AJUSTADO PARA MOBILE */}
        {showSpendingAlert && (
          <div 
            ref={alertRef}
            className="alert-container bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-6 mb-4 sm:mb-6 rounded-2xl shadow-xl border border-red-500 mt-12 sm:mt-0"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 sm:mr-4">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full">
                  <svg 
                    className="h-5 w-5 sm:h-6 sm:w-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-lg font-bold mb-1">⚠️ Alerta Financeiro</h3>
                <p className="text-xs sm:text-base">
                  Seus gastos atingiram {getSpendingPercentage().toFixed(1)}% da sua renda mensal. 
                  {getSpendingPercentage() >= 100 ? ' Você ultrapassou sua renda!' : ' Monitore seus gastos para manter o equilíbrio financeiro.'}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2 sm:ml-3">
                <button
                  onClick={() => setShowSpendingAlert(false)}
                  className="text-white hover:text-red-200 transition-colors p-1"
                  aria-label="Fechar alerta de gastos"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header - MELHORADO PARA MOBILE */}
        <header className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-8 mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center flex-1 min-w-0">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mr-3 sm:mr-4 flex-shrink-0 shadow-lg">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">OrçaMais</h1>
                <p className="text-slate-600 text-sm sm:text-base truncate">Olá, {user?.profile?.name}! 👋</p>
              </div>
            </div>
            
            {/* NAVEGAÇÃO MELHORADA PARA MOBILE */}
            <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0" aria-label="Navegação principal">
              <button
                onClick={() => onNavigate('summary')}
                className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform min-w-[44px] min-h-[44px]"
                aria-label="Ver resumo financeiro detalhado"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span className="hidden sm:inline">Relatórios</span>
              </button>
              
              <button
                onClick={() => {
                  dataManager.logout();
                  onNavigate('auth');
                }}
                className="flex items-center justify-center text-slate-600 hover:text-slate-800 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 min-w-[44px] min-h-[44px]"
                aria-label="Sair da conta"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span className="hidden sm:inline">Sair</span>
              </button>
            </nav>
          </div>

          {/* Period Navigation */}
          <div className="flex items-center justify-center mb-6 sm:mb-8" role="group" aria-label="Navegação de período">
            <button
              onClick={() => handlePeriodChange(getPreviousPeriod(currentPeriod))}
              className="flex items-center text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-slate-100"
              aria-label={`Ir para período anterior: ${formatPeriod(getPreviousPeriod(currentPeriod))}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div className="mx-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800" id="current-period">
                {formatPeriod(currentPeriod)}
              </h2>
              <p className="text-sm text-slate-600">Período de análise</p>
            </div>
            
            <button
              onClick={() => handlePeriodChange(getNextPeriod(currentPeriod))}
              className="flex items-center text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-slate-100"
              aria-label={`Ir para próximo período: ${formatPeriod(getNextPeriod(currentPeriod))}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          {/* Quick Stats */}
          <section aria-labelledby="financial-summary" className="mb-6 sm:mb-8">
            <h3 id="financial-summary" className="sr-only">Resumo Financeiro</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Renda Mensal */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 sm:p-6 text-center border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl mb-3 shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-800 mb-1" aria-label={`Renda mensal: ${formatCurrency(summary.monthlyIncome)}`}>
                  {formatCurrency(summary.monthlyIncome)}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 font-semibold">Renda Mensal</div>
              </div>

              {/* Receitas */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-4 sm:p-6 text-center border border-emerald-200 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl mb-3 shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-emerald-800 mb-1" aria-label={`Total de receitas: ${formatCurrency(summary.totalIncome)}`}>
                  {formatCurrency(summary.totalIncome)}
                </div>
                <div className="text-xs sm:text-sm text-emerald-600 font-semibold">Receitas</div>
              </div>
              
              {/* Gastos */}
              <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-4 sm:p-6 text-center border border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-pink-700 rounded-xl mb-3 shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                  </svg>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-red-800 mb-1" aria-label={`Total de gastos: ${formatCurrency(summary.totalExpenses)}`}>
                  {formatCurrency(summary.totalExpenses)}
                </div>
                <div className="text-xs sm:text-sm text-red-600 font-semibold">Gastos</div>
                {summary.monthlyIncome > 0 && (
                  <div className="text-xs text-red-500 mt-1 font-medium" aria-label={`${getSpendingPercentage().toFixed(1)} por cento da renda`}>
                    {getSpendingPercentage().toFixed(1)}% da renda
                  </div>
                )}
              </div>

              {/* Saldo */}
              <div className={`bg-gradient-to-br rounded-2xl p-4 sm:p-6 text-center border hover:shadow-lg transition-all duration-300 ${
                summary.balance >= 0 
                  ? 'from-blue-50 to-indigo-100 border-blue-200' 
                  : 'from-red-50 to-pink-100 border-red-200'
              }`}>
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 shadow-lg ${
                  summary.balance >= 0 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
                    : 'bg-gradient-to-br from-red-600 to-pink-700'
                }`}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div className={`text-lg sm:text-2xl font-bold mb-1 ${
                  summary.balance >= 0 ? 'text-blue-800' : 'text-red-800'
                }`} aria-label={`Saldo atual: ${formatCurrency(summary.balance)}`}>
                  {formatCurrency(summary.balance)}
                </div>
                <div className={`text-xs sm:text-sm font-semibold ${
                  summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  Saldo
                </div>
              </div>
            </div>
          </section>

          {/* Monthly Income */}
          <div className="mb-6">
            <label 
              htmlFor="monthly-income"
              className="block text-sm font-semibold text-slate-700 mb-3"
            >
              💰 Renda Mensal - {formatPeriod(currentPeriod)}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-base font-medium" aria-hidden="true">R$</span>
              <input
                type="number"
                id="monthly-income"
                step="0.01"
                value={summary.monthlyIncome || ''}
                onChange={handleMonthlyIncomeChange}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base font-medium shadow-sm"
                placeholder="0,00"
                aria-label={`Renda mensal para ${formatPeriod(currentPeriod)}`}
                aria-describedby="monthly-income-help"
              />
              <div id="monthly-income-help" className="sr-only">
                Digite sua renda mensal em reais. Use vírgula ou ponto para separar os centavos.
              </div>
            </div>
          </div>

          {/* Transaction Form */}
          <section aria-labelledby="add-transaction">
            <h3 id="add-transaction" className="text-lg font-bold text-slate-800 mb-4">➕ Nova Transação</h3>
            <form 
              ref={formRef}
              onSubmit={handleAddTransaction} 
              className="space-y-4"
              aria-label="Formulário para adicionar transação"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <label 
                    htmlFor="transaction-description"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Descrição
                  </label>
                  <input
                    type="text"
                    id="transaction-description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    placeholder="Ex: Compra no supermercado"
                    maxLength={20}
                    required
                    aria-describedby="description-help"
                  />
                  <div id="description-help" className="sr-only">
                    Digite uma descrição para sua transação, máximo 20 caracteres
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="transaction-amount"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Valor
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium" aria-hidden="true">R$</span>
                    <input
                      type="number"
                      id="transaction-amount"
                      name="amount"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                      placeholder="0,00"
                      required
                      aria-describedby="amount-help"
                    />
                    <div id="amount-help" className="sr-only">
                      Digite o valor da transação em reais
                    </div>
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="transaction-type"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Tipo
                  </label>
                  <select
                    id="transaction-type"
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    aria-describedby="type-help"
                  >
                    <option value="expense">💸 Gasto</option>
                    <option value="income">💰 Receita</option>
                  </select>
                  <div id="type-help" className="sr-only">
                    Selecione se é um gasto ou uma receita
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label 
                    htmlFor="transaction-category"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Categoria
                  </label>
                  <select
                    id="transaction-category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    aria-describedby="category-help"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div id="category-help" className="sr-only">
                    Selecione a categoria da transação
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform w-full sm:w-auto justify-center"
                    aria-describedby="submit-help"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Adicionar
                  </button>
                  <div id="submit-help" className="sr-only">
                    Clique para adicionar a transação
                  </div>
                </div>
              </div>
            </form>
          </section>
        </header>

        {/* Transactions List */}
        <main id="main-content">
          <section className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-100" aria-labelledby="transactions-title">
            <h2 id="transactions-title" className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Transações - {formatPeriod(currentPeriod)}
            </h2>
            
            <div>
              {!summary.transactions || summary.transactions.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma transação registrada</h3>
                  <p className="text-slate-500">Adicione sua primeira transação usando o formulário acima.</p>
                </div>
              ) : (
                <div className="space-y-3" role="list" aria-label="Lista de transações">
                  {summary.transactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                        transaction.type === 'income' 
                          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100' 
                          : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100'
                      }`}
                      role="listitem"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mr-4 flex-shrink-0 shadow-lg ${
                          transaction.type === 'income' 
                            ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white' 
                            : 'bg-gradient-to-br from-red-600 to-pink-700 text-white'
                        }`} aria-hidden="true">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {transaction.type === 'income' 
                              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                            }
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 text-base truncate">{transaction.description}</p>
                          <div className="flex flex-wrap items-center text-sm text-slate-600 mt-1 gap-x-2 gap-y-1">
  <span>{transaction.date}</span>
  <span className="mx-2 hidden sm:inline" aria-hidden="true">•</span>
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)} break-all`}>
    {transaction.category}
  </span>
</div>
                        </div>
                      </div>

                      <div className="flex items-center ml-4 flex-shrink-0">
<span
  className={`font-bold text-base sm:text-lg ${
    transaction.type === 'income' ? 'text-emerald-700' : 'text-red-700'
  }`}
  aria-label={`${transaction.type === 'income' ? 'Receita' : 'Gasto'} de R$${transaction.type === 'expense' ? ' -' : ' '}${formatCurrency(Math.abs(transaction.amount)).replace('R$', '').trim()}`}
>
  R${transaction.type === 'expense' ? ' - ' : ' '}{formatCurrency(Math.abs(transaction.amount)).replace('R$', '').trim()}
</span>
                        <button
                          onClick={() => deleteTransaction(transaction.id, transaction.description)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={`Excluir transação: ${transaction.description}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};