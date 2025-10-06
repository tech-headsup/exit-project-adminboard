interface Stat {
  value: string | number;
  label: string;
}

interface CompanyStatsProps {
  stats: Stat[];
}

export default function CompanyStats({ stats }: CompanyStatsProps) {
  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white/90 text-xl font-normal">
                  {stat.value}
                </span>
              </div>
              <h3 className="text-gray-900 text-sm font-semibold flex-1">
                {stat.label}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
