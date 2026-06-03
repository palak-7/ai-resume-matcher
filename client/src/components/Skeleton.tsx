const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
)

export const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                    {[0, 1, 2].map(j => (
                        <div key={j} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
)

export default Skeleton