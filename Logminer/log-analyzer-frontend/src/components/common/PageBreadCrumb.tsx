import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  title: string;
  path: string;
}

interface PageBreadcrumbProps {
  items?: BreadcrumbItem[]; // Rend la prop optionnelle
  pageTitle: string;
}

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ 
  items = [], // Valeur par défaut
  pageTitle 
}) => {
  if (!items.length) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {pageTitle}
        </h2>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Link
              href={item.path}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              {item.title}
            </Link>
            {index < items.length - 1 && (
              <svg
                className="mx-2 stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </React.Fragment>
        ))}
      </nav>
      
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
        {pageTitle}
      </h2>
    </div>
  );
};

export default PageBreadcrumb;