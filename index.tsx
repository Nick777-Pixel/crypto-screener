import { useState, useEffect } from 'react';
import axios from 'axios';

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

const stableCoins = ['tether', 'usd-coin', 'binance-usd', 'dai', 'trueusd'];

const filterAndAddDogecoin = (cryptos: Cryptocurrency[]): Cryptocurrency[] => {
  const filteredCryptos = cryptos.filter(crypto => !stableCoins.includes(crypto.id)).slice(0, 4);
  const dogecoin = cryptos.find(crypto => crypto.id === 'dogecoin');
  if (dogecoin) {
    filteredCryptos.push(dogecoin);
  }
  return filteredCryptos;
};

export default function Home() {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 15,
              page: 1,
              sparkline: false,
              price_change_percentage: '24h',
            },
          }
        );
        const filteredCryptos = filterAndAddDogecoin(response.data);
        setCryptocurrencies(filteredCryptos);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 180000); // Refresh every 3 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-gray-500 mb-6 text-center">Last updated: {lastUpdated}</p>
        <div className="space-y-3">
          {cryptocurrencies.map((crypto) => (
            <div key={crypto.id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8 mr-3" />
                  <div>
                    <h2 className="text-base font-medium text-gray-900">{crypto.name}</h2>
                    <p className="text-xs text-gray-500">{crypto.symbol.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">${crypto.current_price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">MCap: ${(crypto.market_cap / 1e9).toFixed(2)}B</p>
                  <p className={`text-xs font-medium ${crypto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
