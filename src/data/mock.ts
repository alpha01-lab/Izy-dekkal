// ============================================================
// DONNÉES MOCK — Dëkkal
// Tous les montants en centimes (FCFA × 100)
// ============================================================

// ---------- STATS DASHBOARD ----------
export const mockStats = {
  totalStockValue: 1250000000,  // 12 500 000 FCFA
  monthlySales: 450000000,      //  4 500 000 FCFA
  invoicedAmount: 520000000,    //  5 200 000 FCFA
  pendingAmount: 85000000,      //    850 000 FCFA
};

// ---------- CATÉGORIES ----------
export const mockCategories = [
  { id: 'cat_1', name: 'Électronique' },
  { id: 'cat_2', name: 'Alimentaire' },
  { id: 'cat_3', name: 'Textile' },
  { id: 'cat_4', name: 'Cosmétique' },
  { id: 'cat_5', name: 'Divers' },
];

// ---------- PRODUITS ----------
export const mockProducts = [
  { id: 'p1',  name: 'MacBook Pro M3',         category: 'Électronique', quantity: 2,  alertThreshold: 5,  purchasePrice: 90000000, salePrice: 110000000, unit: 'pièce', active: true },
  { id: 'p2',  name: 'Onduleur APC 1000VA',    category: 'Électronique', quantity: 0,  alertThreshold: 3,  purchasePrice: 8500000,  salePrice: 12000000,  unit: 'pièce', active: true },
  { id: 'p3',  name: 'Samsung Galaxy A55',     category: 'Électronique', quantity: 15, alertThreshold: 5,  purchasePrice: 25000000, salePrice: 30000000,  unit: 'pièce', active: true },
  { id: 'p4',  name: 'Imprimante HP LaserJet', category: 'Électronique', quantity: 7,  alertThreshold: 2,  purchasePrice: 18000000, salePrice: 22000000,  unit: 'pièce', active: true },
  { id: 'p5',  name: 'Sac de riz 25kg',        category: 'Alimentaire',  quantity: 50, alertThreshold: 10, purchasePrice: 1200000,  salePrice: 1500000,   unit: 'sac',   active: true },
  { id: 'p6',  name: 'Huile de palme 5L',      category: 'Alimentaire',  quantity: 30, alertThreshold: 10, purchasePrice: 450000,   salePrice: 650000,    unit: 'bidon', active: true },
  { id: 'p7',  name: 'Sucre 50kg',             category: 'Alimentaire',  quantity: 20, alertThreshold: 5,  purchasePrice: 2500000,  salePrice: 3000000,   unit: 'sac',   active: true },
  { id: 'p8',  name: 'Boubou Bazin homme',     category: 'Textile',      quantity: 25, alertThreshold: 5,  purchasePrice: 1500000,  salePrice: 2500000,   unit: 'pièce', active: true },
  { id: 'p9',  name: 'Tissu Wax 6 yards',      category: 'Textile',      quantity: 4,  alertThreshold: 10, purchasePrice: 800000,   salePrice: 1200000,   unit: 'pièce', active: true },
  { id: 'p10', name: 'Parfum Lacoste 100ml',   category: 'Cosmétique',   quantity: 12, alertThreshold: 5,  purchasePrice: 1200000,  salePrice: 2000000,   unit: 'flacon', active: true },
  { id: 'p11', name: 'Crème Nivea 400ml',      category: 'Cosmétique',   quantity: 40, alertThreshold: 10, purchasePrice: 250000,   salePrice: 400000,    unit: 'tube',  active: true },
  { id: 'p12', name: 'Carton Papier A4',       category: 'Divers',       quantity: 4,  alertThreshold: 10, purchasePrice: 600000,   salePrice: 900000,    unit: 'carton', active: true },
  { id: 'p13', name: 'Stylos Bic (boite 50)',  category: 'Divers',       quantity: 18, alertThreshold: 5,  purchasePrice: 150000,   salePrice: 250000,    unit: 'boite', active: true },
  { id: 'p14', name: 'Chaise de bureau',       category: 'Divers',       quantity: 8,  alertThreshold: 2,  purchasePrice: 3500000,  salePrice: 5000000,   unit: 'pièce', active: true },
  { id: 'p15', name: 'Ventilateur Miyako',     category: 'Électronique', quantity: 22, alertThreshold: 5,  purchasePrice: 1800000,  salePrice: 2500000,   unit: 'pièce', active: true },
];

// ---------- CLIENTS ----------
export const mockClients = [
  { id: 'c1', name: 'Mamadou Ndiaye',      phone: '+221 77 123 45 67', email: 'mamadou.ndiaye@gmail.com',   address: 'Dakar, Plateau', notes: 'Client fidèle depuis 2023' },
  { id: 'c2', name: 'Fatou Diop',          phone: '+221 76 234 56 78', email: 'fatou.diop@orange.sn',       address: 'Dakar, Medina', notes: '' },
  { id: 'c3', name: 'Entreprise Teranga',  phone: '+221 33 456 78 90', email: 'contact@teranga.sn',         address: 'Dakar, Zone Industrielle', notes: 'Commandes en gros' },
  { id: 'c4', name: 'Ousmane Sow',         phone: '+221 70 345 67 89', email: '',                           address: 'Thiès, Centre', notes: '' },
  { id: 'c5', name: 'Aminata Fall',        phone: '+221 78 456 78 90', email: 'aminata.fall@gmail.com',     address: 'Dakar, Parcelles', notes: 'Préfère les paiements mobile money' },
  { id: 'c6', name: 'Ibrahima Diallo',     phone: '+221 77 567 89 01', email: 'ibradiallo@hotmail.com',     address: 'Saint-Louis', notes: '' },
  { id: 'c7', name: 'Aïssatou Bah',        phone: '+221 76 678 90 12', email: '',                           address: 'Dakar, Grand Yoff', notes: 'Achats mensuels réguliers' },
  { id: 'c8', name: 'SARL Keur Mbaye',     phone: '+221 33 789 01 23', email: 'keurmbaye@sarl.sn',          address: 'Dakar, Yoff', notes: 'TVA applicable' },
];

