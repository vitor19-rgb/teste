/**
 * DataManager - Gerenciador centralizado de dados do OrçaMais
 * Responsável por toda persistência no localStorage e gerenciamento de estado
 */

interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: string;
}

interface UserData {
  id: string;
  profile: UserProfile;
  financial: {
    monthlyIncomes: Record<string, number>;
    transactions: Transaction[];
    categories: string[];
    goals: any[];
  };
  settings: {
    currency: string;
    theme: string;
    notifications: boolean;
  };
}

interface AppData {
  users: Record<string, UserData>;
  currentUserId: string | null;
  version: string;
}

class DataManager {
  private STORAGE_KEY = 'orcamais:data';
  private currentUser: UserData | null = null;
  private data: AppData;

  constructor() {
    this.data = this.loadData();
    if (this.data.currentUserId && this.data.users[this.data.currentUserId]) {
      this.currentUser = this.data.users[this.data.currentUserId];
    }
  }

  /**
   * Carrega dados do localStorage
   */
  private loadData(): AppData {
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
  private saveData(): boolean {
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
  private createUserStructure(userId: string, userData: any): UserData {
    return {
      id: userId,
      profile: {
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      financial: {
        monthlyIncomes: {},
        transactions: [],
        categories: [
          'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
          'Educação', 'Lazer', 'Compras', 'Outros'
        ],
        goals: []
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
  registerUser(userData: any): { success: boolean; user?: UserData; message?: string } {
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
  loginUser(email: string, password: string): { success: boolean; user?: UserData; message?: string } {
    const userId = this.generateUserId(email);
    const user = this.data.users[userId];

    if (!user) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    user.profile.lastLogin = new Date().toISOString();
    this.data.currentUserId = userId;
    this.currentUser = user;
    
    this.saveData();
    return { success: true, user: this.currentUser };
  }

  /**
   * Logout do usuário atual
   */
  logout(): void {
    this.currentUser = null;
    this.data.currentUserId = null;
    this.saveData();
  }

  /**
   * Gera ID único baseado no email
   */
  private generateUserId(email: string): string {
    return btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Gera ID único para transação
   */
  private generateTransactionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtém renda mensal para período específico
   */
  getMonthlyIncome(yearMonth: string): number {
    if (!this.currentUser) return 0;
    return this.currentUser.financial.monthlyIncomes[yearMonth] || 0;
  }

  /**
   * Define renda mensal para período específico
   */
  setMonthlyIncome(yearMonth: string, amount: number): boolean {
    if (!this.currentUser) return false;
    
    this.currentUser.financial.monthlyIncomes[yearMonth] = parseFloat(amount.toString()) || 0;
    return this.saveData();
  }

  /**
   * Adiciona nova transação
   */
  addTransaction(transactionData: any): Transaction | false {
    if (!this.currentUser) return false;

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      description: transactionData.description,
      amount: parseFloat(transactionData.amount),
      type: transactionData.type,
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
  removeTransaction(transactionId: string): boolean {
    if (!this.currentUser) return false;

    const index = this.currentUser.financial.transactions.findIndex(t => t.id === transactionId);
    if (index === -1) return false;

    this.currentUser.financial.transactions.splice(index, 1);
    return this.saveData();
  }

  /**
   * Obtém transações filtradas por período - CORRIGIDO
   */
  getTransactionsByPeriod(yearMonth: string): Transaction[] {
    if (!this.currentUser) return [];
    
    // Garantir que o formato está correto (YYYY-MM)
    const targetPeriod = yearMonth.trim();
    
    const filteredTransactions = this.currentUser.financial.transactions.filter(transaction => {
      // Extrair YYYY-MM da data da transação
      const transactionPeriod = transaction.date.substring(0, 7);
      return transactionPeriod === targetPeriod;
    });
    
    return filteredTransactions;
  }

  /**
   * Calcula resumo financeiro para período específico - CORRIGIDO
   */
  getFinancialSummary(yearMonth: string): any {
    if (!this.currentUser) return null;

    // Busca transações específicas do período
    const transactions = this.getTransactionsByPeriod(yearMonth);
    const monthlyIncome = this.getMonthlyIncome(yearMonth);

    // Calcula receitas do período (excluindo a renda mensal fixa)
    const periodIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total de receitas = renda mensal + receitas extras do período
    const totalIncome = monthlyIncome + periodIncome;

    // Calcula gastos do período
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Gastos por categoria (apenas do período atual)
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    const summary = {
      period: yearMonth,
      monthlyIncome,
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length,
      expensesByCategory,
      transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };

    return summary;
  }

  /**
   * Compara dois períodos financeiros
   */
  comparePeriods(period1: string, period2: string): any {
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
  getCurrentUser(): UserData | null {
    return this.currentUser;
  }

  /**
   * Verifica se usuário está logado
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Obtém categorias do usuário
   */
  getCategories(): string[] {
    if (!this.currentUser) return [];
    return this.currentUser.financial.categories;
  }

  /**
   * Adiciona nova categoria
   */
  addCategory(categoryName: string): boolean {
    if (!this.currentUser || !categoryName.trim()) return false;
    
    const categories = this.currentUser.financial.categories;
    if (!categories.includes(categoryName)) {
      categories.push(categoryName);
      return this.saveData();
    }
    return false;
  }

  /**
   * Método para debug - listar todas as transações com suas datas
   */
  debugTransactions(): void {
    if (!this.currentUser) {
      console.log('Nenhum usuário logado');
      return;
    }

    console.log('=== DEBUG TRANSAÇÕES ===');
    console.log('Total de transações:', this.currentUser.financial.transactions.length);
    
    this.currentUser.financial.transactions.forEach((t, index) => {
      console.log(`${index + 1}. ${t.description} - ${t.date} - R$ ${t.amount} (${t.type})`);
    });

    console.log('=== RENDAS MENSAIS ===');
    Object.entries(this.currentUser.financial.monthlyIncomes).forEach(([period, income]) => {
      console.log(`${period}: R$ ${income}`);
    });
  }
}

// Instância singleton
const dataManager = new DataManager();

// Expor método de debug globalmente para testes
(window as any).debugTransactions = () => dataManager.debugTransactions();

export default dataManager;