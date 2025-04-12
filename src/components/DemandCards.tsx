interface Demand {
  id: string
  title: string
  institution: string
  type: string
  description: string
}

interface DemandCardsProps {
  demands: Demand[]
  title?: string
}

const DemandCards = ({ demands, title = "Demandas" }: DemandCardsProps) => {
  return (
    <section className="py-8 bg-base-200 border-t border-base-300">
      <h2 className="text-center text-2xl font-bold mb-6">{title}</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {demands.map((demand) => (
          <div
            key={demand.id}
            className="card w-80 bg-base-100 shadow-md border border-base-300"
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">{demand.title}</h3>
                <span className="badge badge-neutral text-sm">
                  {demand.type}
                </span>
              </div>
              <p className="text-gray-600 font-medium">{demand.institution}</p>
              <p className="text-sm text-gray-500 mt-2">{demand.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DemandCards