// ---------- FOURNISSEURS ----------
export const mockSuppliers = [
  { id: 's1', name: 'Electronics Dakar',   phone: '+221 33 123 45 67', email: 'contact@electronics-dakar.sn', address: 'Dakar, Zone Industrielle', notes: 'Délai livraison 3-5 jours' },
  { id: 's2', name: 'SONAC Alimentaire',   phone: '+221 33 234 56 78', email: 'sonac@alimentaire.sn',        address: 'Dakar, Port', notes: 'Paiement 30 jours fin de mois' },
  { id: 's3', name: 'Textile Afrique',     phone: '+221 77 345 67 89', email: 'textile.afrique@gmail.com',   address: 'Dakar, Sandaga', notes: 'Minimum commande 50 pièces' },
  { id: 's4', name: 'Beauté & Cosmétique', phone: '+221 76 456 78 90', email: 'beaute.cosm@orange.sn',      address: 'Dakar, Plateau', notes: '' },
  { id: 's5', name: 'Bureau Fournitures',  phone: '+221 33 567 89 01', email: 'bf@bureau-fournitures.sn',   address: 'Dakar, Plateau', notes: 'Livraison gratuite > 100 000 FCFA' },
];

// ---------- FACTURES ----------
export const mockInvoices = [
  { id: 'inv_1', number: 'FAC-202606-0001', clientName: 'Mamadou Ndiaye',     clientId: 'c1', date: '2026-06-01', dueDate: '2026-06-15', amount: 85000000,  status: 'payee',    items: 3 },
  { id: 'inv_2', number: 'FAC-202606-0002', clientName: 'Fatou Diop',         clientId: 'c2', date: '2026-06-02', dueDate: '2026-06-16', amount: 12000000,  status: 'envoyee',  items: 1 },
  { id: 'inv_3', number: 'FAC-202606-0003', clientName: 'Entreprise Teranga', clientId: 'c3', date: '2026-06-02', dueDate: '2026-06-10', amount: 450000000, status: 'impayee',  items: 5 },
  { id: 'inv_4', number: 'FAC-202606-0004', clientName: 'Ousmane Sow',        clientId: 'c4', date: '2026-06-03', dueDate: '2026-06-17', amount: 3500000,   status: 'brouillon', items: 1 },
  { id: 'inv_5', number: 'FAC-202606-0005', clientName: 'Aminata Fall',       clientId: 'c5', date: '2026-06-03', dueDate: '2026-06-18', amount: 15500000,  status: 'payee',    items: 2 },
  { id: 'inv_6', number: 'FAC-202605-0012', clientName: 'SARL Keur Mbaye',    clientId: 'c8', date: '2026-05-28', dueDate: '2026-06-05', amount: 78000000,  status: 'impayee',  items: 4 },
  { id: 'inv_7', number: 'FAC-202605-0011', clientName: 'Ibrahima Diallo',    clientId: 'c6', date: '2026-05-25', dueDate: '2026-06-08', amount: 9500000,   status: 'payee',    items: 2 },
];

// ---------- BONS DE COMMANDE ----------
export const mockPurchaseOrders = [
  { id: 'bc_1', number: 'BC-202606-0001', supplierName: 'Electronics Dakar',   supplierId: 's1', date: '2026-06-01', expectedDate: '2026-06-06', amount: 250000000, status: 'en_attente', items: 3 },
  { id: 'bc_2', number: 'BC-202606-0002', supplierName: 'SONAC Alimentaire',   supplierId: 's2', date: '2026-06-02', expectedDate: '2026-06-04', amount: 45000000,  status: 'recue',      items: 4 },
  { id: 'bc_3', number: 'BC-202605-0008', supplierName: 'Textile Afrique',     supplierId: 's3', date: '2026-05-28', expectedDate: '2026-06-03', amount: 30000000,  status: 'partielle',  items: 2 },
  { id: 'bc_4', number: 'BC-202605-0007', supplierName: 'Bureau Fournitures',  supplierId: 's5', date: '2026-05-25', expectedDate: '2026-05-30', amount: 8000000,   status: 'recue',      items: 2 },
];

// ---------- GRAPHIQUE VENTES ----------
export const mockSalesChartData = [
  { name: 'Jan', total: 2500000 },
  { name: 'Fév', total: 3200000 },
  { name: 'Mar', total: 2800000 },
  { name: 'Avr', total: 4100000 },
  { name: 'Mai', total: 3800000 },
  { name: 'Juin', total: 4500000 },
];

// ---------- ALERTES STOCK ----------
export const mockStockAlerts = mockProducts.filter(p => p.quantity <= p.alertThreshold);

// ---------- FACTURES RÉCENTES (dashboard) ----------
export const mockRecentInvoices = mockInvoices.slice(0, 5);

// ---------- PARAMÈTRES BOUTIQUE ----------
export const mockSettings = {
  name: 'Ma Boutique Sénégal',
  address: '45 Rue du Commerce, Plateau, Dakar',
  phone: '+221 77 123 45 67',
  email: 'contact@maboutique.sn',
  logoUrl: '',
  devise: 'FCFA',
  invoicePrefix: 'FAC',
  tvaRate: 18,
};
