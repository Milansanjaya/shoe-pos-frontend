interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorCls = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
    red: 'bg-red-500/10 text-red-400',
};

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'blue' }: StatCardProps) {
    return (
        <div className="card flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-white mt-1 truncate">{value}</p>
                {trend && (
                    <p className={`text-xs mt-1 font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </p>
                )}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorCls[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}
