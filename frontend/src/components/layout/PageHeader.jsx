import { ChevronRight } from "lucide-react";
import { Link } from "react-router";


const PageHeader = ({
  title,
  description,
  breadcrumbs = [],
  action,
  icon: Icon,
}) => {
  return (
    <div className="mb-6">

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto">

          {breadcrumbs.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex shrink-0 items-center gap-1.5"
            >

              {index > 0 && (
                <ChevronRight
                  size={13}
                  className="text-slate-300"
                />
              )}

              {item.path ? (
                <Link
                  to={item.path}
                  className="
                    text-[11px]
                    font-medium
                    text-slate-400

                    transition-colors

                    hover:text-blue-600
                  "
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="
                    text-[11px]
                    font-medium
                    text-slate-500
                  "
                >
                  {item.label}
                </span>
              )}

            </div>
          ))}

        </div>
      )}


      {/* Main header */}
      <div
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div className="flex min-w-0 items-center gap-3">

          {Icon && (
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center

                rounded-xl

                bg-blue-50
                text-blue-600

                shadow-sm

                transition-all
                duration-300

                hover:scale-105
                hover:bg-blue-100
              "
            >
              <Icon size={21} />
            </div>
          )}

          <div className="min-w-0">

            <h1
              className="
                truncate

                text-xl
                font-bold
                tracking-tight

                text-[#09284d]

                sm:text-2xl
              "
            >
              {title}
            </h1>

            {description && (
              <p
                className="
                  mt-1
                  max-w-2xl

                  text-xs
                  leading-5

                  text-slate-500

                  sm:text-sm
                "
              >
                {description}
              </p>
            )}

          </div>

        </div>


        {/* Action */}
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}

      </div>

    </div>
  );
};

export default PageHeader;