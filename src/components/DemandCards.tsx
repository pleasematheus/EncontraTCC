// interface Technology {
//   name: string
//   isPrimary?: boolean
// }

interface Demand {
  id: number
  title: string
  institution: string
  description: string
  technologies: string[]
}

interface DemandCardsProps {
  demands: Demand[]
  title?: string
}

const DemandCards = ({ demands, title = "Demandas" }: DemandCardsProps) => {
  return (
    <div className="py-8 bg-base-200 border-t-[1px] border-base-300">
      <h2 className="text-center text-2xl font-bold mb-6">{title}</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {demands.map((demand) => (
          <div
            key={demand.id}
            className="card w-80 bg-base-100 shadow-xl border border-gray-200"
          >
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">
                {demand.title}
              </h3>
              <p className="text-gray-600">{demand.institution}</p>
              <p className="text-sm text-gray-500 mt-2">{demand.description}</p>
              {demand.technologies.map((tech, index) => (
                <div
                  key={index}
                  className={`badge ${
                    index % 2 === 0 ? "badge-primary" : "badge-secondary"
                  } mt-4 mr-2`}
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DemandCards
