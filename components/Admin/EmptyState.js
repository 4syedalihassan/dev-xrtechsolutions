/**
 * EmptyState Component
 *
 * A reusable empty state component for displaying when no data is available.
 *
 * Features:
 * - Customizable icon/illustration
 * - Title and description text
 * - Optional action button
 * - Multiple size variants (sm, md, lg)
 * - Semantic HTML structure
 * - Accessible with proper ARIA labels
 *
 * WCAG Compliance:
 * - 1.3.1 Info and Relationships (Level A) - Semantic structure
 * - 2.4.6 Headings and Labels (Level AA) - Clear headings
 * - 3.2.4 Consistent Identification (Level AA) - Consistent empty state patterns
 *
 * @component
 */

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  actionLabel,
  onAction,
  size = 'md',
  className = '',
}) {
  // Size classes
  const sizeClasses = {
    sm: 'empty-state-sm',
    md: 'empty-state-md',
    lg: 'empty-state-lg',
  };

  return (
    <div className={`empty-state ${sizeClasses[size]} ${className}`} role="region" aria-label="Empty state">
      {/* Icon/Illustration */}
      <div className="empty-state-icon" aria-hidden="true">
        {typeof icon === 'string' ? <span className="empty-state-emoji">{icon}</span> : icon}
      </div>

      {/* Title */}
      {title && <h3 className="empty-state-title">{title}</h3>}

      {/* Description */}
      {description && <p className="empty-state-description">{description}</p>}

      {/* Action Button */}
      {(action || (actionLabel && onAction)) && (
        <div className="empty-state-action">
          {action || (
            <button type="button" className="btn btn-primary" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Preset Empty States for common scenarios
 */

/**
 * NoResults - For empty search/filter results
 */
export function NoResults({ searchTerm, onClearFilters }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={
        searchTerm
          ? `No results match "${searchTerm}". Try adjusting your search.`
          : 'No results match your filters. Try adjusting your criteria.'
      }
      actionLabel={onClearFilters ? 'Clear Filters' : undefined}
      onAction={onClearFilters}
    />
  );
}

/**
 * NoData - For empty tables/lists
 */
export function NoData({ resourceName = 'items', onAdd }) {
  return (
    <EmptyState
      icon="📋"
      title={`No ${resourceName} yet`}
      description={`Get started by creating your first ${resourceName.toLowerCase()}.`}
      actionLabel={`Add ${resourceName}`}
      onAction={onAdd}
    />
  );
}

/**
 * NoCustomers - For empty customer list
 */
export function NoCustomers({ onAdd }) {
  return (
    <EmptyState
      icon="👥"
      title="No customers yet"
      description="Start building your customer base by adding your first customer."
      actionLabel="Add Customer"
      onAction={onAdd}
    />
  );
}

/**
 * NoProducts - For empty product catalog
 */
export function NoProducts({ onAdd }) {
  return (
    <EmptyState
      icon="🛍️"
      title="No products in catalog"
      description="Add products to your store to start selling."
      actionLabel="Add Product"
      onAction={onAdd}
    />
  );
}

/**
 * NoBuildings - For empty building list
 */
export function NoBuildings({ onAdd }) {
  return (
    <EmptyState
      icon="🏢"
      title="No buildings configured"
      description="Create your first building to get started with your WebXR environment."
      actionLabel="Add Building"
      onAction={onAdd}
    />
  );
}

/**
 * NoFurniture - For empty furniture inventory
 */
export function NoFurniture({ onAdd }) {
  return (
    <EmptyState
      icon="🪑"
      title="No furniture items"
      description="Add furniture and 3D models to populate your virtual spaces."
      actionLabel="Add Furniture"
      onAction={onAdd}
    />
  );
}

/**
 * NoSessions - For empty healthcare sessions
 */
export function NoSessions({ onAdd }) {
  return (
    <EmptyState
      icon="📅"
      title="No sessions scheduled"
      description="Schedule your first healthcare awareness session to educate participants."
      actionLabel="Schedule Session"
      onAction={onAdd}
    />
  );
}

/**
 * ErrorState - For error scenarios
 */
export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Something went wrong"
      description={message || 'An error occurred while loading data. Please try again.'}
      actionLabel={onRetry ? 'Try Again' : undefined}
      onAction={onRetry}
      size="md"
    />
  );
}

/**
 * PermissionDenied - For unauthorized access
 */
export function PermissionDenied() {
  return (
    <EmptyState
      icon="🔒"
      title="Access Denied"
      description="You don't have permission to view this content. Contact your administrator if you believe this is an error."
      size="md"
    />
  );
}

/**
 * ComingSoon - For features under development
 */
export function ComingSoon({ featureName = 'This feature' }) {
  return (
    <EmptyState
      icon="🚧"
      title="Coming Soon"
      description={`${featureName} is currently under development and will be available soon.`}
      size="md"
    />
  );
}

/**
 * Usage Examples:
 *
 * // Basic empty state
 * <EmptyState
 *   icon="📭"
 *   title="No messages"
 *   description="You don't have any messages yet."
 * />
 *
 * // With action button
 * <EmptyState
 *   icon="📝"
 *   title="No notes"
 *   description="Create your first note to get started."
 *   actionLabel="Create Note"
 *   onAction={() => setShowModal(true)}
 * />
 *
 * // Custom action component
 * <EmptyState
 *   icon="🎨"
 *   title="No designs"
 *   description="Upload your first design file."
 *   action={
 *     <div className="flex gap-2">
 *       <button className="btn btn-primary">Upload File</button>
 *       <button className="btn btn-outline">Learn More</button>
 *     </div>
 *   }
 * />
 *
 * // Small size variant
 * <EmptyState
 *   icon="🔍"
 *   title="No results"
 *   description="Try different search terms."
 *   size="sm"
 * />
 *
 * // Using preset components
 * <NoCustomers onAdd={() => setShowAddModal(true)} />
 * <NoProducts onAdd={() => router.push('/admin/products/new')} />
 * <NoResults searchTerm={query} onClearFilters={handleClearFilters} />
 * <ErrorState message={error.message} onRetry={refetch} />
 * <PermissionDenied />
 * <ComingSoon featureName="Analytics Dashboard" />
 */
