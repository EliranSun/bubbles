import { useState } from 'react';
import useCategoryActivities from '../hooks/useCategoryActivities';

export default function CategoryPage({ category, title }) {
  const [draft, setDraft] = useState('');
  const { activities, addActivity, removeActivity } = useCategoryActivities(category);

  const handleSubmit = (event) => {
    event.preventDefault();
    addActivity(draft);
    setDraft('');
  };

  return (
    <section>
      <h1>{title}</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor={`${category}-activity`}>Add activity</label>
        <input
          id={`${category}-activity`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Add a ${title.toLowerCase()} activity`}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            {activity.title}
            <button type="button" onClick={() => removeActivity(activity.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
