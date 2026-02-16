import Sparkline from './Charts/Sparkline';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  trendText,
  gradient,
  iconBg,
  iconColor = 'text-white',
  sparklineData,
  sparklineColor,
  variant = 'default', // 'default', 'gradient', 'outlined'
  loading = false,
}) {
  // Determine trend color
  const trendColorClass = trendDirection === 'up'
    ? 'text-success-600 dark:text-success-400'
    : trendDirection === 'down'
    ? 'text-error-600 dark:text-error-400'
    : 'text-gray-600 dark:text-gray-400';

  // Trend icon
  const TrendIcon = () => {
    if (trendDirection === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trendDirection === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Gradient variant
  if (variant === 'gradient' && gradient) {
    return (
      <div
        className="rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-white relative overflow-hidden"
        style={{ background: gradient }}
      >
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white text-opacity-90 text-sm font-medium mb-1">
                {title}
              </p>
              <h3 className="text-3xl font-bold text-white">
                {value}
              </h3>
            </div>
            {Icon && (
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {trend && (
            <div className="flex items-center gap-1 text-white text-opacity-90">
              <TrendIcon />
              <span className="text-sm font-medium">{trend}</span>
              {trendText && <span className="text-sm ml-1">{trendText}</span>}
            </div>
          )}

          {sparklineData && (
            <div className="mt-3 -mx-2">
              <Sparkline data={sparklineData} color="rgba(255, 255, 255, 0.8)" height={40} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Outlined variant
  if (variant === 'outlined') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {value}
            </h3>

            {trend && (
              <div className={`flex items-center gap-1 ${trendColorClass}`}>
                <TrendIcon />
                <span className="text-sm font-medium">{trend}</span>
                {trendText && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                    {trendText}
                  </span>
                )}
              </div>
            )}
          </div>

          {Icon && (
            <div className={`w-12 h-12 ${iconBg || 'bg-primary-100 dark:bg-primary-900'} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor || 'text-primary-600 dark:text-primary-400'}`} />
            </div>
          )}
        </div>

        {sparklineData && (
          <div className="mt-4">
            <Sparkline data={sparklineData} color={sparklineColor || '#3b82f6'} height={40} />
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </h3>

          {trend && (
            <div className={`flex items-center gap-1 ${trendColorClass}`}>
              <TrendIcon />
              <span className="text-sm font-medium">{trend}</span>
              {trendText && (
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                  {trendText}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-12 h-12 ${iconBg || 'bg-primary-100 dark:bg-primary-900'} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor || 'text-primary-600 dark:text-primary-400'}`} />
          </div>
        )}
      </div>

      {sparklineData && (
        <div className="mt-4">
          <Sparkline data={sparklineData} color={sparklineColor || '#3b82f6'} height={40} />
        </div>
      )}
    </div>
  );
}
