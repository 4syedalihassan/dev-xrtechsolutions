export default function TopProducts({ products = [], currencySymbol = 'Rs' }) {
  // Use props or fallback to empty array (no static data)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h2>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
              {product.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales} sales</p>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">{product.trend}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {currencySymbol} {(product.revenue / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
