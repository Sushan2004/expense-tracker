import PropTypes from 'prop-types';
import Icon from './Icon.jsx';

const CATEGORY_ICON = {
  'cat-food': 'coffee',
  'cat-transport': 'car',
  'cat-shopping': 'bag',
  'cat-home': 'home',
  'cat-subs': 'repeat',
  'cat-fun': 'film',
  'cat-health': 'heart',
  'cat-other': 'sparkle',
};

export default function CategoryIcon({ categoryId, size = 16 }) {
  const name = CATEGORY_ICON[categoryId] || 'sparkle';
  return <Icon name={name} size={size} strokeWidth={1.6} />;
}

CategoryIcon.propTypes = {
  categoryId: PropTypes.string,
  size: PropTypes.number,
};
