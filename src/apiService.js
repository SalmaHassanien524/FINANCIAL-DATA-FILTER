const API_KEY = 'wiJwDezgg2dNWE3FzxJC9FcnDjwnE8Mf';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

export const getIncomeStatement = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/income-statement/0000320193?period=annual&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch income statement');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; 
  }
};

