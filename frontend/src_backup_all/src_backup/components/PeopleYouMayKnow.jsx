// src/components/PeopleYouMayKnow.jsx
import React from 'react';
import './PeopleYouMayKnow.module.css';

const people = [
  { id: 1, name: 'Freddie Dunbar Jr.', avatar: '/logos/southernpower-logo.png' },
  { id: 2, name: 'Ty Singleton', avatar: '/logos/civicconnect-logo.png' },
  { id: 3, name: 'Felicia Greer', avatar: '/logos/texasgottalent-logo.png' },
];

const PeopleYouMayKnow = () => {
  return (
    <div className="people-box">
      <h4>People You May Know</h4>
      {people.map((person) => (
        <div className="person" key={person.id}>
          <img src={person.avatar} alt={person.name} />
          <span>{person.name}</span>
          <button>Add</button>
        </div>
      ))}
    </div>
  );
};

export default PeopleYouMayKnow;


