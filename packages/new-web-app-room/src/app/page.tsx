'use client';

import { useState } from 'react';

type Lesson = {
  id: number;
  title: string;
  content: string;
  completed: boolean;
};

type Trade = {
  id: number;
  type: 'buy' | 'sell';
  crypto: string;
  amount: number;
  price: number;
  timestamp: Date;
};

type Payment = {
  id: number;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed';
  timestamp: Date;
  recipient: string;
  phone: string;
};

export default function CryptoSimulator() {
  const [balance, setBalance] = useState(10000);
  const [portfolio, setPortfolio] = useState<{ [key: string]: number }>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentView, setCurrentView] = useState<'wallet' | 'trade' | 'lessons' | 'payments'>('wallet');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [tradeAmount, setTradeAmount] = useState('');
  
  // Payment Hub State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentCurrency, setPaymentCurrency] = useState<'USDC' | 'USDT'>('USDC');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('Kenya');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [lessons] = useState<Lesson[]>([
    {
      id: 1,
      title: 'What is Cryptocurrency?',
      content: 'Cryptocurrency is digital money that uses cryptography for security. Unlike traditional currencies, it operates on decentralized networks called blockchains.',
      completed: false
    },
    {
      id: 2,
      title: 'Understanding Wallets',
      content: 'A crypto wallet stores your digital assets. It has a public address (like an email) for receiving funds and a private key (like a password) for accessing them.',
      completed: false
    },
    {
      id: 3,
      title: 'How to Trade',
      content: 'Trading involves buying crypto when prices are low and selling when high. Always research before investing and never invest more than you can afford to lose.',
      completed: false
    },
    {
      id: 4,
      title: 'Market Volatility',
      content: 'Crypto prices can change rapidly. This volatility creates opportunities but also risks. Practice with simulated money before using real funds.',
      completed: false
    },
    {
      id: 5,
      title: 'Cross-Border Payments',
      content: 'Stablecoins like USDC and USDT enable fast, low-cost international transfers. They can be converted to local mobile money, making remittances easier and cheaper.',
      completed: false
    }
  ]);

  const cryptoPrices: { [key: string]: number } = {
    BTC: 45000,
    ETH: 3000,
    SOL: 100,
    ADA: 0.5,
    USDC: 1,
    USDT: 1
  };

  const mobileMoneyRates: { [key: string]: { currency: string; rate: number; symbol: string } } = {
    Kenya: { currency: 'KES', rate: 130, symbol: 'KSh' },
    Nigeria: { currency: 'NGN', rate: 750, symbol: '₦' },
    Ghana: { currency: 'GHS', rate: 12, symbol: 'GH₵' },
    Uganda: { currency: 'UGX', rate: 3700, symbol: 'USh' },
    Tanzania: { currency: 'TZS', rate: 2500, symbol: 'TSh' }
  };

  const handleTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) return;

    const price = cryptoPrices[selectedCrypto];
    const totalCost = amount * price;

    if (type === 'buy') {
      if (totalCost > balance) {
        alert('Insufficient balance!');
        return;
      }
      setBalance(balance - totalCost);
      setPortfolio({
        ...portfolio,
        [selectedCrypto]: (portfolio[selectedCrypto] || 0) + amount
      });
    } else {
      if (!portfolio[selectedCrypto] || portfolio[selectedCrypto] < amount) {
        alert('Insufficient crypto holdings!');
        return;
      }
      setBalance(balance + totalCost);
      setPortfolio({
        ...portfolio,
        [selectedCrypto]: portfolio[selectedCrypto] - amount
      });
    }

    setTrades([
      {
        id: trades.length + 1,
        type,
        crypto: selectedCrypto,
        amount,
        price,
        timestamp: new Date()
      },
      ...trades
    ]);
    setTradeAmount('');
  };

  const handleSendPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !recipientName || !recipientPhone) {
      alert('Please fill all fields!');
      return;
    }

    const stablecoinBalance = portfolio[paymentCurrency] || 0;
    if (stablecoinBalance < amount) {
      alert(`Insufficient ${paymentCurrency} balance! You need to buy some first.`);
      return;
    }

    setProcessingPayment(true);

    // Simulate payment processing
    const newPayment: Payment = {
      id: payments.length + 1,
      from: paymentCurrency,
      to: mobileMoneyRates[recipientCountry].currency,
      amount,
      currency: paymentCurrency,
      status: 'pending',
      timestamp: new Date(),
      recipient: recipientName,
      phone: recipientPhone
    };

    setPayments([newPayment, ...payments]);

    // Deduct from portfolio
    setPortfolio({
      ...portfolio,
      [paymentCurrency]: stablecoinBalance - amount
    });

    // Simulate processing stages
    setTimeout(() => {
      setPayments(prev => prev.map(p => 
        p.id === newPayment.id ? { ...p, status: 'processing' } : p
      ));
    }, 1000);

    setTimeout(() => {
      setPayments(prev => prev.map(p => 
        p.id === newPayment.id ? { ...p, status: 'completed' } : p
      ));
      setProcessingPayment(false);
      setPaymentAmount('');
      setRecipientName('');
      setRecipientPhone('');
      alert(`Payment sent! ${recipientName} will receive ${mobileMoneyRates[recipientCountry].symbol}${(amount * mobileMoneyRates[recipientCountry].rate).toFixed(2)}`);
    }, 3000);
  };

  const getPortfolioValue = () => {
    return Object.entries(portfolio).reduce((total, [crypto, amount]) => {
      return total + (amount * cryptoPrices[crypto]);
    }, 0);
  };

  const totalValue = balance + getPortfolioValue();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold mb-2">🪙 Crypto Onboarding Simulator</h1>
          <p className="text-purple-200">Learn crypto trading risk-free with fake money!</p>
        </div>

        {/* Total Portfolio Value */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="text-center">
            <p className="text-sm text-purple-200 mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold">${totalValue.toFixed(2)}</p>
            <p className="text-sm text-green-400 mt-2">
              {totalValue >= 10000 ? '+' : ''}{((totalValue - 10000) / 10000 * 100).toFixed(2)}% from start
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <button
            onClick={() => setCurrentView('wallet')}
            className={`py-3 px-4 rounded-xl font-semibold transition-all ${
              currentView === 'wallet'
                ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            💼 Wallet
          </button>
          <button
            onClick={() => setCurrentView('trade')}
            className={`py-3 px-4 rounded-xl font-semibold transition-all ${
              currentView === 'trade'
                ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            📈 Trade
          </button>
          <button
            onClick={() => setCurrentView('payments')}
            className={`py-3 px-4 rounded-xl font-semibold transition-all ${
              currentView === 'payments'
                ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            🌍 Payments
          </button>
          <button
            onClick={() => setCurrentView('lessons')}
            className={`py-3 px-4 rounded-xl font-semibold transition-all ${
              currentView === 'lessons'
                ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            📚 Lessons
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {currentView === 'wallet' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Wallet</h2>
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                  <p className="text-sm text-green-200">Cash Balance</p>
                  <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Crypto Holdings</h3>
                  {Object.keys(portfolio).length === 0 ? (
                    <p className="text-purple-200 text-center py-8">No crypto holdings yet. Start trading!</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(portfolio).map(([crypto, amount]) => (
                        <div key={crypto} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{crypto}</p>
                            <p className="text-sm text-purple-200">{amount.toFixed(6)} coins</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${(amount * cryptoPrices[crypto]).toFixed(2)}</p>
                            <p className="text-sm text-purple-200">${cryptoPrices[crypto].toFixed(2)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === 'trade' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Trade Crypto</h2>
              
              {/* Trading Interface */}
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Select Cryptocurrency</label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  >
                    {Object.entries(cryptoPrices).map(([crypto, price]) => (
                      <option key={crypto} value={crypto} className="bg-purple-900">
                        {crypto} - ${price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Amount</label>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                    step="0.000001"
                  />
                  {tradeAmount && (
                    <p className="text-sm text-purple-200 mt-2">
                      Total: ${(parseFloat(tradeAmount) * cryptoPrices[selectedCrypto]).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleTrade('buy')}
                    className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => handleTrade('sell')}
                    className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Trade History */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Recent Trades</h3>
                {trades.length === 0 ? (
                  <p className="text-purple-200 text-center py-8">No trades yet. Make your first trade!</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {trades.map((trade) => (
                      <div key={trade.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            <span className={trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                              {trade.type.toUpperCase()}
                            </span>{' '}
                            {trade.crypto}
                          </p>
                          <p className="text-sm text-purple-200">
                            {trade.amount.toFixed(6)} @ ${trade.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(trade.amount * trade.price).toFixed(2)}</p>
                          <p className="text-xs text-purple-200">
                            {trade.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">🌍 Cross-Border Payment Hub</h2>
              <p className="text-purple-200 mb-6">Send USDC/USDT to mobile money instantly</p>
              
              {/* Payment Form */}
              <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Send Money</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Select Stablecoin</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPaymentCurrency('USDC')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                          paymentCurrency === 'USDC'
                            ? 'bg-blue-500 shadow-lg'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        USDC
                        <div className="text-xs mt-1 opacity-80">
                          Balance: {(portfolio['USDC'] || 0).toFixed(2)}
                        </div>
                      </button>
                      <button
                        onClick={() => setPaymentCurrency('USDT')}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                          paymentCurrency === 'USDT'
                            ? 'bg-green-500 shadow-lg'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        USDT
                        <div className="text-xs mt-1 opacity-80">
                          Balance: {(portfolio['USDT'] || 0).toFixed(2)}
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Amount (USD)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      disabled={processingPayment}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Recipient Country</label>
                    <select
                      value={recipientCountry}
                      onChange={(e) => setRecipientCountry(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      disabled={processingPayment}
                    >
                      {Object.keys(mobileMoneyRates).map((country) => (
                        <option key={country} value={country} className="bg-purple-900">
                          {country} ({mobileMoneyRates[country].currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Recipient Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      disabled={processingPayment}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Mobile Money Number</label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+254712345678"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                      disabled={processingPayment}
                    />
                  </div>

                  {paymentAmount && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-purple-200">You send:</span>
                        <span className="font-semibold">${parseFloat(paymentAmount).toFixed(2)} {paymentCurrency}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-purple-200">Exchange rate:</span>
                        <span className="font-semibold">1 USD = {mobileMoneyRates[recipientCountry].symbol}{mobileMoneyRates[recipientCountry].rate}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/20">
                        <span className="text-sm text-purple-200">Recipient gets:</span>
                        <span className="font-bold text-green-400 text-lg">
                          {mobileMoneyRates[recipientCountry].symbol}{(parseFloat(paymentAmount) * mobileMoneyRates[recipientCountry].rate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSendPayment}
                    disabled={processingPayment}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                      processingPayment
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg'
                    }`}
                  >
                    {processingPayment ? '⏳ Processing...' : '💸 Send Payment'}
                  </button>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Payment History</h3>
                {payments.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-xl">
                    <p className="text-purple-200 mb-2">No payments yet</p>
                    <p className="text-sm text-purple-300">Buy some USDC or USDT first, then send money!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{payment.recipient}</p>
                            <p className="text-sm text-purple-200">{payment.phone}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            payment.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {payment.status === 'completed' ? '✓ Completed' :
                             payment.status === 'processing' ? '⏳ Processing' :
                             '⏱ Pending'}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-200">
                            ${payment.amount.toFixed(2)} {payment.currency} → {payment.to}
                          </span>
                          <span className="text-purple-300">
                            {payment.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                <p className="text-sm">
                  ⚡ <strong>Fast & Cheap:</strong> Send money across borders in seconds with minimal fees. 
                  Recipients get mobile money directly to their phones!
                </p>
              </div>
            </div>
          )}

          {currentView === 'lessons' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Learn Crypto Basics</h2>
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-purple-200 leading-relaxed">{lesson.content}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                <p className="text-sm">
                  💡 <strong>Pro Tip:</strong> Practice trading in the simulator before using real money. 
                  Learn how market movements affect your portfolio without any risk!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





