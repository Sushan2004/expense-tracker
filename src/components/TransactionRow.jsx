import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon.jsx';
import { formatCurrency } from '../utils/format.js';

export default function TransactionRow({ transaction, category, account, active = false, asLink = true }) {
  const isIncome = transaction.type === 'income';
  const sign = isIncome ? '+' : '−';
  const meta = [
    category?.name,
    account?.name?.replace('Main Checking', 'Main'),
    transaction.recurring ? 'Recurring' : null,
  ].filter(Boolean).join(' · ');

  const inner = (
    <>
      <span className={`trow__icon${isIncome ? ' trow__icon--income' : ''}`}>
        <CategoryIcon categoryId={transaction.categoryId} size={15} />
      </span>
      <span className="trow__main">
        <span className="trow__merchant">{transaction.merchant}</span>
        <span className="trow__meta">{meta}</span>
      </span>
      <span className={`trow__amount tnum${isIncome ? ' trow__amount--income' : ''}`}>
        {sign}
        {formatCurrency(Math.abs(transaction.amount))}
      </span>
    </>
  );

  if (!asLink) {
    return <div className={`trow${active ? ' is-active' : ''}`}>{inner}</div>;
  }

  return (
    <Link
      to={`/transactions/${transaction.id}`}
      className={`trow${active ? ' is-active' : ''}`}
      aria-label={`${transaction.merchant}, ${sign}${Math.abs(transaction.amount)}`}
    >
      {inner}
    </Link>
  );
}

TransactionRow.propTypes = {
  transaction: PropTypes.object.isRequired,
  category: PropTypes.object,
  account: PropTypes.object,
  active: PropTypes.bool,
  asLink: PropTypes.bool,
};
