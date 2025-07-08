import React from 'react';
import { calculateEcoScoreForProduct, getEcoScoreRating } from '@/lib/ecoScore';
import { Product } from '@/lib/products';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Leaf } from 'lucide-react';

interface EcoScoreBadgeProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  compact?: boolean; // For compact mode (grade only)
  className?: string;
  showBreakdown?: boolean; // Whether to show breakdown on click
}

const EcoScoreBadge: React.FC<EcoScoreBadgeProps> = ({ 
  product, 
  size = 'md', 
  showDescription = false,
  compact = false,
  className = '',
  showBreakdown = true
}) => {
  const ecoScore = calculateEcoScoreForProduct(product) as any;
  const rating = getEcoScoreRating(ecoScore.total || ecoScore.totalScore || 50);

  const sizeClasses = {
    sm: compact ? 'text-sm px-2 py-1.5 shadow-lg' : 'text-xs px-3 py-1.5 shadow-lg',
    md: compact ? 'text-base px-3 py-2 shadow-lg' : 'text-sm px-3 py-1.5 shadow-lg',
    lg: compact ? 'text-lg px-4 py-2.5 shadow-lg' : 'text-base px-4 py-2 shadow-lg'
  };

  const gradeSizeClasses = {
    sm: compact ? 'text-lg font-bold' : 'text-lg font-bold',
    md: compact ? 'text-xl font-bold' : 'text-xl font-bold',
    lg: compact ? 'text-2xl font-bold' : 'text-2xl font-bold'
  };

  // Extract individual metric scores from the eco score breakdown
  const getMetricScores = () => {
    return {
      carbonFootprint: ecoScore.carbonScore || 0,
      materialSustainability: ecoScore.materialSustainability || 0,
      manufacturingEnergy: ecoScore.manufacturingEnergy || 0,
      packagingTransport: ecoScore.packagingTransport || 0,
      endOfLife: ecoScore.endOfLife || 0
    };
  };

  const metricScores = getMetricScores();

  // Detailed breakdown component
  const EcoScoreBreakdown = () => (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: rating.color }}>
          {rating.grade}
        </div>
        <div className="text-sm text-gray-600">{rating.description}</div>
        <div className="text-xs text-gray-500 mt-1">{rating.equivalent}</div>
        <div className="text-lg font-semibold mt-2" style={{ color: rating.color }}>
          {Math.round(ecoScore.total || ecoScore.totalScore || 50)}/100
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Carbon Footprint</span>
            <span>{metricScores.carbonFootprint}%</span>
          </div>

          <div 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${metricScores.carbonFootprint}%`,
                backgroundColor: rating.color 
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Materials</span>
            <span>{metricScores.materialSustainability}%</span>
          </div>
          <div 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${metricScores.materialSustainability}%`,
                backgroundColor: rating.color 
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Manufacturing</span>
            <span>{metricScores.manufacturingEnergy}%</span>
          </div>
          <div 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${metricScores.manufacturingEnergy}%`,
                backgroundColor: rating.color 
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Transport</span>
            <span>{metricScores.packagingTransport}%</span>
          </div>
          <div 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${metricScores.packagingTransport}%`,
                backgroundColor: rating.color 
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>End of Life</span>
            <span>{metricScores.endOfLife}%</span>
          </div>
          <div 
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            style={{ backgroundColor: '#f3f4f6' }}
          >
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${metricScores.endOfLife}%`,
                backgroundColor: rating.color 
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Higher scores indicate better environmental impact
      </div>
    </div>
  );

  // Compact mode - show only grade letter
  if (compact) {
    const BadgeContent = () => (
      <div 
        className={`inline-flex items-center justify-center rounded-full font-bold ${sizeClasses[size]} ${className}`}
        style={{ 
          backgroundColor: `${rating.color}20`, 
          color: rating.color, 
          border: `2px solid ${rating.color}`,
          backdropFilter: 'blur(4px)',
          boxShadow: `0 0 10px ${rating.color}40, 0 2px 4px rgba(0,0,0,0.1)`
        }}
      >
        <div className={`${gradeSizeClasses[size]}`}>
          {rating.grade}
        </div>
      </div>
    );

    if (showBreakdown) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="cursor-pointer">
              <BadgeContent />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <EcoScoreBreakdown />
          </PopoverContent>
        </Popover>
      );
    }

    return <BadgeContent />;
  }

  // Full mode - show grade and description
  const BadgeContent = () => (
    <div 
      className={`inline-flex items-center gap-2 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: `${rating.color}15`, 
        color: rating.color, 
        border: `1px solid ${rating.color}30`,
        backdropFilter: 'blur(4px)',
        boxShadow: `0 0 10px ${rating.color}40, 0 2px 4px rgba(0,0,0,0.1)`
      }}
    >
      <Leaf className="w-4 h-4" />
      
      {/* Grade Letter */}
      <div className={`${gradeSizeClasses[size]}`}>
        {rating.grade}
      </div>
      
      {/* Description */}
      <div className="flex flex-col">
        <span className="font-semibold">{rating.description}</span>
        {showDescription && (
          <span className="text-xs opacity-80">{rating.equivalent}</span>
        )}
      </div>
    </div>
  );

  if (showBreakdown) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="cursor-pointer">
            <BadgeContent />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <EcoScoreBreakdown />
        </PopoverContent>
      </Popover>
    );
  }

  return <BadgeContent />;
};

export default EcoScoreBadge; 