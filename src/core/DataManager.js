/**
 * DataManager - Gerenciador centralizado de dados do OrçaMais
 * Responsável por toda persistência no localStorage e gerenciamento de estado
 */

class DataManager {
  constructor() {
    this.STORAGE_KEY = 'orcamais:data';
    this.currentUser = null;
    this.data = this.loadData();
  }

  /**
   * Carrega dados do localStorage
   */
  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        users: {},
        currentUserId: null,
        version: '2.0.0'
      };
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return { users: {}, currentUserId: null, version: '2.0.0' };
    }
  }

  /**
   * Salva dados no localStorage
   */
  saveData() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  }

  /**
   * Cria estrutura padrão para novo usuário
   */
  createUserStructure(userId, userData) {
    return {
      id: userId,
      profile: {
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      financial: {
        monthlyIncomes: {}, // { "2024-01": 5000, "2024-02": 5200 }
        transactions: [], // Array de transações
        categories: [
          'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
          'Educação', 'Lazer', 'Compras', 'Outros'
        ],
        goals: [] // Metas financeiras
      },
      settings: {
        currency: 'BRL',
        theme: 'light',
        notifications: true
      }
    };
  }

  /**
   * Registra novo usuário
   */
  registerUser(userData) {
    const userId = this.generateUserId(userData.email);
    
    if (this.data.users[userId]) {
      return { success: false, message: 'Usuário já existe' };
    }

    this.data.users[userId] = this.createUserStructure(userId, userData);
    this.data.currentUserId = userId;
    this.currentUser = this.data.users[userId];
    
    if (this.saveData()) {
      return { success: true, user: this.currentUser };
    }
    
    return { success: false, message: 'Erro ao salvar dados' };
  }

  /**
   * Autentica usuário
   */
  loginUser(email, password) {
    const userId = this.generateUserId(email);
    const user = this.data.users[userId];

    if (!user) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    // Em produção real, verificaria hash da senha
    // Por ora, simulamos autenticação bem-sucedida
    user.profile.lastLogin = new Date().toISOString();
    this.data.currentUserId = userId;
    this.currentUser = user;
    
    this.saveData();
    return { success: true, user: this.currentUser };
  }

  /**
   * Logout do usuário atual
   */
  logout() {
    this.currentUser = null;
    this.data.currentUserId = null;
    this.saveData();
  }

  /**
   * Gera ID único baseado no email
   */
  generateUserId(email) {
    return btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Gera ID único para transação
   */
  generateTransactionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtém renda mensal para período específico
   */
  getMonthlyIncome(yearMonth) {
    if (!this.currentUser) return 0;
    return this.currentUser.financial.monthlyIncomes[yearMonth] || 0;
  }

  /**
   * Define renda mensal para período específico
   */
  setMonthlyIncome(yearMonth, amount) {
    if (!this.currentUser) return false;
    
    this.currentUser.financial.monthlyIncomes[yearMonth] = parseFloat(amount) || 0;
    return this.saveData();
  }

  /**
   * Adiciona nova transação
   */
  addTransaction(transactionData) {
    if (!this.currentUser) return false;

    const transaction = {
      id: this.generateTransactionId(),
      description: transactionData.description,
      amount: parseFloat(transactionData.amount),
      type: transactionData.type, // 'income' | 'expense'
      category: transactionData.category || 'Outros',
      date: transactionData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    this.currentUser.financial.transactions.unshift(transaction);
    return this.saveData() ? transaction : false;
  }

  /**
   * Remove transação
   */
  removeTransaction(transactionId) {
    if (!this.currentUser) return false;

    const index = this.currentUser.financial.transactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;

    this.currentUser.financial.transactions.splice(index, 1);
    return this.saveData();
  }

  /**
   * Obtém transações filtradas por período
   */
  getTransactionsByPeriod(yearMonth) {
    if (!this.currentUser) return [];
    
    return this.currentUser.financial.transactions.filter(transaction => {
      return transaction.date.startsWith(yearMonth);
    });
  }

  /**
   * Obtém todas as transações do usuário atual
   */
  getAllTransactions() {
    if (!this.currentUser) return [];
    return [...this.currentUser.financial.transactions];
  }

  /**
   * Calcula resumo financeiro para período específico
   */
  getFinancialSummary(yearMonth) {
    if (!this.currentUser) return null;

    const transactions = this.getTransactionsByPeriod(yearMonth);
    const monthlyIncome = this.getMonthlyIncome(yearMonth);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) + monthlyIncome;

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Gastos por categoria
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return {
      period: yearMonth,
      monthlyIncome,
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length,
      expensesByCategory,
      transactions
    };
  }

  /**
   * Compara dois períodos financeiros
   */
  comparePeriods(period1, period2) {
    const summary1 = this.getFinancialSummary(period1);
    const summary2 = this.getFinancialSummary(period2);

    if (!summary1 || !summary2) return null;

    return {
      period1: summary1,
      period2: summary2,
      comparison: {
        incomeChange: summary2.totalIncome - summary1.totalIncome,
        expenseChange: summary2.totalExpenses - summary1.totalExpenses,
        balanceChange: summary2.balance - summary1.balance,
        incomeChangePercent: summary1.totalIncome > 0 ? 
          ((summary2.totalIncome - summary1.totalIncome) / summary1.totalIncome) * 100 : 0,
        expenseChangePercent: summary1.totalExpenses > 0 ? 
          ((summary2.totalExpenses - summary1.totalExpenses) / summary1.totalExpenses) * 100 : 0
      }
    };
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verifica se usuário está logado
   */
  isLoggedIn() {
    return this.currentUser !== null;
  }

  /**
   * Obtém categorias do usuário
   */
  getCategories() {
    if (!this.currentUser) return [];
    return this.currentUser.financial.categories;
  }

  /**
   * Adiciona nova categoria
   */
  addCategory(categoryName) {
    if (!this.currentUser || !categoryName.trim()) return false;
    
    const categories = this.currentUser.financial.categories;
    if (!categories.includes(categoryName)) {
      categories.push(categoryName);
      return this.saveData();
    }
    return false;
  }
}

// Instância singleton
const dataManager = new DataManager();
export default dataManager;