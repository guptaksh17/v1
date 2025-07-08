import React from 'react';
import { Leaf, Info } from 'lucide-react';
import { calculateEcoScore, getEcoScoreRating, EcoScoreBreakdown } from '@/lib/ecoScore';
import { Product } from '@/lib/products';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EcoScoreProps {
  product: Product;
  size?: 'small' | 'medium' | 'large';
  showBreakdown?: boolean;
  className?: string;
}

export const EcoScore: React.FC<EcoScoreProps> = ({
  product,
  size = 'medium',
  showBreakdown = false,
  className = ''
}) => {
  const ecoScore = calculateEcoScore(product);
  const rating = getEcoScoreRating(ecoScore.total);

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const badgeSizes = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const EcoScoreBadge = () => (
    <Badge 
      className={`${badgeSizes[size]} font-semibold border-2`}
      style={{ 
        backgroundColor: rating.color,
        borderColor: rating.color,
        color: 'white'
      }}
    >
      <Leaf className={`${sizeClasses[size]} mr-1`} />
      {rating.grade}
    </Badge>
  );

  const EcoScoreBreakdown = () => (
    <div className="space-y-4 p-4">
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: rating.color }}>
          {ecoScore.total}
        </div>
        <div className="text-sm text-gray-600">{rating.description}</div>
        <div className="text-xs text-gray-500 mt-1">{rating.equivalent}</div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Carbon Footprint</span>
            <span>{ecoScore.carbonFootprint}%</span>
          </div>
          <Progress value={ecoScore.carbonFootprint} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Materials</span>
            <span>{ecoScore.materialSustainability}%</span>
          </div>
          <Progress value={ecoScore.materialSustainability} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Manufacturing</span>
            <span>{ecoScore.manufacturingEnergy}%</span>
          </div>
          <Progress value={ecoScore.manufacturingEnergy} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Transport</span>
            <span>{ecoScore.packagingTransport}%</span>
          </div>
          <Progress value={ecoScore.packagingTransport} className="h-2" />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>End of Life</span>
            <span>{ecoScore.endOfLife}%</span>
          </div>
          <Progress value={ecoScore.endOfLife} className="h-2" />
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Higher scores indicate better environmental impact
      </div>
    </div>
  );

  if (showBreakdown) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className={`cursor-pointer ${className}`}>
            <EcoScoreBadge />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <EcoScoreBreakdown />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`cursor-pointer ${className}`}>
            <EcoScoreBadge />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <div className="font-semibold mb-1">Eco-Score: {rating.grade}</div>
            <div className="text-sm">{rating.description}</div>
            <div className="text-xs text-gray-500 mt-1">{rating.equivalent}</div>
            <div className="text-xs text-gray-400 mt-2">
              Click for detailed breakdown
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EcoScore; 