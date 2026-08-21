import { Link } from "react-router-dom";

export default function ServiceCard({ service }) {
  return (
    <Link to={`/services#${service.slug}`} className="card group flex flex-col">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-teal-50 text-2xl text-teal-600">
        {service.icon ? <img src={service.icon} alt="" className="h-6 w-6" /> : "🔧"}
      </div>
      <h3 className="mb-2 font-semibold text-navy-800 group-hover:text-teal-600">{service.name}</h3>
      <p className="flex-1 text-sm text-navy-500">{service.shortDescription}</p>
      <span className="mt-4 text-sm font-semibold text-teal-600">Learn more →</span>
    </Link>
  );
}
