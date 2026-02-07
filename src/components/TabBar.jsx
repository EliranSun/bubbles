import { NavLink } from 'react-router-dom';

const tabs = [
  { label: 'Friends', to: '/friends' },
  { label: 'Family', to: '/family' },
  { label: 'Household', to: '/household' },
  { label: 'Wife', to: '/wife' },
  { label: 'Creative', to: '/creative' },
];

export default function TabBar() {
  return (
    <nav aria-label="Activity Categories" className="tab-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to}
          className={({ isActive }) =>
            `tab-link${isActive ? ' tab-link--active' : ''}`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
