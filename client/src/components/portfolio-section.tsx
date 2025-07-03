import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PortfolioProject {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  clientName: string | null;
  completionDate: string | null;
  orderIndex: number;
  isActive: boolean;
}

export default function PortfolioSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 3;

  // Fetch active portfolio projects
  const { data: projects = [], isLoading } = useQuery<PortfolioProject[]>({
    queryKey: ['/api/portfolio-projects?active=true'],
    queryFn: async () => {
      const res = await fetch('/api/portfolio-projects?active=true');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = currentPage * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (projects.length > projectsPerPage) {
      const interval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
      }, 5000); // Change page every 5 seconds

      return () => clearInterval(interval);
    }
  }, [projects.length, projectsPerPage, totalPages]);

  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Projelerimiz</h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Tamamladığımız projelere göz atın ve kalitemizi görün.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz proje eklenmemiş.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation buttons */}
            {totalPages > 1 && (
              <>
                <button
                  onClick={prevPage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 md:-translate-x-16 z-10 bg-white rounded-full shadow-lg p-3 hover:shadow-xl hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <button
                  onClick={nextPage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 md:translate-x-16 z-10 bg-white rounded-full shadow-lg p-3 hover:shadow-xl hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
              </>
            )}

            {/* Projects grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProjects.map((project) => (
                <div key={project.id} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src={project.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'} 
                    alt={project.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      {project.category && (
                        <p className="text-sm text-gray-200">{project.category}</p>
                      )}
                      {project.clientName && (
                        <p className="text-xs text-gray-300 mt-1">{project.clientName}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Page indicators */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPage ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <a 
            href="https://wa.me/905551234567?text=Merhaba%20HD%20Reklam,%20portföyünüzdeki%20projeler%20hakkında%20detaylı%20bilgi%20almak%20istiyorum." 
            className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Detaylı Portföy İçin İletişime Geçin
          </a>
        </div>
      </div>
    </section>
  );
}
