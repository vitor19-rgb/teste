/**
 * SummaryScreen - Tela de resumo e comparações
 * Design profissional corporativo
 */

import React, { useState, useEffect } from 'react';
import dataManager from '../core/DataManager';
import { 
  formatCurrency, 
  formatPeriod, 
  getCurrentPeriod, 
  getPreviousPeriod,
  getNextPeriod,
  formatPercentage,
  getCategoryColor
} from '../utils/formatters';

interface SummaryScreenProps {
  onNavigate: (screen: string) => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ onNavigate }) => {
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod());
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    updateSummaryData();
  }, [currentPeriod]);

  const updateSummaryData = () => {
    const summary = dataManager.getFinancialSummary(currentPeriod);
    const comparisonPeriod = getPreviousPeriod(currentPeriod);
    const comp = dataManager.comparePeriods(comparisonPeriod, currentPeriod);
    
    setCurrentSummary(summary);
    setComparison(comp);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setCurrentPeriod(newPeriod);
  };

  if (!currentSummary) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span className="hidden sm:inline">Relatório Detalhado</span>
              <span className="sm:hidden">Relatório</span>
            </h1>
            <button
              onClick={() => onNavigate('main')}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors px-4 py-2 rounded-xl hover:bg-blue-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Voltar
            </button>
          </div>

          {/* Period Navigation */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <button
              onClick={() => handlePeriodChange(getPreviousPeriod(currentPeriod))}
              className="flex items-center text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div className="mx-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{formatPeriod(currentPeriod)}</h2>
              <p className="text-sm text-slate-600">Análise detalhada do período</p>
            </div>
            
            <button
              onClick={() => handlePeriodChange(getNextPeriod(currentPeriod))}
              className="flex items-center text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Renda Mensal */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 text-center border border-blue-100 hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl mb-3 sm:mb-4 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">Renda Mensal</h3>
              <p className="text-lg sm:text-2xl font-bold text-blue-900">{formatCurrency(currentSummary.monthlyIncome)}</p>
            </div>

            {/* Total de Receitas */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 text-center border border-emerald-100 hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl mb-3 sm:mb-4 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-emerald-800 mb-2">Total de Receitas</h3>
              <p className="text-lg sm:text-2xl font-bold text-emerald-900">{formatCurrency(currentSummary.totalIncome)}</p>
              {comparison && (
                <p className={`text-xs sm:text-sm mt-1 ${comparison.comparison.incomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPercentage(comparison.comparison.incomeChangePercent)} vs anterior
                </p>
              )}
            </div>

            {/* Total de Gastos */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 text-center border border-red-100 hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-600 to-pink-700 rounded-xl mb-3 sm:mb-4 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-red-800 mb-2">Total de Gastos</h3>
              <p className="text-lg sm:text-2xl font-bold text-red-900">{formatCurrency(currentSummary.totalExpenses)}</p>
              {comparison && (
                <p className={`text-xs sm:text-sm mt-1 ${comparison.comparison.expenseChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPercentage(comparison.comparison.expenseChangePercent)} vs anterior
                </p>
              )}
            </div>

            {/* Saldo */}
            <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 text-center border hover:shadow-2xl transition-all duration-300 ${
              currentSummary.balance >= 0 ? 'border-blue-100' : 'border-red-100'
            }`}>
              <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-3 sm:mb-4 shadow-lg ${
                currentSummary.balance >= 0 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
                  : 'bg-gradient-to-br from-red-600 to-pink-700'
              }`}>
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 className={`text-xs sm:text-sm font-semibold mb-2 ${
                currentSummary.balance >= 0 ? 'text-blue-800' : 'text-red-800'
              }`}>Saldo</h3>
              <p className={`text-lg sm:text-2xl font-bold ${
                currentSummary.balance >= 0 ? 'text-blue-900' : 'text-red-900'
              }`}>
                {formatCurrency(currentSummary.balance)}
              </p>
              {comparison && (
                <p className={`text-xs sm:text-sm mt-1 ${comparison.comparison.balanceChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {comparison.comparison.balanceChange >= 0 ? '+' : ''}{formatCurrency(comparison.comparison.balanceChange)} vs anterior
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Resumo de Transações - {formatPeriod(currentPeriod)}
          </h2>
          
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200">
              <div className="text-2xl sm:text-4xl font-bold text-blue-700 mb-2">{currentSummary.transactionCount}</div>
              <div className="text-xs sm:text-sm text-blue-600 font-semibold">Total de Transações</div>
            </div>

            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl border border-emerald-200">
              <div className="text-2xl sm:text-4xl font-bold text-emerald-700 mb-2">
                {currentSummary.transactions.filter((t: any) => t.type === 'income').length}
              </div>
              <div className="text-xs sm:text-sm text-emerald-600 font-semibold">Receitas</div>
            </div>

            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl border border-red-200">
              <div className="text-2xl sm:text-4xl font-bold text-red-700 mb-2">
                {currentSummary.transactions.filter((t: any) => t.type === 'expense').length}
              </div>
              <div className="text-xs sm:text-sm text-red-600 font-semibold">Gastos</div>
            </div>
          </div>

          {currentSummary.transactions.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-4 text-base sm:text-lg">💎 Maiores Transações do Período</h3>
              <div className="space-y-3">
                {currentSummary.transactions
                  .sort((a: any, b: any) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-3 sm:mr-4 flex-shrink-0 ${
                          transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">{transaction.description}</div>
                          <div className="text-xs sm:text-sm text-slate-600 truncate">{transaction.category}</div>
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <div className={`font-bold text-sm sm:text-base ${
                          transaction.type === 'income' ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-500">{transaction.date}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {currentSummary.transactions.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma transação registrada</h3>
              <p className="text-slate-500">Nenhuma transação foi registrada em {formatPeriod(currentPeriod)}.</p>
              <p className="text-slate-500 mt-1">Volte para a tela principal para adicionar transações.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};