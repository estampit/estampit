// Mock database with realistic data

export interface Purchase {
  id: string
  customerId: string
  businessId: string
  items: string[]
  amount: number
  stampsEarned: number
  date: string
}

export interface Customer {
  id: string
  businessId: string
  name: string
  email: string
  phone?: string
  currentStamps: number
  totalRewards: number
  lastVisit: string
  createdAt: string
  loyaltyLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  totalSpent: number
  favoriteItems: string[]
  expirationDate?: string
}

export interface Business {
  id: string
  name: string
  email: string
  logo?: string
  category: string
  stampsRequired: number
  reward: string
  totalCustomers: number
  totalStamps: number
  totalRewards: number
  createdAt: string
}

export interface Transaction {
  id: string
  customerId: string
  businessId: string
  type: 'stamp_earned' | 'reward_redeemed'
  description: string
  date: string
}

export interface Analytics {
  totalCustomers: number
  totalStamps: number
  totalRewards: number
  retentionRate: number
  averageVisitsPerCustomer: number
  topCustomers: Customer[]
}

// Mock Database
class MockDB {
  private businesses: Business[] = [
    {
      id: '1',
      name: 'Café Central',
      email: 'demo@mystamp.app',
      category: 'Cafetería',
      stampsRequired: 10,
      reward: 'Café Gratis',
      totalCustomers: 156,
      totalStamps: 1247,
      totalRewards: 89,
      createdAt: new Date().toISOString()
    }
  ]

  private purchases: Purchase[] = [
    {
      id: '1',
      customerId: '1',
      businessId: '1',
      items: ['Cappuccino', 'Croissant'],
      amount: 6.50,
      stampsEarned: 1,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2', 
      customerId: '1',
      businessId: '1',
      items: ['Latte', 'Sandwich Jamón'],
      amount: 8.30,
      stampsEarned: 1,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      customerId: '2',
      businessId: '1', 
      items: ['Americano', 'Tarta Chocolate'],
      amount: 7.80,
      stampsEarned: 1,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      customerId: '3',
      businessId: '1',
      items: ['Flat White', 'Bagel Salmón'],
      amount: 9.50,
      stampsEarned: 1,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  private customers: Customer[] = [
    {
      id: '1',
      businessId: '1',
      name: 'María García',
      email: 'maria@email.com',
      phone: '+34 600 111 222',
      currentStamps: 7,
      totalRewards: 2,
      lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      loyaltyLevel: 'Gold',
      totalSpent: 156.70,
      favoriteItems: ['Cappuccino', 'Croissant', 'Latte'],
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      businessId: '1',
      name: 'Carlos López',
      email: 'carlos@email.com',
      phone: '+34 600 333 444',
      currentStamps: 3,
      totalRewards: 1,
      lastVisit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      loyaltyLevel: 'Silver',
      totalSpent: 89.30,
      favoriteItems: ['Americano', 'Tarta Chocolate'],
      expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      businessId: '1',
      name: 'Ana Martín',
      email: 'ana@email.com',
      phone: '+34 600 555 666',
      currentStamps: 9,
      totalRewards: 0,
      lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      loyaltyLevel: 'Platinum',
      totalSpent: 234.50,
      favoriteItems: ['Flat White', 'Bagel Salmón', 'Smoothie Verde'],
      expirationDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      businessId: '1',
      name: 'David Ruiz',
      email: 'david@email.com',
      phone: '+34 600 777 888',
      currentStamps: 5,
      totalRewards: 1,
      lastVisit: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      loyaltyLevel: 'Bronze',
      totalSpent: 67.20,
      favoriteItems: ['Espresso', 'Muffin Arándanos'],
      expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  private transactions: Transaction[] = [
    {
      id: '1',
      customerId: '1',
      businessId: '1',
      type: 'stamp_earned',
      description: 'Compra en Café Central - Cappuccino + Croissant',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      customerId: '1',
      businessId: '1',
      type: 'reward_redeemed',
      description: 'Café Gratis canjeado',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Business methods
  async getBusinessByEmail(email: string): Promise<Business | null> {
    await this.delay()
    return this.businesses.find(b => b.email === email) || null
  }

  // Customer methods
  async getCustomers(businessId: string): Promise<Customer[]> {
    await this.delay()
    return this.customers.filter(c => c.businessId === businessId)
  }

  async addCustomer(businessId: string, data: { name: string; email: string; phone?: string }): Promise<Customer> {
    await this.delay()
    
    const newCustomer: Customer = {
      id: Date.now().toString(),
      businessId,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      currentStamps: 0,
      totalRewards: 0,
      lastVisit: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      loyaltyLevel: 'Bronze',
      totalSpent: 0,
      favoriteItems: [],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    this.customers.push(newCustomer)
    return newCustomer
  }

  async addStamp(customerId: string, businessId: string): Promise<{ customer: Customer; rewardEarned: boolean }> {
    await this.delay()
    
    const customer = this.customers.find(c => c.id === customerId)
    const business = this.businesses.find(b => b.id === businessId)
    
    if (!customer || !business) {
      throw new Error('Customer or business not found')
    }

    customer.currentStamps += 1
    customer.lastVisit = new Date().toISOString()
    
    let rewardEarned = false
    if (customer.currentStamps >= business.stampsRequired) {
      customer.currentStamps = 0
      customer.totalRewards += 1
      rewardEarned = true
    }

    // Update business stats
    business.totalStamps += 1
    if (rewardEarned) {
      business.totalRewards += 1
    }

    return { customer, rewardEarned }
  }

  // Purchase methods
  async getPurchases(customerId: string, businessId?: string): Promise<Purchase[]> {
    await this.delay()
    return this.purchases.filter(p => 
      p.customerId === customerId && 
      (!businessId || p.businessId === businessId)
    )
  }

  async addPurchase(purchase: Omit<Purchase, 'id'>): Promise<Purchase> {
    await this.delay()
    
    const newPurchase: Purchase = {
      ...purchase,
      id: Date.now().toString()
    }
    
    this.purchases.push(newPurchase)
    
    // Update customer data
    const customer = this.customers.find(c => c.id === purchase.customerId)
    if (customer) {
      customer.totalSpent += purchase.amount
      customer.lastVisit = purchase.date
      
      // Update favorite items
      purchase.items.forEach(item => {
        if (!customer.favoriteItems.includes(item)) {
          customer.favoriteItems.push(item)
        }
      })
    }
    
    return newPurchase
  }

  // Analytics methods
  async getAnalytics(businessId: string): Promise<Analytics> {
    await this.delay()
    
    const customers = await this.getCustomers(businessId)
    const business = this.businesses.find(b => b.id === businessId)
    
    if (!business) {
      throw new Error('Business not found')
    }

    const totalVisits = customers.reduce((sum, c) => sum + c.totalRewards + 1, 0)
    const averageVisitsPerCustomer = customers.length > 0 ? totalVisits / customers.length : 0
    
    return {
      totalCustomers: business.totalCustomers,
      totalStamps: business.totalStamps,
      totalRewards: business.totalRewards,
      retentionRate: 85,
      averageVisitsPerCustomer: Math.round(averageVisitsPerCustomer * 10) / 10,
      topCustomers: customers
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
    }
  }

  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const api = new MockDB()