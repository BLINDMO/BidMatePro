import Badge from '../ui/Badge';
import { getCategory } from '../../data/categories';
import { getCategoryIcon } from '../../data/categoryIcons';

export default function CategoryBadge({ categoryId, name }: { categoryId: string; name?: string }) {
  const cat = getCategory(categoryId);
  const label = name ?? cat?.name ?? categoryId;
  const color = cat?.color ?? '#8896B3';
  const Icon = getCategoryIcon(categoryId);
  return (
    <Badge color={color} bg={`${color}1f`}>
      <Icon size={12} />
      {label}
    </Badge>
  );
}
