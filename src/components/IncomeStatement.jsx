import React, { useState, useEffect } from 'react';
import { getIncomeStatement } from '../apiService';

const IncomeStatement = () => {
  const [incomeStatement, setIncomeStatement] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Sort states
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [filterRevenue, setFilterRevenue] = useState({ min: '', max: '' });
  const [filterNetIncome, setFilterNetIncome] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchIncomeStatement = async () => {
      try {
        const data = await getIncomeStatement();
        setIncomeStatement(data);
        setFilteredData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomeStatement();
  }, []);

  if (loading) return <div className="text-center text-xl">Loading...</div>;
  if (error) return <div className="text-center text-xl text-red-500">Error: {error}</div>;

  // Format the number for currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle Filters
  const handleFilterChange = () => {
    let filtered = [...incomeStatement];

    // Filter by Date Range
    if (filterDateRange.start || filterDateRange.end) {
      const startDate = filterDateRange.start ? new Date(filterDateRange.start) : null;
      const endDate = filterDateRange.end ? new Date(filterDateRange.end) : null;
      filtered = filtered.filter((item) => {
        const date = new Date(item.date);
        return (
          (!startDate || date >= startDate) &&
          (!endDate || date <= endDate)
        );
      });
    }

    // Filter by Revenue Range
    if (filterRevenue.min || filterRevenue.max) {
      const minRevenue = filterRevenue.min ? parseFloat(filterRevenue.min) : null;
      const maxRevenue = filterRevenue.max ? parseFloat(filterRevenue.max) : null;
      filtered = filtered.filter((item) => {
        return (
          (!minRevenue || item.revenue >= minRevenue) &&
          (!maxRevenue || item.revenue <= maxRevenue)
        );
      });
    }

    // Filter by Net Income Range
    if (filterNetIncome.min || filterNetIncome.max) {
      const minNetIncome = filterNetIncome.min ? parseFloat(filterNetIncome.min) : null;
      const maxNetIncome = filterNetIncome.max ? parseFloat(filterNetIncome.max) : null;
      filtered = filtered.filter((item) => {
        return (
          (!minNetIncome || item.netIncome >= minNetIncome) &&
          (!maxNetIncome || item.netIncome <= maxNetIncome)
        );
      });
    }

    setFilteredData(filtered);
  };

  // Handle Sorting
  const handleSort = (column) => {
    const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setSortBy(column);

    const sortedData = [...filteredData].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });

    setFilteredData(sortedData);
  };

  // Reset Filters and Sort
  const handleReset = () => {
    setFilterDateRange({ start: '', end: '' });
    setFilterRevenue({ min: '', max: '' });
    setFilterNetIncome({ min: '', max: '' });
    setSortBy(null);
    setSortOrder('asc');
    setFilteredData(incomeStatement); // Reset to the original data
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-semibold text-center mb-6">Income Statement</h2>

      {/* Filters */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="flex flex-col sm:flex-row sm:space-x-2">
            <input
              type="date"
              value={filterDateRange.start}
              onChange={(e) => setFilterDateRange({ ...filterDateRange, start: e.target.value })}
              className="p-2 border border-gray-300 rounded mb-2 sm:mb-0"
            />
            <input
              type="date"
              value={filterDateRange.end}
              onChange={(e) => setFilterDateRange({ ...filterDateRange, end: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Revenue Range</label>
          <div className="flex flex-col sm:flex-row sm:space-x-2">
            <input
              type="number"
              value={filterRevenue.min}
              onChange={(e) => setFilterRevenue({ ...filterRevenue, min: e.target.value })}
              className="p-2 border border-gray-300 rounded mb-2 sm:mb-0"
              placeholder="Min"
            />
            <input
              type="number"
              value={filterRevenue.max}
              onChange={(e) => setFilterRevenue({ ...filterRevenue, max: e.target.value })}
              className="p-2 border border-gray-300 rounded"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Net Income Range</label>
          <div className="flex flex-col sm:flex-row sm:space-x-2">
            <input
              type="number"
              value={filterNetIncome.min}
              onChange={(e) => setFilterNetIncome({ ...filterNetIncome, min: e.target.value })}
              className="p-2 border border-gray-300 rounded mb-2 sm:mb-0"
              placeholder="Min"
            />
            <input
              type="number"
              value={filterNetIncome.max}
              onChange={(e) => setFilterNetIncome({ ...filterNetIncome, max: e.target.value })}
              className="p-2 border border-gray-300 rounded"
              placeholder="Max"
            />
          </div>
        </div>

        <div className="flex items-center justify-center mt-4 sm:col-span-3 space-x-4">
          <button
            onClick={handleFilterChange}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th
                className="px-4 py-2 border-b text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-2 border-b text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('revenue')}
              >
                Revenue {sortBy === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-2 border-b text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort('netIncome')}
              >
                Net Income {sortBy === 'netIncome' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">Gross Profit</th>
              <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">EPS</th>
              <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">Operating Income</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((statement, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-sm text-gray-900">{statement.date}</td>
                <td className="px-4 py-2 border-b text-sm text-gray-900">{formatCurrency(statement.revenue)}</td>
                <td className="px-4 py-2 border-b text-sm text-gray-900">{formatCurrency(statement.netIncome)}</td>
                <td className="px-4 py-2 border-b text-sm text-gray-900">{formatCurrency(statement.grossProfit)}</td>
                <td className="px-4 py-2 border-b text-sm text-gray-900">{statement.eps}</td>
                <td className="px-4 py-2 border-b text-sm text-gray-900">{formatCurrency(statement.operatingIncome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeStatement;
