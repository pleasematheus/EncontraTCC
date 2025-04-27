import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  // Não renderizar se houver apenas uma página
  if (totalPages <= 1) return null;

  // Função para criar array de páginas a mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Sempre mostrar a primeira página
    if (currentPage > 3) {
      pageNumbers.push(1);
    }
    
    // Mostrar "..." após a primeira página se estiver distante
    if (currentPage > 4) {
      pageNumbers.push('...');
    }
    
    // Mostrar páginas ao redor da página atual
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Mostrar "..." antes da última página se estiver distante
    if (currentPage < totalPages - 3) {
      pageNumbers.push('...');
    }
    
    // Sempre mostrar a última página se houver mais que uma página
    if (totalPages > 1 && currentPage < totalPages - 2) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className={`flex justify-center my-6 ${className}`}>
      <div className="join">
        {/* Botão Anterior */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="join-item btn btn-sm"
        >
          «
        </button>
        
        {/* Primeira página (se não estiver no array) */}
        {currentPage > 3 && (
          <button
            onClick={() => onPageChange(1)}
            className={`join-item btn btn-sm ${
              currentPage === 1 ? 'btn-active' : ''
            }`}
          >
            1
          </button>
        )}
        
        {/* Números de página */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return <span key={`ellipsis-${index}`} className="join-item btn btn-disabled btn-sm">...</span>;
          }
          
          return (
            <button
              key={`page-${page}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`join-item btn btn-sm ${
                currentPage === page ? 'btn-active' : ''
              }`}
            >
              {page}
            </button>
          );
        })}
        
        {/* Última página (se não estiver no array e tivermos mais de uma página) */}
        {totalPages > 1 && currentPage < totalPages - 2 && (
          <button
            onClick={() => onPageChange(totalPages)}
            className={`join-item btn btn-sm ${
              currentPage === totalPages ? 'btn-active' : ''
            }`}
          >
            {totalPages}
          </button>
        )}
        
        {/* Botão Próximo */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="join-item btn btn-sm"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;